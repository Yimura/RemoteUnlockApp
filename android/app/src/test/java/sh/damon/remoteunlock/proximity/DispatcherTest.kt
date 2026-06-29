package sh.damon.remoteunlock.proximity

import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class DispatcherTest {

    private class CapturingSinks : Dispatcher.Sinks {
        val confirms = mutableListOf<String>()
        val tasks = mutableListOf<String>()
        override fun postConfirmNotification(mac: String) { confirms += mac }
        override fun startUnlockTask(mac: String) { tasks += mac }
    }

    private fun store() = ProximityConfigStore(ApplicationProvider.getApplicationContext())

    @Test
    fun off_drops_event() {
        val s = store()
        s.set("AA:11:22:33:44:55", ProximityConfigStore.defaultConfig().copy(enabled = true, mode = ProximityConfigStore.Mode.OFF))
        val sinks = CapturingSinks()
        Dispatcher(s, sinks).onEvent("AA:11:22:33:44:55", ProximityEvent.Enter)
        assertTrue(sinks.tasks.isEmpty() && sinks.confirms.isEmpty())
    }

    @Test
    fun confirm_posts_notification() {
        val s = store()
        s.set("AA:11:22:33:44:55", ProximityConfigStore.defaultConfig().copy(enabled = true, mode = ProximityConfigStore.Mode.CONFIRM))
        val sinks = CapturingSinks()
        Dispatcher(s, sinks).onEvent("AA:11:22:33:44:55", ProximityEvent.Enter)
        assertEquals(listOf("AA:11:22:33:44:55"), sinks.confirms)
    }

    @Test
    fun auto_starts_unlock_task() {
        val s = store()
        s.set("AA:11:22:33:44:55", ProximityConfigStore.defaultConfig().copy(enabled = true, mode = ProximityConfigStore.Mode.AUTO))
        val sinks = CapturingSinks()
        Dispatcher(s, sinks).onEvent("AA:11:22:33:44:55", ProximityEvent.Enter)
        assertEquals(listOf("AA:11:22:33:44:55"), sinks.tasks)
    }

    @Test
    fun exit_event_does_not_start_task() {
        val s = store()
        s.set("AA:11:22:33:44:55", ProximityConfigStore.defaultConfig().copy(enabled = true, mode = ProximityConfigStore.Mode.AUTO))
        val sinks = CapturingSinks()
        Dispatcher(s, sinks).onEvent("AA:11:22:33:44:55", ProximityEvent.Exit)
        Dispatcher(s, sinks).onEvent("AA:11:22:33:44:55", ProximityEvent.Lost)
        assertTrue(sinks.tasks.isEmpty())
    }
}
