import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";

function LivreurDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const pending = deliveries.filter(
    (delivery) =>
      delivery.statut === "en_attente"
  ).length;

  const inProgress = deliveries.filter(
    (delivery) =>
      delivery.statut === "en_cours" ||
      delivery.statut === "recuperee"
  ).length;

  const completed = deliveries.filter(
    (delivery) =>
      delivery.statut === "livree"
  ).length;

  const stats = [
    {
      title: "Livraisons en attente",
      value: pending,
      icon: "⏳",
    },
    {
      title: "Livraisons en cours",
      value: inProgress,
      icon: "🚚",
    },
    {
      title: "Livraisons terminées",
      value: completed,
      icon: "✓",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Espace livreur
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Tableau de bord
          </h1>

          <p className="mt-2 text-slate-500">
            Consultez et gérez vos livraisons.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Chargement...
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Résumé
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Vous avez actuellement{" "}
                <strong>{deliveries.length}</strong>{" "}
                livraison(s) dans le système.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default LivreurDashboard;