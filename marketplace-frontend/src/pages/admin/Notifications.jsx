import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/notifications"
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notification) => {
    try {
      await api.put(
        `/notifications/${notification.id}`,
        {
          lu: true,
        }
      );

      await loadNotifications();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier la notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(
        "/notifications/read-all"
      );

      await loadNotifications();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de marquer les notifications."
      );
    }
  };

  const deleteNotification = async (
    notification
  ) => {
    const confirmed = window.confirm(
      "Supprimer cette notification ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/notifications/${notification.id}`
      );

      await loadNotifications();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer la notification."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Consultez les notifications de votre compte.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tout marquer comme lu
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Aucune notification.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={[
                  "rounded-2xl border bg-white p-5 shadow-sm",
                  notification.lu
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/30",
                ].join(" ")}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {notification.titre}
                      </h3>

                      {!notification.lu && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notification.contenu}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!notification.lu && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Marquer comme lu
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteNotification(
                          notification
                        )
                      }
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;