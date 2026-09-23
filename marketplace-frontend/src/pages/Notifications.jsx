
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  // ======================================================
  // RÉCUPÉRER LES NOTIFICATIONS
  // ======================================================

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");

        setNotifications(response.data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des notifications :",
          error
        );
      }
    };

    fetchNotifications();
  }, []);

  // ======================================================
  // CLIQUER SUR UNE NOTIFICATION
  // ======================================================

  const handleNotificationClick = async (notification) => {
    try {
      // Si la notification n'est pas encore lue
      if (!notification.lu) {
        await api.put(`/notifications/${notification.id}`);

        // Mettre à jour immédiatement l'affichage
        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id
              ? { ...item, lu: true }
              : item
          )
        );
      }

      // Récupérer l'utilisateur connecté
      const storedUser = localStorage.getItem("marketplace_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const role = user?.role?.nom;

      // Aller vers la page des commandes selon le rôle
      if (role === "Client") {
        navigate("/client/orders");
      } else if (role === "Vendeur") {
        navigate("/vendeur/orders");
      } else if (role === "Administrateur") {
        navigate("/admin/orders");
      } else if (role === "Livreur") {
        navigate("/livreur/deliveries");
      }
    } catch (error) {
      console.error(
        "Erreur lors du traitement de la notification :",
        error
      );
    }
  };

  // ======================================================
  // NOMBRE DE NOTIFICATIONS NON LUES
  // ======================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.lu
  ).length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Consultez vos dernières notifications
            </p>
          </div>

          <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
            {unreadCount} non lue
            {unreadCount > 1 ? "s" : ""}
          </div>
        </div>

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mb-3 text-4xl">
                🔔
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Aucune notification
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className={`w-full cursor-pointer rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                  notification.lu
                    ? "border-gray-200"
                    : "border-orange-200 bg-orange-50/30"
                }`}
              >
                <div className="flex items-start gap-4">

                  {/* ==================================================
                      ICON
                  ================================================== */}

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.lu
                        ? "bg-gray-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <span className="text-xl">
                      {notification.lu ? "🔔" : "🔴"}
                    </span>
                  </div>

                  {/* ==================================================
                      CONTENT
                  ================================================== */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {notification.titre}
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {notification.contenu}
                        </p>
                      </div>

                      {!notification.lu && (
                        <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                          Nouvelle
                        </span>
                      )}
                    </div>

                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div className="mt-4 flex items-center gap-3">

                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {notification.type || "Notification"}
                      </span>

                      <span className="text-xs text-gray-400">
                        {notification.lu
                          ? "Lue"
                          : "Non lue"}
                      </span>

                      <span className="ml-auto text-xs font-medium text-orange-500">
                        Voir la commande →
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

