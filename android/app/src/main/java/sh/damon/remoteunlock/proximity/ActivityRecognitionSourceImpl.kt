package sh.damon.remoteunlock.proximity

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionRequest
import com.google.android.gms.location.ActivityTransitionResult
import com.google.android.gms.location.DetectedActivity

class ActivityRecognitionSourceImpl(private val ctx: Context) : MotionGate.ActivityRecognitionSource {

    private var pi: PendingIntent? = null

    override fun start(cb: (Boolean) -> Unit) {
        MotionTransitionReceiver.callback = cb

        // Android 14+ rejects FLAG_MUTABLE PendingIntents that target an implicit
        // Intent. ActivityRecognition needs the PendingIntent to be MUTABLE so it
        // can inject result extras, so the Intent MUST be explicit (target our
        // manifest-registered MotionTransitionReceiver class).
        val intent = Intent(ctx, MotionTransitionReceiver::class.java)
        val flags = PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        pi = PendingIntent.getBroadcast(ctx, 0, intent, flags)

        val transitions = listOf(
            DetectedActivity.WALKING,
            DetectedActivity.RUNNING,
            DetectedActivity.ON_FOOT,
            DetectedActivity.IN_VEHICLE,
            DetectedActivity.ON_BICYCLE,
            DetectedActivity.STILL,
        ).flatMap { type ->
            listOf(
                ActivityTransition.Builder()
                    .setActivityType(type)
                    .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                    .build(),
                ActivityTransition.Builder()
                    .setActivityType(type)
                    .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                    .build(),
            )
        }
        val request = ActivityTransitionRequest(transitions)

        try {
            ActivityRecognition.getClient(ctx)
                .requestActivityTransitionUpdates(request, pi!!)
            ProximityLog.i("Motion", "requestActivityTransitionUpdates registered")
        } catch (e: SecurityException) {
            ProximityLog.w("Motion", "ACTIVITY_RECOGNITION permission denied", e)
        }
        // Optimistic initial state so the scanner runs before the first transition arrives.
        cb(true)
    }

    override fun stop() {
        pi?.let {
            try {
                ActivityRecognition.getClient(ctx).removeActivityTransitionUpdates(it)
            } catch (_: SecurityException) { }
        }
        MotionTransitionReceiver.callback = null
        pi = null
    }

    class MotionTransitionReceiver : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) {
            if (!ActivityTransitionResult.hasResult(i)) return
            val result = ActivityTransitionResult.extractResult(i) ?: return
            val latest = result.transitionEvents.lastOrNull() ?: return
            val isStill = latest.activityType == DetectedActivity.STILL &&
                latest.transitionType == ActivityTransition.ACTIVITY_TRANSITION_ENTER
            val isMoving = latest.activityType != DetectedActivity.STILL &&
                latest.transitionType == ActivityTransition.ACTIVITY_TRANSITION_ENTER
            val cb = callback ?: return
            ProximityLog.d("Motion", "transition act=${latest.activityType} t=${latest.transitionType} moving=$isMoving still=$isStill")
            if (isMoving) cb(true)
            if (isStill) cb(false)
        }

        companion object {
            @Volatile var callback: ((Boolean) -> Unit)? = null
        }
    }
}
