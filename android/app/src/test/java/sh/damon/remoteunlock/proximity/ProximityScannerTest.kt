package sh.damon.remoteunlock.proximity

import org.junit.Assert.*
import org.junit.Test

class ProximityScannerTest {
    private class FakeSource : ProximityScanner.ScannerSource {
        var lastMode: Int = -1
        var started = 0
        var stopped = 0
        var cb: ((String, Int, Long) -> Unit)? = null
        override fun startScan(mode: Int, cb: (String, Int, Long) -> Unit) {
            this.cb = cb; lastMode = mode; started++
        }
        override fun stopScan() { stopped++; cb = null }
        override fun nowMs(): Long = 1_000L
    }

    @Test
    fun start_sets_low_power_mode() {
        val src = FakeSource()
        val s = ProximityScanner(src)
        s.start(ProximityScanner.Mode.LOW_POWER)
        assertEquals(ProximityScanner.SCAN_MODE_LOW_POWER, src.lastMode)
    }

    @Test
    fun upgrade_restarts_with_low_latency() {
        val src = FakeSource()
        val s = ProximityScanner(src)
        s.start(ProximityScanner.Mode.LOW_POWER)
        s.start(ProximityScanner.Mode.LOW_LATENCY)
        assertEquals(2, src.started)
        assertEquals(1, src.stopped)
        assertEquals(ProximityScanner.SCAN_MODE_LOW_LATENCY, src.lastMode)
    }

    @Test
    fun listener_receives_scan_callback() {
        val src = FakeSource()
        val s = ProximityScanner(src)
        var seen: Triple<String, Int, Long>? = null
        s.setListener { mac, rssi, t -> seen = Triple(mac, rssi, t) }
        s.start(ProximityScanner.Mode.LOW_LATENCY)
        src.cb!!.invoke("AA:BB:CC:DD:EE:FF", -70, 12345L)
        assertEquals(Triple("AA:BB:CC:DD:EE:FF", -70, 12345L), seen)
    }
}
