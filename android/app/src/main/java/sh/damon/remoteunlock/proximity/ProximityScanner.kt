package sh.damon.remoteunlock.proximity

class ProximityScanner(private val source: ScannerSource) {

    enum class Mode { LOW_POWER, BALANCED, LOW_LATENCY }

    interface ScannerSource {
        fun startScan(mode: Int, cb: (String, Int, Long) -> Unit)
        fun stopScan()
        fun nowMs(): Long
    }

    private var listener: ((String, Int, Long) -> Unit)? = null
    private var current: Mode? = null

    fun setListener(l: (String, Int, Long) -> Unit) { listener = l }

    fun start(mode: Mode) {
        if (current == mode) return
        if (current != null) source.stopScan()
        current = mode
        val scanMode = when (mode) {
            Mode.LOW_LATENCY -> SCAN_MODE_LOW_LATENCY
            Mode.BALANCED    -> SCAN_MODE_BALANCED
            Mode.LOW_POWER   -> SCAN_MODE_LOW_POWER
        }
        source.startScan(scanMode) { mac, rssi, t -> listener?.invoke(mac, rssi, t) }
    }

    fun stop() {
        if (current != null) {
            source.stopScan()
            current = null
        }
    }

    companion object {
        const val SCAN_MODE_LOW_POWER   = 0
        const val SCAN_MODE_BALANCED    = 1
        const val SCAN_MODE_LOW_LATENCY = 2
        const val DOOR_SERVICE_UUID = "7ccf30e3-a9af-45b2-8d1d-f58e4d30ff95"
    }
}
