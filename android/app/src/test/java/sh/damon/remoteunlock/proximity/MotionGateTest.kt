package sh.damon.remoteunlock.proximity

import org.junit.Assert.*
import org.junit.Test

class MotionGateTest {
    private class FakeSource : MotionGate.ActivityRecognitionSource {
        var cb: ((Boolean) -> Unit)? = null
        var stopped = false
        override fun start(cb: (Boolean) -> Unit) { this.cb = cb }
        override fun stop() { stopped = true; cb = null }
    }

    @Test
    fun emits_moving_then_still_with_debounce() {
        val src = FakeSource()
        val gate = MotionGate(src, debounceMs = 0)
        val out = mutableListOf<MotionGate.MotionState>()
        gate.subscribe { out += it }
        src.cb!!.invoke(true)
        src.cb!!.invoke(false)
        assertEquals(listOf(MotionGate.MotionState.MOVING, MotionGate.MotionState.STILL), out)
    }

    @Test
    fun permission_denied_emits_moving_and_no_callbacks() {
        val src = FakeSource()
        val gate = MotionGate(src, debounceMs = 0)
        val out = mutableListOf<MotionGate.MotionState>()
        gate.subscribe { out += it }
        gate.onPermissionDenied()
        assertEquals(listOf(MotionGate.MotionState.MOVING), out)
    }

    @Test
    fun unsubscribe_stops_source() {
        val src = FakeSource()
        val gate = MotionGate(src, debounceMs = 0)
        gate.subscribe { }
        gate.unsubscribe()
        assertTrue(src.stopped)
    }
}
