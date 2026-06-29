package sh.damon.remoteunlock.proximity

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionEvent
import com.google.android.gms.location.ActivityTransitionRequest
import com.google.android.gms.location.ActivityTransitionResult
import com.google.android.gms.location.DetectedActivity

class ActivityRecognitionSourceImpl(private val ctx: Context) : MotionGate.ActivityRecognitionSource {

    private var receiver: BroadcastReceiver? = null
    private var pi: PendingIntent? = null

    override fun start(cb: (Boolean) -> Unit) {
        val intent = Intent(ACTION)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        else
            PendingIntent.FLAG_UPDATE_CURRENT
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

        receiver = object : BroadcastReceiver() {
            override fun onReceive(c: Context, i: Intent) {
                if (!ActivityTransitionResult.hasResult(i)) return
                val result = ActivityTransitionResult.extractResult(i) ?: return
                val latest = result.transitionEvents.lastOrNull() ?: return
                val isMoving = latest.activityType != DetectedActivity.STILL &&
                    latest.transitionType == ActivityTransition.ACTIVITY_TRANSITION_ENTER
                val isStill = latest.activityType == DetectedActivity.STILL &&
                    latest.transitionType == ActivityTransition.ACTIVITY_TRANSITION_ENTER
                if (isMoving) cb(true)
                if (isStill) cb(false)
            }
        }
        val filter = IntentFilter(ACTION)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ctx.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            ctx.registerReceiver(receiver, filter)
        }

        try {
            ActivityRecognition.getClient(ctx)
                .requestActivityTransitionUpdates(request, pi!!)
        } catch (e: SecurityException) {
            // ACTIVITY_RECOGNITION permission denied; MotionGate caller handles fallback
        }
        // Optimistic initial state: assume moving so scanner runs until first STILL event
        cb(true)
    }

    override fun stop() {
        pi?.let {
            try {
                ActivityRecognition.getClient(ctx).removeActivityTransitionUpdates(it)
            } catch (_: SecurityException) { }
        }
        receiver?.let {
            try { ctx.unregisterReceiver(it) } catch (_: IllegalArgumentException) { }
        }
        receiver = null
        pi = null
    }

    companion object {
        private const val ACTION = "sh.damon.remoteunlock.proximity.MOTION_TRANSITION"
    }
}
