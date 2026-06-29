package sh.damon.remoteunlock.proximity

class Dispatcher(
    private val store: ProximityConfigStore,
    private val sinks: Sinks,
) {
    interface Sinks {
        fun postConfirmNotification(mac: String)
        fun startUnlockTask(mac: String)
    }

    fun onEvent(mac: String, ev: ProximityEvent) {
        if (ev !is ProximityEvent.Enter) return
        val cfg = store.get(mac)
        if (!cfg.enabled) return
        when (cfg.mode) {
            ProximityConfigStore.Mode.OFF -> Unit
            ProximityConfigStore.Mode.CONFIRM -> sinks.postConfirmNotification(mac)
            ProximityConfigStore.Mode.AUTO -> sinks.startUnlockTask(mac)
        }
    }
}
