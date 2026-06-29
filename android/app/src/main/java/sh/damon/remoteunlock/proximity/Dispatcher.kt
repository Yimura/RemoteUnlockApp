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
        ProximityLog.d("Dispatcher", "$mac event=$ev")
        if (ev !is ProximityEvent.Enter) return
        val cfg = store.get(mac)
        if (!cfg.enabled) return
        when (cfg.mode) {
            ProximityConfigStore.Mode.OFF -> Unit
            ProximityConfigStore.Mode.CONFIRM -> {
                ProximityLog.i("Dispatcher", "$mac CONFIRM -> notification")
                sinks.postConfirmNotification(mac)
            }
            ProximityConfigStore.Mode.AUTO -> {
                ProximityLog.i("Dispatcher", "$mac AUTO -> headless unlock task")
                sinks.startUnlockTask(mac)
            }
        }
    }
}
