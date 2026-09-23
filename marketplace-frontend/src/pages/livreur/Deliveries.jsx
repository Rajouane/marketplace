import React, { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

export default function LivreurDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get("/deliveries");

      setDeliveries(response.data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des livraisons :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId, statut) => {
    try {
      setUpdatingId(deliveryId);

      const response = await api.put(
        `/deliveries/${deliveryId}`,
        {
          statut,
        }
      );

      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((delivery) =>
          delivery.id === deliveryId
            ? response.data.delivery
            : delivery
        )
      );
    } catch (error) {
      console.error(
        "Erreur lors de la modification du statut :",
        error
      );

      alert(
        error.response?.data?.message ||
          "Une erreur est survenue."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      en_attente: "En attente",
      recuperee: "Récupérée",
      en_cours: "En cours",
      livree: "Livrée",
      echec: "Échec",
    };

    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      en_attente:
        "bg-orange-100 text-orange-700",
      recuperee:
        "bg-indigo-100 text-indigo-700",
      en_cours:
        "bg-blue-100 text-blue-700",
      livree:
        "bg-green-100 text-green-700",
      echec:
        "bg-red-100 text-red-700",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700"
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Mes livraisons
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consultez et mettez à jour vos livraisons.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Chargement des livraisons...
            </p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mb-4 text-5xl">
              🚚
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Aucune livraison
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez aucune livraison affectée.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                      <span className="text-xl">
                        🚚
                      </span>
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Livraison #{delivery.id}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Commande #{delivery.order_id}
                      </p>

                      {delivery.order?.numero && (
                        <p className="mt-1 text-sm text-gray-500">
                          Numéro : {delivery.order.numero}
                        </p>
                      )}

                      {delivery.date_affectation && (
                        <p className="mt-2 text-xs text-gray-400">
                          Affectée le :{" "}
                          {new Date(
                            delivery.date_affectation
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    <span
                      className={`rounded-full px-3 py-1 text-center text-xs font-semibold ${getStatusClass(
                        delivery.statut
                      )}`}
                    >
                      {getStatusLabel(
                        delivery.statut
                      )}
                    </span>

                    <select
                      value={delivery.statut}
                      disabled={
                        updatingId === delivery.id ||
                        delivery.statut === "livree"
                      }
                      onChange={(event) =>
                        updateStatus(
                          delivery.id,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="en_attente">
                        En attente
                      </option>

                      <option value="recuperee">
                        Récupérée
                      </option>

                      <option value="en_cours">
                        En cours
                      </option>

                      <option value="livree">
                        Livrée
                      </option>

                      <option value="echec">
                        Échec
                      </option>
                    </select>

                  </div>

                </div>

                {delivery.statut === "livree" &&
                  delivery.date_livraison && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-sm text-green-600">
                        Livrée le{" "}
                        {new Date(
                          delivery.date_livraison
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}