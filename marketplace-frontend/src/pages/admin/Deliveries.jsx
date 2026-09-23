import React, { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedLivreur, setSelectedLivreur] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        deliveriesResponse,
        ordersResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/deliveries"),
        api.get("/orders"),
        api.get("/users"),
      ]);

      setDeliveries(deliveriesResponse.data);
      setOrders(ordersResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const livreurs = users.filter(
    (user) =>
      user.role?.nom === "Livreur"
  );

  const availableOrders = orders.filter(
    (order) =>
      !deliveries.some(
        (delivery) =>
          delivery.order_id === order.id
      )
  );

  const assignDelivery = async (event) => {
    event.preventDefault();

    if (
      !selectedOrder ||
      !selectedLivreur
    ) {
      alert(
        "Veuillez sélectionner une commande et un livreur."
      );
      return;
    }

    try {
      setAssigning(true);

      const response = await api.post(
        "/deliveries",
        {
          order_id: selectedOrder,
          livreur_id: selectedLivreur,
        }
      );

      setDeliveries((currentDeliveries) => [
        response.data.delivery,
        ...currentDeliveries,
      ]);

      setSelectedOrder("");
      setSelectedLivreur("");

      alert(
        "Livraison affectée avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'affectation :",
        error
      );

      alert(
        error.response?.data?.message ||
          "Impossible d'affecter la livraison."
      );
    } finally {
      setAssigning(false);
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
            Gestion des livraisons
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Affectez les commandes aux livreurs et suivez les livraisons.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Affecter une livraison
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sélectionnez une commande et le livreur responsable.
            </p>
          </div>

          <form
            onSubmit={assignDelivery}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Commande
              </label>

              <select
                value={selectedOrder}
                onChange={(event) =>
                  setSelectedOrder(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">
                  Sélectionner une commande
                </option>

                {availableOrders.map(
                  (order) => (
                    <option
                      key={order.id}
                      value={order.id}
                    >
                      {order.numero
                        ? order.numero
                        : `Commande #${order.id}`}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Livreur
              </label>

              <select
                value={selectedLivreur}
                onChange={(event) =>
                  setSelectedLivreur(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">
                  Sélectionner un livreur
                </option>

                {livreurs.map(
                  (livreur) => (
                    <option
                      key={livreur.id}
                      value={livreur.id}
                    >
                      {livreur.nom ||
                        livreur.name ||
                        livreur.email}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={assigning}
                className="w-full rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning
                  ? "Affectation..."
                  : "Affecter la livraison"}
              </button>
            </div>

          </form>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Toutes les livraisons
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500">
                Chargement...
              </p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mb-3 text-4xl">
                🚚
              </div>

              <h3 className="font-semibold text-gray-800">
                Aucune livraison
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Aucune livraison n'a encore été créée.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                      Livraison
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                      Commande
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                      Livreur
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                      Statut
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                      Affectation
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {deliveries.map(
                    (delivery) => (
                      <tr
                        key={delivery.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            #{delivery.id}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {delivery.order?.numero ||
                              `Commande #${delivery.order_id}`}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {delivery.livreur?.nom ||
                                delivery.livreur?.name ||
                                delivery.livreur?.email ||
                                "Livreur"}
                            </p>

                            {delivery.livreur?.email && (
                              <p className="text-xs text-gray-400">
                                {delivery.livreur.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              delivery.statut
                            )}`}
                          >
                            {getStatusLabel(
                              delivery.statut
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {delivery.date_affectation
                              ? new Date(
                                  delivery.date_affectation
                                ).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </span>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}