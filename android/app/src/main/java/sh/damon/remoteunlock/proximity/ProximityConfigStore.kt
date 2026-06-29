package sh.damon.remoteunlock.proximity

import android.content.Context
import android.content.SharedPreferences

class ProximityConfigStore(ctx: Context) {

    enum class Mode { OFF, CONFIRM, AUTO }

    data class ProximityConfig(
        val enabled: Boolean,
        val mode: Mode,
        val enterRssi: Int,
        val exitRssi: Int,
        val predictive: Boolean,
        val lookaheadMs: Long,
        val cooldownMs: Long,
        val lastManualLockAt: Long,
    )

    private val prefs: SharedPreferences =
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun get(mac: String): ProximityConfig {
        val k = key(mac)
        if (!prefs.contains(k + ".enabled")) return defaultConfig()
        return ProximityConfig(
            enabled = prefs.getBoolean(k + ".enabled", false),
            mode = Mode.valueOf(prefs.getString(k + ".mode", Mode.OFF.name)!!),
            enterRssi = prefs.getInt(k + ".enterRssi", -65),
            exitRssi = prefs.getInt(k + ".exitRssi", -85),
            predictive = prefs.getBoolean(k + ".predictive", true),
            lookaheadMs = prefs.getLong(k + ".lookaheadMs", 500L),
            cooldownMs = prefs.getLong(k + ".cooldownMs", 60_000L),
            lastManualLockAt = prefs.getLong(k + ".lastManualLockAt", 0L),
        )
    }

    fun set(mac: String, cfg: ProximityConfig) {
        val k = key(mac)
        prefs.edit()
            .putBoolean(k + ".enabled", cfg.enabled)
            .putString(k + ".mode", cfg.mode.name)
            .putInt(k + ".enterRssi", cfg.enterRssi)
            .putInt(k + ".exitRssi", cfg.exitRssi)
            .putBoolean(k + ".predictive", cfg.predictive)
            .putLong(k + ".lookaheadMs", cfg.lookaheadMs)
            .putLong(k + ".cooldownMs", cfg.cooldownMs)
            .putLong(k + ".lastManualLockAt", cfg.lastManualLockAt)
            .putString(KNOWN, (knownMacs() + mac).joinToString(","))
            .apply()
    }

    fun remove(mac: String) {
        val k = key(mac)
        val e = prefs.edit()
        listOf("enabled", "mode", "enterRssi", "exitRssi",
               "predictive", "lookaheadMs", "cooldownMs", "lastManualLockAt")
            .forEach { e.remove(k + "." + it) }
        e.putString(KNOWN, (knownMacs() - mac).joinToString(","))
        e.apply()
    }

    fun knownMacs(): Set<String> =
        prefs.getString(KNOWN, "")!!
            .split(",")
            .filter { it.isNotBlank() }
            .toSet()

    fun anyEnabled(): Boolean =
        knownMacs().any { get(it).enabled }

    fun recordManualLock(mac: String, now: Long) {
        set(mac, get(mac).copy(lastManualLockAt = now))
    }

    companion object {
        private const val PREFS_NAME = "proximity_config"
        private const val KNOWN = "_known"

        fun defaultConfig() = ProximityConfig(
            enabled = false,
            mode = Mode.OFF,
            enterRssi = -65,
            exitRssi = -85,
            predictive = true,
            lookaheadMs = 500L,
            cooldownMs = 60_000L,
            lastManualLockAt = 0L,
        )

        private fun key(mac: String) = "dev." + mac.replace(":", "_")
    }
}
