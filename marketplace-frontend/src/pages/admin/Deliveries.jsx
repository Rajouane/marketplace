import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/deliveries");

      setDeliveries(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les livraisons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const updateStatus = async (
    delivery,
    status
  ) => {
    try {
      await api.put(
        `/deliveries/${delivery.id}`,
        {
          statut: status,
        }
      );

      await loadDeliveries();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier la livraison."
      );
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
            Livraisons
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Suivez l'état des livraisons.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chargement des livraisons...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucune livraison.
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
                      Livreur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Modifier
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {delivery.order?.numero ||
                            `#${delivery.order_id}`}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {delivery.livreur?.nom ||
                          "Non affecté"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {delivery.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <select
                            value={
                              delivery.statut || ""
                            }
                            onChange={(event) =>
                              updateStatus(
                                delivery,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-900"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Deliveries;