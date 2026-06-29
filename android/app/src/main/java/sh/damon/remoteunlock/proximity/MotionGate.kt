package sh.damon.remoteunlock.proximity

class MotionGate(
    private val source: ActivityRecognitionSource,
    private val debounceMs: Long = 30_000L,
) {
    enum class MotionState { STILL, MOVING }

    interface ActivityRecognitionSource {
        fun start(cb: (Boolean) -> Unit)
        fun stop()
    }

    private var listener: ((MotionState) -> Unit)? = null
    private var lastTransitionAt = 0L
    private var lastState: MotionState? = null

    fun subscribe(onTransition: (MotionState) -> Unit) {
        listener = onTransition
        source.start { moving ->
            val now = System.currentTimeMillis()
            val s = if (moving) MotionState.MOVING else MotionState.STILL
            if (s != lastState && (lastState == null || now - lastTransitionAt >= debounceMs)) {
                lastState = s
                lastTransitionAt = now
                listener?.invoke(s)
            }
        }
    }

    fun unsubscribe() {
        source.stop()
        listener = null
    }

    fun onPermissionDenied() {
        lastState = MotionState.MOVING
        listener?.invoke(MotionState.MOVING)
    }
}
