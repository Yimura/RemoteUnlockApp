package sh.damon.remoteunlock.proximity

import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class ProximityConfigStoreTest {

    private fun store() = ProximityConfigStore(ApplicationProvider.getApplicationContext())

    @Test
    fun defaults_when_unset() {
        val cfg = store().get("AA:BB:CC:DD:EE:FF")
        assertFalse(cfg.enabled)
        assertEquals(ProximityConfigStore.Mode.OFF, cfg.mode)
        assertEquals(-65, cfg.enterRssi)
        assertEquals(-85, cfg.exitRssi)
        assertTrue(cfg.predictive)
        assertEquals(500L, cfg.lookaheadMs)
        assertEquals(60_000L, cfg.cooldownMs)
        assertEquals(0L, cfg.lastManualLockAt)
    }

    @Test
    fun roundtrips_set_then_get() {
        val s = store()
        val mac = "AA:BB:CC:11:22:33"
        s.set(mac, ProximityConfigStore.defaultConfig().copy(
            enabled = true,
            mode = ProximityConfigStore.Mode.AUTO,
            enterRssi = -60,
            exitRssi = -80,
        ))
        val cfg = s.get(mac)
        assertTrue(cfg.enabled)
        assertEquals(ProximityConfigStore.Mode.AUTO, cfg.mode)
        assertEquals(-60, cfg.enterRssi)
        assertEquals(-80, cfg.exitRssi)
    }

    @Test
    fun any_enabled_reflects_state() {
        val s = store()
        assertFalse(s.anyEnabled())
        s.set("AA:AA:AA:AA:AA:AA", ProximityConfigStore.defaultConfig().copy(enabled = true))
        assertTrue(s.anyEnabled())
        s.remove("AA:AA:AA:AA:AA:AA")
        assertFalse(s.anyEnabled())
    }

    @Test
    fun record_manual_lock_persists_timestamp() {
        val s = store()
        s.set("BB:BB:BB:BB:BB:BB", ProximityConfigStore.defaultConfig().copy(enabled = true))
        s.recordManualLock("BB:BB:BB:BB:BB:BB", 12345L)
        assertEquals(12345L, s.get("BB:BB:BB:BB:BB:BB").lastManualLockAt)
    }

    @Test
    fun known_macs_lists_only_set_devices() {
        val s = store()
        s.set("AA:00:00:00:00:01", ProximityConfigStore.defaultConfig().copy(enabled = true))
        s.set("AA:00:00:00:00:02", ProximityConfigStore.defaultConfig().copy(enabled = false))
        val macs = s.knownMacs()
        assertEquals(setOf("AA:00:00:00:00:01", "AA:00:00:00:00:02"), macs)
    }
}
