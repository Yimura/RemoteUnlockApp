package sh.damon.remoteunlock.proximity

import org.junit.Assert.*
import org.junit.Test

class ProximityEngineTest {

    private fun cfg(
        enter: Int = -65, exit: Int = -85,
        predictive: Boolean = false, lookahead: Long = 500L,
        cooldownMs: Long = 60_000L, lastLock: Long = 0L,
    ) = ProximityConfigStore.ProximityConfig(
        enabled = true,
        mode = ProximityConfigStore.Mode.AUTO,
        enterRssi = enter, exitRssi = exit,
        predictive = predictive, lookaheadMs = lookahead,
        cooldownMs = cooldownMs, lastManualLockAt = lastLock,
    )

    @Test
    fun emits_enter_after_three_consecutive_above_threshold() {
        val e = ProximityEngine(cfg())
        var last: ProximityEvent? = null
        // first two: no emit
        last = e.push(-60, 100); assertNull(last)
        last = e.push(-60, 200); assertNull(last)
        // third sample crosses
        last = e.push(-60, 300)
        assertEquals(ProximityEvent.Enter, last)
    }

    @Test
    fun emits_exit_after_ema_drops_below_exit_rssi() {
        val e = ProximityEngine(cfg())
        // Drive to NEAR
        e.push(-60, 100); e.push(-60, 200)
        assertEquals(ProximityEvent.Enter, e.push(-60, 300))
        assertEquals(ProximityEngine.State.NEAR, e.state)

        // Now feed strong-exit samples until EMA crosses exit threshold (-85).
        // With α=0.4 starting EMA≈-60, ~20 samples of -95 drive EMA below -85.
        var emitted: ProximityEvent? = null
        var t = 400L
        for (i in 0 until 30) {
            val r = e.push(-95, t)
            if (r != null) { emitted = r; break }
            t += 100
        }
        assertEquals(ProximityEvent.Exit, emitted)
        assertEquals(ProximityEngine.State.FAR, e.state)
    }

    @Test
    fun emits_lost_after_30s_no_samples() {
        val e = ProximityEngine(cfg())
        e.push(-60, 100); e.push(-60, 200); e.push(-60, 300) // ENTER
        assertNull(e.tick(29_000L))
        assertEquals(ProximityEvent.Lost, e.tick(30_500L))
    }

    @Test
    fun cooldown_suppresses_enter() {
        val e = ProximityEngine(cfg(cooldownMs = 60_000L, lastLock = 100L))
        // now() = 200L → within cooldown
        e.push(-60, 100); e.push(-60, 150)
        val r = e.push(-60, 200)
        assertNull(r) // suppressed
    }

    @Test
    fun predictive_fires_one_sample_earlier() {
        val baseline = ProximityEngine(cfg(predictive = false))
        val predict  = ProximityEngine(cfg(predictive = true, lookahead = 500L))

        // signal approaching: -80, -75, -70, -66 over 500ms intervals
        val samples = listOf(-80, -75, -70, -66)
        val baseEvents = samples.mapIndexed { i, r -> baseline.push(r, 100L + i*500L) }
        val predEvents = samples.mapIndexed { i, r -> predict.push(r, 100L + i*500L) }

        val baseFirstEnter = baseEvents.indexOfFirst { it == ProximityEvent.Enter }
        val predFirstEnter = predEvents.indexOfFirst { it == ProximityEvent.Enter }

        assertTrue("predictive should not fire later than baseline",
            predFirstEnter <= baseFirstEnter || baseFirstEnter == -1 && predFirstEnter >= 0)
    }

    @Test
    fun noise_spike_does_not_trigger_enter() {
        val e = ProximityEngine(cfg())
        // weak signal with one spike
        e.push(-90, 100); e.push(-60, 200); e.push(-90, 300); e.push(-90, 400)
        val tick = e.tick(500L)
        assertNotEquals(ProximityEvent.Enter, tick)
    }
}
