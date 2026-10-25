package expo.modules.banknotifications

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BankNotificationsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val listenerComponent: ComponentName
    get() = ComponentName(context, BankNotificationListener::class.java)

  override fun definition() = ModuleDefinition {
    Name("BankNotifications")

    Events("onNotification")

    Function("isPermissionGranted") {
      val enabled = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
      enabled.orEmpty().split(":").any { ComponentName.unflattenFromString(it) == listenerComponent }
    }

    Function("openPermissionSettings") {
      // A partir do Android 11 dá para abrir direto no interruptor do app.
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
          .putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, listenerComponent.flattenToString())
      } else {
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
      }
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      try {
        context.startActivity(intent)
      } catch (e: Exception) {
        context.startActivity(
          Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
      }
    }

    Function("setAllowedPackages") { packages: List<String> ->
      NotificationStore(context).setAllowedPackages(packages)
    }

    Function("drain") {
      NotificationStore(context).drain()
    }

    OnStartObserving {
      NotificationStore.onEnqueued = { sendEvent("onNotification", emptyMap<String, Any>()) }
    }

    OnStopObserving {
      NotificationStore.onEnqueued = null
    }
  }
}
