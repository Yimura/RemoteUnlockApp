package sh.damon.remoteunlock.proximity

import android.content.Context
import android.content.Intent
import android.os.Bundle
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class ProximityHeadlessJsTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras: Bundle = intent.extras ?: run {
            ProximityLog.w("Headless", "getTaskConfig: no extras")
            return null
        }
        ProximityLog.i("Headless", "getTaskConfig mac=${extras.getString("mac")}")
        return HeadlessJsTaskConfig(
            "ProximityUnlock",
            Arguments.fromBundle(extras),
            30_000L,
            true
        )
    }

    companion object {
        fun enqueue(ctx: Context, mac: String) {
            ProximityLog.i("Headless", "enqueue ProximityUnlock mac=$mac")
            val i = Intent(ctx, ProximityHeadlessJsTaskService::class.java)
            i.putExtra("mac", mac)
            ctx.startService(i)
            HeadlessJsTaskService.acquireWakeLockNow(ctx)
        }
    }
}
