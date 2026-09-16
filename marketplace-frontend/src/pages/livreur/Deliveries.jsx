import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const response = await api.get("/deliveries");

      setDeliveries(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (delivery, status) => {
    setUpdatingId(delivery.id);

    try {
      await api.put(`/deliveries/${delivery.id}`, {
        statut: status,
      });

      await loadDeliveries();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Impossible de modifier le statut."
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
        "bg-amber-100 text-amber-700",
      recuperee:
        "bg-blue-100 text-blue-700",
      en_cours:
        "bg-indigo-100 text-indigo-700",
      livree:
        "bg-emerald-100 text-emerald-700",
      echec:
        "bg-red-100 text-red-700",
    };

    return (
      classes[status] ||
      "bg-slate-100 text-slate-700"
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Espace livreur
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Mes livraisons
          </h1>

          <p className="mt-2 text-slate-500">
            Gérez le statut de vos livraisons.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Chargement...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Aucune livraison disponible.
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <p className="text-xs text-slate-500">
                      Livraison #{delivery.id}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      Commande{" "}
                      {delivery.order?.numero ||
                        `#${delivery.order_id}`}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Client :{" "}
                      {delivery.order?.client?.nom ||
                        "Client"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      delivery.statut
                    )}`}
                  >
                    {getStatusLabel(
                      delivery.statut
                    )}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  {delivery.statut === "en_attente" && (
                    <button
                      type="button"
                      disabled={
                        updatingId === delivery.id
                      }
                      onClick={() =>
                        updateStatus(
                          delivery,
                          "recuperee"
                        )
                      }
                      className="rounded-lg bg-[#0b1736] px-4 py-2 text-sm font-medium text-white hover:bg-[#142653] disabled:opacity-50"
                    >
                      Récupérer
                    </button>
                  )}

                  {delivery.statut === "recuperee" && (
                    <button
                      type="button"
                      disabled={
                        updatingId === delivery.id
                      }
                      onClick={() =>
                        updateStatus(
                          delivery,
                          "en_cours"
                        )
                      }
                      className="rounded-lg bg-[#0b1736] px-4 py-2 text-sm font-medium text-white hover:bg-[#142653] disabled:opacity-50"
                    >
                      Démarrer la livraison
                    </button>
                  )}

                  {delivery.statut === "en_cours" && (
                    <button
                      type="button"
                      disabled={
                        updatingId === delivery.id
                      }
                      onClick={() =>
                        updateStatus(
                          delivery,
                          "livree"
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Marquer comme livrée
                    </button>
                  )}

                  {(delivery.statut === "en_attente" ||
                    delivery.statut === "recuperee" ||
                    delivery.statut === "en_cours") && (
                    <button
                      type="button"
                      disabled={
                        updatingId === delivery.id
                      }
                      onClick={() =>
                        updateStatus(
                          delivery,
                          "echec"
                        )
                      }
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Signaler un échec
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Deliveries;