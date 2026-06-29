package sh.damon.remoteunlock.proximity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

object ProximityNotifier {
    const val NOTIF_ID = 4242
    private const val CHANNEL = "proximity"

    enum class Status { NoDevice, Far, Nearing, Near }

    fun ensureChannel(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL, "Proximity", NotificationManager.IMPORTANCE_LOW),
        )
    }

    fun build(ctx: Context, primaryMac: String?, status: Status, rssi: Int?): Notification {
        val rssiTxt = rssi?.let { " ($it dBm)" } ?: ""
        val text = when (status) {
            Status.NoDevice -> "No device detected"
            Status.Far      -> "Connected · far$rssiTxt"
            Status.Nearing  -> "Connected · nearing$rssiTxt"
            Status.Near     -> "Connected · at unlock distance$rssiTxt"
        }
        val builder = NotificationCompat.Builder(ctx, CHANNEL)
            .setContentTitle("Remote Unlock")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .setOnlyAlertOnce(true)

        if (primaryMac != null) {
            builder.addAction(
                android.R.drawable.ic_lock_idle_lock,
                "Unlock",
                actionIntent(ctx, primaryMac, "unlock"),
            )
            builder.addAction(
                android.R.drawable.ic_lock_lock,
                "Lock",
                actionIntent(ctx, primaryMac, "lock"),
            )
        }
        return builder.build()
    }

    private fun actionIntent(ctx: Context, mac: String, action: String): PendingIntent {
        val intent = Intent(ctx, ProximityHeadlessJsTaskService::class.java)
            .putExtra("mac", mac)
            .putExtra("action", action)
        return PendingIntent.getService(
            ctx,
            (action + mac).hashCode(),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
