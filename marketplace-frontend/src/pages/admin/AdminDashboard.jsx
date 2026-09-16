import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function QuickLink({ title, description, path }) {
  return (
    <Link
      to={path}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0b1736]">
          →
        </span>
      </div>
    </Link>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    shops: 0,
    products: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      setStats({
        users: response.data.users ?? 0,
        shops: response.data.shops ?? 0,
        products: response.data.products ?? 0,
        orders: response.data.orders ?? 0,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger le tableau de bord."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Tableau de bord
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Vue générale de votre marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Utilisateurs"
            value={loading ? "..." : stats.users}
            description="Comptes enregistrés"
          />

          <StatCard
            title="Boutiques"
            value={loading ? "..." : stats.shops}
            description="Boutiques actives"
          />

          <StatCard
            title="Produits"
            value={loading ? "..." : stats.products}
            description="Produits publiés"
          />

          <StatCard
            title="Commandes"
            value={loading ? "..." : stats.orders}
            description="Commandes enregistrées"
          />

        </div>

        {/* QUICK ACTIONS */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Gestion rapide
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accédez directement aux principales sections.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <QuickLink
              title="Utilisateurs"
              description="Gérer les comptes et les rôles."
              path="/admin/users"
            />

            <QuickLink
              title="Boutiques"
              description="Consulter et gérer les vendeurs."
              path="/admin/shops"
            />

            <QuickLink
              title="Produits"
              description="Superviser le catalogue."
              path="/admin/products"
            />

            <QuickLink
              title="Catégories"
              description="Organiser le catalogue."
              path="/admin/categories"
            />

            <QuickLink
              title="Commandes"
              description="Suivre les commandes."
              path="/admin/orders"
            />

            <QuickLink
              title="Livraisons"
              description="Superviser les livraisons."
              path="/admin/deliveries"
            />

          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;