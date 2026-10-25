package expo.modules.banknotifications

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Fila persistente (SharedPreferences) das notificações capturadas com o app fechado.
 * O JS esvazia a fila quando o app abre ou volta para o primeiro plano.
 */
internal class NotificationStore(context: Context) {
  private val prefs = context.getSharedPreferences("bank_notifications", Context.MODE_PRIVATE)

  fun allowedPackages(): Set<String> = prefs.getStringSet(KEY_ALLOWED, null) ?: emptySet()

  fun setAllowedPackages(packages: List<String>) {
    prefs.edit().putStringSet(KEY_ALLOWED, packages.toSet()).apply()
  }

  fun enqueue(id: String, packageName: String, title: String, text: String, postedAt: Long) =
    synchronized(lock) {
      val queue = JSONArray(prefs.getString(KEY_QUEUE, "[]"))
      queue.put(
        JSONObject()
          .put("id", id)
          .put("packageName", packageName)
          .put("title", title)
          .put("text", text)
          .put("postedAt", postedAt)
      )
      while (queue.length() > MAX_QUEUED) queue.remove(0)
      prefs.edit().putString(KEY_QUEUE, queue.toString()).commit()
    }

  /** Devolve a fila (JSON) e a esvazia. */
  fun drain(): String = synchronized(lock) {
    val queue = prefs.getString(KEY_QUEUE, "[]") ?: "[]"
    prefs.edit().remove(KEY_QUEUE).commit()
    queue
  }

  companion object {
    private const val KEY_ALLOWED = "allowed_packages"
    private const val KEY_QUEUE = "queue"
    private const val MAX_QUEUED = 200
    private val lock = Any()

    /** Avisa o módulo (quando o JS está ouvindo) que chegou notificação nova. */
    @Volatile
    var onEnqueued: (() -> Unit)? = null
  }
}
