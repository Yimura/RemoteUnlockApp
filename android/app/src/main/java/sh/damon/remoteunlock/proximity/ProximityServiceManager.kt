package sh.damon.remoteunlock.proximity

import android.content.Context
import android.content.Intent
import android.os.Build

object ProximityServiceManager {
    fun start(ctx: Context) {
        val i = Intent(ctx, ProximityService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(i)
        } else {
            ctx.startService(i)
        }
    }

    fun stop(ctx: Context) {
        ctx.stopService(Intent(ctx, ProximityService::class.java))
    }
}
