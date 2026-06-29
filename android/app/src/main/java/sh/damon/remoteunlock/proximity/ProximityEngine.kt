package sh.damon.remoteunlock.proximity

sealed class ProximityEvent {
    object Enter : ProximityEvent()
    object Exit  : ProximityEvent()
    object Lost  : ProximityEvent()
}

class ProximityEngine(
    initialCfg: ProximityConfigStore.ProximityConfig,
    private val capacity: Int = 20,
) {

    enum class State { FAR, ENTERING, NEAR, LEAVING }

    @Volatile var state: State = State.FAR
        private set

    private var cfg = initialCfg
    private val rssiBuf = IntArray(capacity)
    private val tBuf    = LongArray(capacity)
    private var size = 0
    private var head = 0
    private var ema  = Double.NaN
    private var consecutiveOver = 0
    private var lastSampleAt = 0L
    private var lostEmitted = false

    fun updateConfig(newCfg: ProximityConfigStore.ProximityConfig) { cfg = newCfg }

    fun push(rssi: Int, tMs: Long): ProximityEvent? {
        rssiBuf[head] = rssi
        tBuf[head] = tMs
        head = (head + 1) % capacity
        if (size < capacity) size++
        lastSampleAt = tMs
        lostEmitted = false

        ema = if (ema.isNaN()) rssi.toDouble() else 0.4 * rssi + 0.6 * ema

        val slope = leastSquaresSlope()
        val projected = ema + slope * cfg.lookaheadMs.toDouble()

        val decisionMetric = if (cfg.predictive) projected else ema

        return when (state) {
            State.FAR -> {
                if (decisionMetric > cfg.enterRssi) {
                    consecutiveOver++
                    if (consecutiveOver >= 3) {
                        state = State.NEAR
                        consecutiveOver = 0
                        if (cfg.lastManualLockAt > 0L && tMs - cfg.lastManualLockAt < cfg.cooldownMs) null
                        else ProximityEvent.Enter
                    } else null
                } else { consecutiveOver = 0; null }
            }
            State.NEAR -> {
                if (ema < cfg.exitRssi) {
                    state = State.FAR
                    consecutiveOver = 0
                    ProximityEvent.Exit
                } else null
            }
            State.ENTERING, State.LEAVING -> null
        }
    }

    fun tick(nowMs: Long): ProximityEvent? {
        if (size == 0) return null
        if (lostEmitted) return null
        if (nowMs - lastSampleAt > LOST_AFTER_MS) {
            lostEmitted = true
            state = State.FAR
            consecutiveOver = 0
            return ProximityEvent.Lost
        }
        return null
    }

    private fun leastSquaresSlope(): Double {
        if (size < 2) return 0.0
        var sumT = 0.0; var sumR = 0.0; var sumTR = 0.0; var sumTT = 0.0
        val n = size
        for (i in 0 until n) {
            val idx = (head - n + i + capacity) % capacity
            val t = tBuf[idx].toDouble()
            val r = rssiBuf[idx].toDouble()
            sumT += t; sumR += r; sumTR += t * r; sumTT += t * t
        }
        val denom = n * sumTT - sumT * sumT
        if (denom == 0.0) return 0.0
        return (n * sumTR - sumT * sumR) / denom
    }

    companion object {
        const val LOST_AFTER_MS = 30_000L
    }
}
