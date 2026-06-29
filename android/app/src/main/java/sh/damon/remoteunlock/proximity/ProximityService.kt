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
    private val engines = mutableMapOf<String, ProximityEngine>()
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        store = ProximityConfigStore(applicationContext)
        // elapsedRealtime resets on reboot; any stored lastManualLockAt from a prior boot
        // is meaningless and would suppress unlocks indefinitely. Reset on every service start.
        store.knownMacs().forEach { mac ->
            val c = store.get(mac)
            if (c.lastManualLockAt != 0L) store.set(mac, c.copy(lastManualLockAt = 0L))
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

        startForegroundInternal()
        scanner.start(ProximityScanner.Mode.LOW_POWER)
        handler.post(tickRunnable)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForegroundInternal()
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(tickRunnable)
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
        startForeground(NOTIF_ID, notif)
    }

    private fun onScan(mac: String, rssi: Int, t: Long) {
        val cfg = store.get(mac)
        if (!cfg.enabled) return
        val engine = engines.getOrPut(mac) { ProximityEngine(cfg) }
        engine.updateConfig(cfg)
        engine.push(rssi, t)?.let { dispatcher.onEvent(mac, it) }
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
