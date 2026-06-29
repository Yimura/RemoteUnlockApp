package sh.damon.remoteunlock.proximity

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val any = ProximityConfigStore(ctx).anyEnabled()
        ProximityLog.i("BootReceiver", "BOOT_COMPLETED anyEnabled=$any")
        if (any) ProximityServiceManager.start(ctx)
    }
}
