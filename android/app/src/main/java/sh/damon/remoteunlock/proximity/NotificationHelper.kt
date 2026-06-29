package sh.damon.remoteunlock.proximity

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

object NotificationHelper {

    private const val CHANNEL = "proximity_confirm"
    private const val NOTIF_ID_BASE = 5000

    fun postConfirm(ctx: Context, mac: String) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(NotificationChannel(
                CHANNEL, "Auto-unlock confirm", NotificationManager.IMPORTANCE_HIGH
            ))
        }
        val unlockIntent = Intent(ctx, ProximityHeadlessJsTaskService::class.java).apply {
            putExtra("mac", mac)
        }
        val pi = PendingIntent.getService(
            ctx, mac.hashCode(), unlockIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val notif = NotificationCompat.Builder(ctx, CHANNEL)
            .setContentTitle("Vehicle nearby")
            .setContentText("Tap to unlock")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setAutoCancel(true)
            .addAction(android.R.drawable.ic_lock_idle_lock, "Unlock", pi)
            .build()
        nm.notify(NOTIF_ID_BASE + (mac.hashCode() and 0x7fff), notif)
    }
}
