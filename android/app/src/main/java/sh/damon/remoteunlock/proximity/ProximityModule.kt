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
        store.set(mac, ProximityConfigStore.ProximityConfig(
            enabled = cfg.getBoolean("enabled"),
            mode = ProximityConfigStore.Mode.valueOf(cfg.getString("mode")!!),
            enterRssi = cfg.getInt("enterRssi"),
            exitRssi = cfg.getInt("exitRssi"),
            predictive = cfg.getBoolean("predictive"),
            lookaheadMs = cfg.getDouble("lookaheadMs").toLong(),
            cooldownMs = cfg.getDouble("cooldownMs").toLong(),
            lastManualLockAt = cfg.getDouble("lastManualLockAt").toLong(),
        ))
        if (store.anyEnabled()) ProximityServiceManager.start(ctx) else ProximityServiceManager.stop(ctx)
        p.resolve(null)
    }

    @ReactMethod
    fun removeConfig(mac: String, p: Promise) {
        store.remove(mac)
        if (!store.anyEnabled()) ProximityServiceManager.stop(ctx)
        p.resolve(null)
    }

    @ReactMethod
    fun recordManualLock(mac: String, p: Promise) {
        // MUST use elapsedRealtime to match the time base ProximityEngine uses
        // for tMs in push()/tick(). Mixing wall clock here would break cooldown.
        store.recordManualLock(mac, android.os.SystemClock.elapsedRealtime())
        p.resolve(null)
    }

    @ReactMethod
    fun startService(p: Promise) { ProximityServiceManager.start(ctx); p.resolve(null) }
    @ReactMethod
    fun stopService(p: Promise) { ProximityServiceManager.stop(ctx); p.resolve(null) }

    @ReactMethod
    fun heartbeatAt(p: Promise) { p.resolve(store.heartbeatAt().toDouble()) }

    @ReactMethod
    fun captureRssi(mac: String, durationMs: Double, p: Promise) {
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val scanner = adapter?.bluetoothLeScanner
        if (scanner == null) { p.reject("E_BT", "No BLE scanner"); return }

        val samples = mutableListOf<Int>()
        val cb = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                if (result.device.address == mac) samples += result.rssi
            }
        }
        val filter = ScanFilter.Builder().setDeviceAddress(mac).build()
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setLegacy(false)
            .build()
        try {
            scanner.startScan(listOf(filter), settings, cb)
        } catch (e: SecurityException) {
            p.reject("E_PERM", "Missing BLUETOOTH_SCAN", e); return
        }
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            try { scanner.stopScan(cb) } catch (_: SecurityException) {}
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
