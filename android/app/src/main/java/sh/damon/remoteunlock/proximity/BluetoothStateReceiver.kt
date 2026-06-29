package sh.damon.remoteunlock.proximity

import android.bluetooth.BluetoothAdapter
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BluetoothStateReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action != BluetoothAdapter.ACTION_STATE_CHANGED) return
        val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
        ProximityLog.d("BtReceiver", "ACTION_STATE_CHANGED state=$state")
        if (state == BluetoothAdapter.STATE_ON && ProximityConfigStore(ctx).anyEnabled()) {
            ProximityLog.i("BtReceiver", "BT ON + anyEnabled -> service start")
            ProximityServiceManager.start(ctx)
        }
    }
}
