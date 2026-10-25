package expo.modules.banknotifications

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Recebe todas as notificações do aparelho, mas só guarda as dos apps de banco
 * escolhidos pelo usuário e que mencionam um valor em reais. O resto é descartado aqui.
 */
class BankNotificationListener : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    val store = NotificationStore(applicationContext)
    if (sbn.packageName !in store.allowedPackages()) return

    val notification = sbn.notification
    if (notification.flags and Notification.FLAG_GROUP_SUMMARY != 0) return

    val extras = notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
    val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
      ?: extras.getCharSequence(Notification.EXTRA_TEXT))?.toString().orEmpty()
    if (!"$title $text".contains("R\$")) return

    store.enqueue("${sbn.key}|${sbn.postTime}", sbn.packageName, title, text, sbn.postTime)
    NotificationStore.onEnqueued?.invoke()
  }
}
