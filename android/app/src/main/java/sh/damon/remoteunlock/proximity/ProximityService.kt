package sh.damon.remoteunlock.proximity

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
import java.util.UUID

class ProximityService : Service() {

    private lateinit var store: ProximityConfigStore
    private lateinit var dispatcher: Dispatcher
    private lateinit var scanner: ProximityScanner
    private var motionGate: MotionGate? = null
    private val engines = mutableMapOf<String, ProximityEngine>()
    private val handler = Handler(Looper.getMainLooper())
    @Volatile private var scannerMode: ProximityScanner.Mode = ProximityScanner.Mode.BALANCED

    // Tracking for the persistent notification: primary MAC = most recently seen
    // enabled device. Used for the Unlock/Lock action buttons and for the
    // status summary line ("Far -55 dBm" etc).
    private var primaryMac: String? = null
    private var primaryLastRssi: Int? = null
    private var primaryLastSeenMs: Long = 0L

    // Flip to true once MotionGate is reliable. While false, the scanner runs
    // unconditionally regardless of detected activity.
    private val motionGateEnabled = false

    override fun onCreate() {
        super.onCreate()
        ProximityLog.i("Service", "onCreate")
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
            ProximityLog.i("Service", "reboot detected (storedBoot=$storedBootMs nowBoot=$nowBootMs), clearing cooldowns")
            store.knownMacs().forEach { mac ->
                val c = store.get(mac)
                if (c.lastManualLockAt != 0L) store.set(mac, c.copy(lastManualLockAt = 0L))
            }
            store.setBootId(nowBootMs.toString())
        }
        ProximityLog.d("Service", "enabled MACs: ${store.knownMacs().filter { store.get(it).enabled }}")

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
            ProximityLog.w("Service", "missing required permissions, stopSelf")
            stopSelf()
            return
        }

        startForegroundInternal()
        if (!motionGateEnabled) {
            // No gate: start scanning immediately and let mode escalation drive itself.
            ProximityLog.i("Service", "motion gate disabled, scanner.start($scannerMode)")
            scanner.start(scannerMode)
        } else {
            ProximityLog.i("Service", "motion gate enabled, awaiting MOVING transition")
        }
        handler.post(tickRunnable)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        ProximityLog.d("Service", "onStartCommand flags=$flags startId=$startId")
        startForegroundInternal()
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        ProximityLog.i("Service", "onDestroy")
        handler.removeCallbacks(tickRunnable)
        motionGate?.unsubscribe()
        scanner.stop()
    }

    override fun onBind(intent: Intent?) = null

    private fun startForegroundInternal() {
        ProximityNotifier.ensureChannel(applicationContext)
        postNotification()
    }

    private fun postNotification() {
        val status = computeStatus()
        val rssi = if (store.isDebugMode()) primaryLastRssi else null
        val notif = ProximityNotifier.build(applicationContext, primaryMac, status, rssi)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(ProximityNotifier.NOTIF_ID, notif,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE or
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(ProximityNotifier.NOTIF_ID, notif)
        }
    }

    private fun computeStatus(): ProximityNotifier.Status {
        val mac = primaryMac ?: return ProximityNotifier.Status.NoDevice
        val now = SystemClock.elapsedRealtime()
        if (now - primaryLastSeenMs > NO_DEVICE_AFTER_MS) return ProximityNotifier.Status.NoDevice
        val cfg = store.get(mac)
        val rssi = primaryLastRssi ?: return ProximityNotifier.Status.NoDevice
        val engineState = engines[mac]?.state
        return when {
            engineState == ProximityEngine.State.NEAR  -> ProximityNotifier.Status.Near
            rssi >= cfg.exitRssi                        -> ProximityNotifier.Status.Nearing
            else                                        -> ProximityNotifier.Status.Far
        }
    }

    private fun onScan(mac: String, rssi: Int, t: Long) {
        val cfg = store.get(mac)
        if (!cfg.enabled) {
            ProximityLog.d("Scan", "ignored $mac rssi=$rssi (mode=OFF)")
            return
        }
        val engine = engines.getOrPut(mac) {
            ProximityLog.i("Engine", "spin-up for $mac (enter=${cfg.enterRssi} exit=${cfg.exitRssi})")
            ProximityEngine(cfg)
        }
        engine.updateConfig(cfg)
        val event = engine.push(rssi, t)
        ProximityLog.d("Scan", "$mac rssi=$rssi state=${engine.state}${event?.let { " event=$it" } ?: ""}")
        event?.let { dispatcher.onEvent(mac, it) }

        primaryMac = mac
        primaryLastRssi = rssi
        primaryLastSeenMs = SystemClock.elapsedRealtime()
        postNotification()

        val targetMode = decideScannerMode()
        if (targetMode != scannerMode) {
            ProximityLog.i("Scanner", "mode change ${scannerMode}->$targetMode")
            scannerMode = targetMode
            scanner.start(targetMode)
        }
    }

    private fun decideScannerMode(): ProximityScanner.Mode {
        // Hot — engine NEAR or recently sampling — pin LOW_LATENCY for fast
        // EXIT detection and predictive accuracy. Otherwise stay BALANCED:
        // LOW_POWER's ~0.5s window per 5s leaves the first BLE5 ext-adv
        // hit minutes away when the user approaches a stationary peripheral,
        // which made CONFIRM mode unusably slow. BALANCED scans roughly
        // 25% duty — first-hit drops from tens-of-seconds to a few seconds
        // at the cost of moderate extra battery use while the service is
        // running (motion gate exists to bound that when it's wired up).
        val now = SystemClock.elapsedRealtime()
        val hot = engines.values.any {
            it.state == ProximityEngine.State.NEAR ||
            (now - it.lastSampleAtMs() < 5_000L)
        }
        return if (hot) ProximityScanner.Mode.LOW_LATENCY else ProximityScanner.Mode.BALANCED
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
            postNotification()
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
                try {
                    ble.startScan(listOf(filter), settings, cb)
                    ProximityLog.i("Scanner", "startScan mode=$mode legacy=false")
                } catch (e: SecurityException) {
                    ProximityLog.w("Scanner", "scan permission denied", e)
                }
            }
            override fun stopScan() {
                val adapter = BluetoothAdapter.getDefaultAdapter() ?: return
                val ble = adapter.bluetoothLeScanner ?: return
                try { ble.stopScan(cb) } catch (_: SecurityException) { }
                ProximityLog.i("Scanner", "stopScan")
                cb = null
            }
            override fun nowMs() = SystemClock.elapsedRealtime()
        }

    companion object {
        // After this much silence, the persistent notification reads "No device detected".
        private const val NO_DEVICE_AFTER_MS = 15_000L
    }
}
