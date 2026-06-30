package sh.damon.remoteunlock.proximity

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import com.facebook.react.bridge.*
import kotlin.math.sqrt

class ProximityModule(reactCtx: ReactApplicationContext) : ReactContextBaseJavaModule(reactCtx) {

    private val ctx: ReactApplicationContext = reactCtx
    private val store get() = ProximityConfigStore(ctx)

    @Volatile private var captureInFlight: ScanCallback? = null

    override fun getName() = "ProximityModule"

    @ReactMethod
    fun getConfig(mac: String, p: Promise) {
        val c = store.get(mac)
        val m = Arguments.createMap().apply {
            putBoolean("enabled", c.enabled)
            putString("mode", c.mode.name)
            putInt("enterRssi", c.enterRssi)
            putInt("exitRssi", c.exitRssi)
            putBoolean("predictive", c.predictive)
            putDouble("lookaheadMs", c.lookaheadMs.toDouble())
            putDouble("cooldownMs", c.cooldownMs.toDouble())
            putDouble("lastManualLockAt", c.lastManualLockAt.toDouble())
        }
        p.resolve(m)
    }

    @ReactMethod
    fun setConfig(mac: String, cfg: ReadableMap, p: Promise) {
        val mode = cfg.getString("mode")!!
        val enabled = cfg.getBoolean("enabled")
        ProximityLog.i("Module", "setConfig $mac mode=$mode enabled=$enabled")
        store.set(mac, ProximityConfigStore.ProximityConfig(
            enabled = enabled,
            mode = ProximityConfigStore.Mode.valueOf(mode),
            enterRssi = cfg.getInt("enterRssi"),
            exitRssi = cfg.getInt("exitRssi"),
            predictive = cfg.getBoolean("predictive"),
            lookaheadMs = cfg.getDouble("lookaheadMs").toLong(),
            cooldownMs = cfg.getDouble("cooldownMs").toLong(),
            lastManualLockAt = cfg.getDouble("lastManualLockAt").toLong(),
        ))
        if (store.anyEnabled()) {
            ProximityLog.i("Module", "anyEnabled=true -> ProximityServiceManager.start")
            ProximityServiceManager.start(ctx)
        } else {
            ProximityLog.i("Module", "anyEnabled=false -> ProximityServiceManager.stop")
            ProximityServiceManager.stop(ctx)
        }
        p.resolve(null)
    }

    @ReactMethod
    fun removeConfig(mac: String, p: Promise) {
        ProximityLog.i("Module", "removeConfig $mac")
        store.remove(mac)
        if (!store.anyEnabled()) ProximityServiceManager.stop(ctx)
        p.resolve(null)
    }

    @ReactMethod
    fun recordManualLock(mac: String, p: Promise) {
        val now = android.os.SystemClock.elapsedRealtime()
        ProximityLog.i("Module", "recordManualLock $mac at $now")
        // MUST use elapsedRealtime to match the time base ProximityEngine uses
        // for tMs in push()/tick(). Mixing wall clock here would break cooldown.
        store.recordManualLock(mac, now)
        p.resolve(null)
    }

    @ReactMethod
    fun startService(p: Promise) {
        ProximityLog.i("Module", "startService (RN bridge)")
        ProximityServiceManager.start(ctx); p.resolve(null)
    }
    @ReactMethod
    fun stopService(p: Promise) {
        ProximityLog.i("Module", "stopService (RN bridge)")
        ProximityServiceManager.stop(ctx); p.resolve(null)
    }

    @ReactMethod
    fun heartbeatAt(p: Promise) { p.resolve(store.heartbeatAt().toDouble()) }

    @ReactMethod
    fun getDebugMode(p: Promise) { p.resolve(store.isDebugMode()) }

    @ReactMethod
    fun setDebugMode(on: Boolean, p: Promise) {
        ProximityLog.i("Module", "setDebugMode $on")
        store.setDebugMode(on)
        p.resolve(null)
    }

    @ReactMethod
    fun captureRssi(mac: String, durationMs: Double, p: Promise) {
        if (captureInFlight != null) {
            p.reject("E_BUSY", "Calibration already in progress")
            return
        }

        val adapter = BluetoothAdapter.getDefaultAdapter()
        val scanner = adapter?.bluetoothLeScanner
        if (scanner == null) { p.reject("E_BT", "No BLE scanner"); return }

        val samples = mutableListOf<Int>()
        val cb = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                if (result.device.address == mac) samples += result.rssi
            }
        }
        captureInFlight = cb
        val filter = ScanFilter.Builder().setDeviceAddress(mac).build()
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setLegacy(false)
            .build()
        try {
            scanner.startScan(listOf(filter), settings, cb)
        } catch (e: SecurityException) {
            captureInFlight = null
            p.reject("E_PERM", "Missing BLUETOOTH_SCAN", e); return
        }
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            try { scanner.stopScan(cb) } catch (_: SecurityException) {}
            captureInFlight = null
            if (samples.isEmpty()) { p.reject("E_NO_SIGNAL", "No samples"); return@postDelayed }
            samples.sort()
            val median = samples[samples.size / 2]
            val mean = samples.average()
            val stddev = sqrt(samples.sumOf { (it - mean) * (it - mean) } / samples.size)
            val out = Arguments.createMap().apply {
                putInt("rssi", median)
                putDouble("stddev", stddev)
                putInt("count", samples.size)
            }
            p.resolve(out)
        }, durationMs.toLong())
    }
}
