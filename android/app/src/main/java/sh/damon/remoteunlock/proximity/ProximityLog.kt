package sh.damon.remoteunlock.proximity

import android.util.Log

/**
 * Single entry point for proximity-feature logging. All native code uses this
 * so a developer can stream the whole feature with:
 *
 *     adb logcat -s Proximity:V *:S
 *
 * Sub-tags are passed as the first argument so each log line carries the
 * component name ("Service", "Scanner", "Engine", ...).
 */
object ProximityLog {
    private const val TAG = "Proximity"

    fun d(sub: String, msg: String) = Log.d(TAG, "[$sub] $msg")
    fun i(sub: String, msg: String) = Log.i(TAG, "[$sub] $msg")
    fun w(sub: String, msg: String, t: Throwable? = null) = Log.w(TAG, "[$sub] $msg", t)
    fun e(sub: String, msg: String, t: Throwable? = null) = Log.e(TAG, "[$sub] $msg", t)
}
