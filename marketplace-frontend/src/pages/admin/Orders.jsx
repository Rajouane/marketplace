import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
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
    loadOrders();
  }, []);

  const updateStatus = async (order, status) => {
    try {
      await api.put(`/orders/${order.id}`, {
        statut: status,
      });

      await loadOrders();

      if (selectedOrder?.id === order.id) {
        const response = await api.get(
          `/orders/${order.id}`
        );

        setSelectedOrder(response.data);
      }
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      String(order.numero || "")
        .toLowerCase()
        .includes(searchValue) ||
      order.client?.nom
        ?.toLowerCase()
        .includes(searchValue) ||
      order.client?.email
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      order.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "livree":
        return "bg-emerald-50 text-emerald-700";

      case "annulee":
        return "bg-red-50 text-red-700";

      case "expediee":
        return "bg-blue-50 text-blue-700";

      case "preparee":
        return "bg-purple-50 text-purple-700";

      case "confirmee":
        return "bg-cyan-50 text-cyan-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Commandes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consultez et gérez les commandes de la marketplace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher une commande ou un client..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chargement des commandes...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucune commande trouvée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Commande
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {order.numero ||
                            `#${order.id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID : {order.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {order.client?.nom || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {order.client?.email || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {order.total ?? 0} MAD
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            order.statut
                          )}`}
                        >
                          {order.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Détails de la commande"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Numéro
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedOrder.numero ||
                    `#${selectedOrder.id}`}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedOrder.total ?? 0} MAD
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Statut
              </p>

              <select
                value={selectedOrder.statut || ""}
                onChange={(event) =>
                  updateStatus(
                    selectedOrder,
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
              >
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

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Produits
              </p>

              <div className="space-y-2">
                {selectedOrder.items?.length ? (
                  selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.product?.nom ||
                            "Produit"}
                        </p>

                        <p className="text-sm text-slate-500">
                          Quantité : {item.quantite}
                        </p>
                      </div>

                      <p className="font-semibold text-slate-800">
                        {item.total ?? 0} MAD
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucun détail disponible.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default Orders;