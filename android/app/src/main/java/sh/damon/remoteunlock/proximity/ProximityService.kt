package sh.damon.remoteunlock.proximity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.os.SystemClock
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.UUID

class ProximityService : Service() {

    private lateinit var store: ProximityConfigStore
    private lateinit var dispatcher: Dispatcher
    private lateinit var scanner: ProximityScanner
    private var motionGate: MotionGate? = null
    private val engines = mutableMapOf<String, ProximityEngine>()
    private val handler = Handler(Looper.getMainLooper())
    @Volatile private var scannerMode: ProximityScanner.Mode = ProximityScanner.Mode.LOW_POWER

    // Flip to true once MotionGate is reliable. While false, the scanner runs
    // unconditionally regardless of detected activity.
    private val motionGateEnabled = false

    override fun onCreate() {
        super.onCreate()
        store = ProximityConfigStore(applicationContext)

        // elapsedRealtime resets on reboot but persists across OOM-kill restarts.
        // Compare a stored boot-id derived from elapsedRealtime against the current
        // uptime to detect REAL reboots; only then clear lastManualLockAt.
        val nowElapsed = android.os.SystemClock.elapsedRealtime()
        val nowBootMs = System.currentTimeMillis() - nowElapsed   // boot timestamp in wall-clock ms
        val storedBootMs = store.bootId().toLongOrNull() ?: 0L
        // A real reboot shifts the inferred boot time. Allow ±5s slack for NTP wobble.
        val rebooted = storedBootMs == 0L || kotlin.math.abs(nowBootMs - storedBootMs) > 5_000L
        if (rebooted) {
            store.knownMacs().forEach { mac ->
                val c = store.get(mac)
                if (c.lastManualLockAt != 0L) store.set(mac, c.copy(lastManualLockAt = 0L))
            }
            store.setBootId(nowBootMs.toString())
        }

        dispatcher = Dispatcher(store, object : Dispatcher.Sinks {
            override fun postConfirmNotification(mac: String) {
                NotificationHelper.postConfirm(applicationContext, mac)
            }
            override fun startUnlockTask(mac: String) {
                ProximityHeadlessJsTaskService.enqueue(applicationContext, mac)
            }
        })
        scanner = ProximityScanner(buildScannerSource())
        scanner.setListener { mac, rssi, t -> onScan(mac, rssi, t) }

        if (motionGateEnabled) {
            val gate = MotionGate(ActivityRecognitionSourceImpl(applicationContext))
            gate.subscribe { state ->
                if (state == MotionGate.MotionState.MOVING) {
                    scanner.start(scannerMode)
                } else {
                    scanner.stop()
                }
            }
            if (!hasActivityRecognitionPermission()) {
                gate.onPermissionDenied()
            }
            motionGate = gate
        }

        if (!hasRequiredPermissions()) {
            // Stop self; user must grant perms before service can run.
            stopSelf()
            return
        }

        startForegroundInternal()
        if (!motionGateEnabled) {
            // No gate: start scanning immediately and let mode escalation drive itself.
            scanner.start(scannerMode)
        }
        handler.post(tickRunnable)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForegroundInternal()
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(tickRunnable)
        motionGate?.unsubscribe()
        scanner.stop()
    }

    override fun onBind(intent: Intent?) = null

    private fun startForegroundInternal() {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(NotificationChannel(
                CHANNEL, "Proximity", NotificationManager.IMPORTANCE_LOW
            ))
        }
        val notif: Notification = NotificationCompat.Builder(this, CHANNEL)
            .setContentTitle("Proximity active")
            .setContentText("Watching for nearby vehicle")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIF_ID, notif,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE or
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(NOTIF_ID, notif)
        }
    }

    private fun onScan(mac: String, rssi: Int, t: Long) {
        val cfg = store.get(mac)
        if (!cfg.enabled) return
        val engine = engines.getOrPut(mac) { ProximityEngine(cfg) }
        engine.updateConfig(cfg)
        engine.push(rssi, t)?.let { dispatcher.onEvent(mac, it) }

        val targetMode = decideScannerMode()
        if (targetMode != scannerMode) {
            scannerMode = targetMode
            scanner.start(targetMode)
        }
    }

    private fun decideScannerMode(): ProximityScanner.Mode {
        // If any engine is currently in NEAR state, stay in LOW_LATENCY for fast EXIT detection.
        // Otherwise, if any has recent samples (< 5s old), use LOW_LATENCY for predictive accuracy.
        val now = SystemClock.elapsedRealtime()
        val hot = engines.values.any {
            it.state == ProximityEngine.State.NEAR ||
            (now - it.lastSampleAtMs() < 5_000L)
        }
        return if (hot) ProximityScanner.Mode.LOW_LATENCY else ProximityScanner.Mode.LOW_POWER
    }

    private fun hasActivityRecognitionPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return true
        return checkSelfPermission(android.Manifest.permission.ACTIVITY_RECOGNITION) ==
               android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    private fun hasRequiredPermissions(): Boolean {
        val pm = android.content.pm.PackageManager.PERMISSION_GRANTED
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (checkSelfPermission(android.Manifest.permission.BLUETOOTH_SCAN) != pm) return false
            if (checkSelfPermission(android.Manifest.permission.BLUETOOTH_CONNECT) != pm) return false
        }
        if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) != pm) return false
        return true
    }

    private val tickRunnable = object : Runnable {
        override fun run() {
            val now = SystemClock.elapsedRealtime()
            engines.forEach { (mac, e) ->
                e.tick(now)?.let { dispatcher.onEvent(mac, it) }
            }
            store.recordHeartbeat(System.currentTimeMillis())
            handler.postDelayed(this, 5_000L)
        }
    }

    private fun buildScannerSource(): ProximityScanner.ScannerSource =
        object : ProximityScanner.ScannerSource {
            private var cb: ScanCallback? = null
            override fun startScan(mode: Int, listener: (String, Int, Long) -> Unit) {
                val adapter = BluetoothAdapter.getDefaultAdapter() ?: return
                val ble = adapter.bluetoothLeScanner ?: return
                val filter = ScanFilter.Builder()
                    .setServiceUuid(ParcelUuid(UUID.fromString(ProximityScanner.DOOR_SERVICE_UUID)))
                    .build()
                val settings = ScanSettings.Builder()
                    .setScanMode(if (mode == ProximityScanner.SCAN_MODE_LOW_LATENCY)
                        ScanSettings.SCAN_MODE_LOW_LATENCY else ScanSettings.SCAN_MODE_LOW_POWER)
                    .setLegacy(false)
                    .build()
                cb = object : ScanCallback() {
                    override fun onScanResult(callbackType: Int, result: ScanResult) {
                        listener(result.device.address, result.rssi, SystemClock.elapsedRealtime())
                    }
                }
                try { ble.startScan(listOf(filter), settings, cb) } catch (e: SecurityException) {
                    Log.w("ProximityService", "scan permission denied", e)
                }
            }
            override fun stopScan() {
                val adapter = BluetoothAdapter.getDefaultAdapter() ?: return
                val ble = adapter.bluetoothLeScanner ?: return
                try { ble.stopScan(cb) } catch (e: SecurityException) { }
                cb = null
            }
            override fun nowMs() = SystemClock.elapsedRealtime()
        }

    companion object {
        private const val CHANNEL = "proximity"
        private const val NOTIF_ID = 4242
    }
}
