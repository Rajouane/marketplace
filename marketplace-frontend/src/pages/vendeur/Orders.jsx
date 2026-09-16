import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import api from "../../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("marketplace_user") || "null"
  );

  const userId = user?.id;

  /*
  |--------------------------------------------------------------------------
  | Charger les commandes du vendeur
  |--------------------------------------------------------------------------
  */

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/vendeur/orders");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setOrders(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les commandes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | Filtrage
  |--------------------------------------------------------------------------
  */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderNumber =
        order.numero ||
        `Commande #${order.id}`;

      const clientName =
        order.client?.nom ||
        order.client?.name ||
        "";

      const clientEmail =
        order.client?.email ||
        "";

      const searchValue =
        `${orderNumber} ${clientName} ${clientEmail}`.toLowerCase();

      const matchesSearch =
        searchValue.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "all" ||
        order.statut === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Statuts
  |--------------------------------------------------------------------------
  */

  const getStatusLabel = (status) => {
    switch (status) {
      case "en_attente":
        return "En attente";

      case "confirmee":
        return "Confirmée";

      case "preparee":
        return "Préparée";

      case "expediee":
        return "Expédiée";

      case "livree":
        return "Livrée";

      case "annulee":
        return "Annulée";

      default:
        return status || "-";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "en_attente":
        return "bg-amber-50 text-amber-700";

      case "confirmee":
        return "bg-blue-50 text-blue-700";

      case "preparee":
        return "bg-indigo-50 text-indigo-700";

      case "expediee":
        return "bg-violet-50 text-violet-700";

      case "livree":
        return "bg-emerald-50 text-emerald-700";

      case "annulee":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Détails
  |--------------------------------------------------------------------------
  */

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Prochain statut
  |--------------------------------------------------------------------------
  */

  const getNextStatus = (status) => {
    switch (status) {
      case "en_attente":
        return "confirmee";

      case "confirmee":
        return "preparee";

      case "preparee":
        return "expediee";

      case "expediee":
        return "livree";

      default:
        return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Modifier le statut
  |--------------------------------------------------------------------------
  */

  const updateOrderStatus = async (order) => {
    const nextStatus =
      getNextStatus(order.statut);

    if (!nextStatus) {
      return;
    }

    setUpdatingId(order.id);
    setError("");

    try {
      const response = await api.put(
        `/vendeur/orders/${order.id}`,
        {
          statut: nextStatus,
        }
      );

      const updatedOrder =
        response.data?.order ||
        response.data;

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                ...updatedOrder,
                statut:
                  updatedOrder.statut ||
                  nextStatus,
              }
            : item
        )
      );

      setSelectedOrder((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          ...updatedOrder,
          statut:
            updatedOrder.statut ||
            nextStatus,
        };
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Colonnes du tableau
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      key: "numero",
      label: "Commande",

      render: (order) => (
        <div>
          <p className="font-semibold text-slate-800">
            {order.numero ||
              `Commande #${order.id}`}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            ID : {order.id}
          </p>
        </div>
      ),
    },

    {
      key: "client",
      label: "Client",

      render: (order) => (
        <div>
          <p className="font-medium text-slate-700">
            {order.client?.nom ||
              order.client?.name ||
              "Client"}
          </p>

          {order.client?.email && (
            <p className="mt-1 text-xs text-slate-400">
              {order.client.email}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "total",
      label: "Total",

      render: (order) => (
        <span className="font-semibold text-slate-800">
          {Number(
            order.total || 0
          ).toFixed(2)}{" "}
          DH
        </span>
      ),
    },

    {
      key: "statut",
      label: "Statut",

      render: (order) => (
        <span
          className={[
            "inline-flex rounded-full px-3 py-1",
            "text-xs font-medium",
            getStatusClass(
              order.statut
            ),
          ].join(" ")}
        >
          {getStatusLabel(
            order.statut
          )}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (order) => {
        const nextStatus =
          getNextStatus(
            order.statut
          );

        return (
          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                openDetails(order)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Détails
            </button>

            {nextStatus && (
              <button
                type="button"
                disabled={
                  updatingId ===
                  order.id
                }
                onClick={() =>
                  updateOrderStatus(order)
                }
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingId ===
                order.id
                  ? "..."
                  : getStatusLabel(
                      nextStatus
                    )}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Interface
  |--------------------------------------------------------------------------
  */

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Commandes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consultez et gérez les commandes contenant vos produits.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher une commande ou un client..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="en_attente">
                En attente
              </option>

              <option value="confirmee">
                Confirmée
              </option>

              <option value="preparee">
                Préparée
              </option>

              <option value="expediee">
                Expédiée
              </option>

              <option value="livree">
                Livrée
              </option>

              <option value="annulee">
                Annulée
              </option>
            </select>

          </div>
        </div>

        <Table
          columns={columns}
          data={filteredOrders}
          loading={loading}
          emptyMessage="Aucune commande trouvée."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() =>
            setIsModalOpen(false)
          }
          title={
            selectedOrder
              ? selectedOrder.numero ||
                `Commande #${selectedOrder.id}`
              : "Détails de la commande"
          }
          size="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">

              {/* Client et statut */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Client
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedOrder.client?.nom ||
                      selectedOrder.client?.name ||
                      "Client"}
                  </p>

                  {selectedOrder.client?.email && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedOrder.client.email}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Statut
                  </p>

                  <span
                    className={[
                      "mt-2 inline-flex rounded-full px-3 py-1",
                      "text-xs font-medium",
                      getStatusClass(
                        selectedOrder.statut
                      ),
                    ].join(" ")}
                  >
                    {getStatusLabel(
                      selectedOrder.statut
                    )}
                  </span>
                </div>

              </div>

              {/* Adresse */}

              {selectedOrder.address && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Adresse de livraison
                  </h3>

                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">

                    <p>
                      {selectedOrder.address.adresse}
                    </p>

                    <p className="mt-1">
                      {selectedOrder.address.ville}

                      {selectedOrder.address.code_postal
                        ? `, ${selectedOrder.address.code_postal}`
                        : ""}
                    </p>

                    <p className="mt-1">
                      {selectedOrder.address.pays ||
                        "Maroc"}
                    </p>

                  </div>
                </div>
              )}

              {/* Produits */}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Produits
                </h3>

                {Array.isArray(
                  selectedOrder.items
                ) &&
                selectedOrder.items.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">

                    {selectedOrder.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 p-4"
                        >

                          <div>
                            <p className="font-medium text-slate-800">
                              {item.product?.nom ||
                                `Produit #${item.product_id}`}
                            </p>

                            {item.shop?.nom && (
                              <p className="mt-1 text-xs text-slate-400">
                                Boutique :{" "}
                                {item.shop.nom}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-slate-400">
                              Quantité :{" "}
                              {item.quantite}
                            </p>
                          </div>

                          <div className="text-right">

                            <p className="font-semibold text-slate-800">
                              {Number(
                                item.total || 0
                              ).toFixed(2)}{" "}
                              DH
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {Number(
                                item.prix_unitaire || 0
                              ).toFixed(2)}{" "}
                              DH / unité
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Aucun détail de produit disponible.
                  </div>
                )}
              </div>

              {/* Total */}

              <div className="border-t border-slate-200 pt-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Sous-total
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {Number(
                      selectedOrder.sous_total || 0
                    ).toFixed(2)}{" "}
                    DH
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Livraison
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {Number(
                      selectedOrder.frais_livraison || 0
                    ).toFixed(2)}{" "}
                    DH
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Réduction
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {Number(
                      selectedOrder.reduction || 0
                    ).toFixed(2)}{" "}
                    DH
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">

                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-lg font-bold text-slate-900">
                    {Number(
                      selectedOrder.total || 0
                    ).toFixed(2)}{" "}
                    DH
                  </span>

                </div>

              </div>

              {/* Modifier le statut */}

              {getNextStatus(
                selectedOrder.statut
              ) && (
                <div className="flex justify-end border-t border-slate-200 pt-4">

                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      selectedOrder.id
                    }
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder
                      )
                    }
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingId ===
                    selectedOrder.id
                      ? "Modification..."
                      : `Passer à : ${getStatusLabel(
                          getNextStatus(
                            selectedOrder.statut
                          )
                        )}`}
                  </button>

                </div>
              )}

            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
}

export default Orders;