import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
  percentage,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
        >
          <span className="text-lg">{icon}</span>
        </div>

        {percentage !== undefined && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {percentage}%
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// QUICK LINK
// ============================================================

function QuickLink({
  title,
  description,
  path,
  icon,
}) {
  return (
    <Link
      to={path}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-[#0b1736] group-hover:text-white">
          {icon}
        </div>

        <span className="text-xl text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-[#0b1736]">
          →
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================

function ProgressBar({
  label,
  value,
  max,
  icon,
}) {
  const percentage =
    max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>{icon}</span>

          <span className="text-sm font-medium text-slate-700">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {value}
          </span>

          <span className="text-xs text-slate-400">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0b1736] transition-all duration-700"
          style={{
            width: `${value > 0 ? Math.max(percentage, 3) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// BAR CHART
// ============================================================

function BarChart({ stats, maxValue }) {
  const items = [
    {
      label: "Utilisateurs",
      shortLabel: "Users",
      value: stats.users,
      icon: "👥",
    },
    {
      label: "Boutiques",
      shortLabel: "Shops",
      value: stats.shops,
      icon: "🏪",
    },
    {
      label: "Produits",
      shortLabel: "Products",
      value: stats.products,
      icon: "📦",
    },
    {
      label: "Commandes",
      shortLabel: "Orders",
      value: stats.orders,
      icon: "🛒",
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex h-72 items-end gap-4 border-b border-slate-200 px-2 sm:gap-8">
        {items.map((item) => {
          const height =
            maxValue > 0
              ? Math.max(
                  (item.value / maxValue) * 100,
                  item.value > 0 ? 5 : 0
                )
              : 0;

          return (
            <div
              key={item.label}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              <span className="mb-2 text-sm font-bold text-slate-800">
                {item.value}
              </span>

              <div className="flex h-[78%] w-full items-end justify-center">
                <div
                  className="w-full max-w-17.5 rounded-t-xl bg-[#0b1736] transition-all duration-700 hover:bg-[#162753]"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>

              <div className="mt-3 text-center">
                <p className="text-base">{item.icon}</p>

                <p className="mt-1 hidden text-xs font-medium text-slate-500 sm:block">
                  {item.label}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 sm:hidden">
                  {item.shortLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// DONUT CHART
// ============================================================

function DonutChart({ stats, total }) {
  const usersPercentage =
    total > 0 ? (stats.users / total) * 100 : 0;

  const shopsPercentage =
    total > 0 ? (stats.shops / total) * 100 : 0;

  const productsPercentage =
    total > 0 ? (stats.products / total) * 100 : 0;

  const usersEnd = usersPercentage;

  const shopsEnd =
    usersEnd + shopsPercentage;

  const productsEnd =
    shopsEnd + productsPercentage;

  const gradient =
    total > 0
      ? `conic-gradient(
          #0b1736 0% ${usersEnd}%,
          #334155 ${usersEnd}% ${shopsEnd}%,
          #64748b ${shopsEnd}% ${productsEnd}%,
          #94a3b8 ${productsEnd}% 100%
        )`
      : "#e2e8f0";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-52 w-52 items-center justify-center rounded-full"
        style={{
          background: gradient,
        }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-bold text-slate-900">
            {total}
          </span>

          <span className="mt-1 text-xs text-slate-400">
            éléments
          </span>
        </div>
      </div>

      <div className="mt-7 grid w-full grid-cols-2 gap-4">
        <LegendItem
          label="Utilisateurs"
          value={stats.users}
          color="bg-[#0b1736]"
        />

        <LegendItem
          label="Boutiques"
          value={stats.shops}
          color="bg-slate-700"
        />

        <LegendItem
          label="Produits"
          value={stats.products}
          color="bg-slate-500"
        />

        <LegendItem
          label="Commandes"
          value={stats.orders}
          color="bg-slate-400"
        />
      </div>
    </div>
  );
}

// ============================================================
// LEGEND
// ============================================================

function LegendItem({
  label,
  value,
  color,
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
      />

      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STATUS ITEM
// ============================================================

function StatusItem({
  label,
  value,
  description,
  icon,
  status,
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[status]}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {label}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <span className="text-lg font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    shops: 0,
    products: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

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

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================================
  // CALCULS
  // ==========================================================

  const total =
    stats.users +
    stats.shops +
    stats.products +
    stats.orders;

  const maxStat = Math.max(
    stats.users,
    stats.shops,
    stats.products,
    stats.orders,
    1
  );

  const usersShare =
    total > 0
      ? Math.round((stats.users / total) * 100)
      : 0;

  const shopsShare =
    total > 0
      ? Math.round((stats.shops / total) * 100)
      : 0;

  const productsShare =
    total > 0
      ? Math.round((stats.products / total) * 100)
      : 0;

  const ordersShare =
    total > 0
      ? Math.round((stats.orders / total) * 100)
      : 0;

  // Indice basé uniquement sur les données disponibles.
  const activityScore =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (stats.orders * 30 +
              stats.products * 20 +
              stats.shops * 30 +
              stats.users * 20) /
              Math.max(total, 1)
          )
        )
      : 0;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="overflow-hidden rounded-3xl bg-[#0b1736] shadow-lg">
          <div className="relative p-7 sm:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />

            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <p className="text-sm font-medium text-slate-300">
                    Administration
                  </p>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Tableau de bord
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Une vue centralisée de l'activité de votre
                  marketplace : utilisateurs, boutiques, produits
                  et commandes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0b1736] shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>↻</span>

                  {loading
                    ? "Actualisation..."
                    : "Actualiser"}
                </button>

                <Link
                  to="/admin/users"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Gérer la plateforme
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <p>{error}</p>
          </div>
        )}

        {/* ==================================================
            KPI
        ================================================== */}

        <section>
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-400">
              Vue d'ensemble
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Indicateurs principaux
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Utilisateurs"
              value={loading ? "..." : stats.users}
              description="Comptes enregistrés"
              percentage={usersShare}
              icon="👥"
              accent="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Boutiques"
              value={loading ? "..." : stats.shops}
              description="Boutiques présentes"
              percentage={shopsShare}
              icon="🏪"
              accent="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="Produits"
              value={loading ? "..." : stats.products}
              description="Produits disponibles"
              percentage={productsShare}
              icon="📦"
              accent="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Commandes"
              value={loading ? "..." : stats.orders}
              description="Commandes enregistrées"
              percentage={ordersShare}
              icon="🛒"
              accent="bg-amber-50 text-amber-600"
            />
          </div>
        </section>

        {/* ==================================================
            MAIN ANALYTICS
        ================================================== */}

        <section className="grid gap-6 xl:grid-cols-3">
          {/* BAR CHART */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Analyse
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Activité de la marketplace
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Comparaison du volume des principales
                  ressources.
                </p>
              </div>

              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Données actuelles
              </span>
            </div>

            <BarChart
              stats={stats}
              maxValue={maxStat}
            />
          </div>

          {/* DONUT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400">
                Répartition
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Composition
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Répartition des éléments actuellement
                disponibles.
              </p>
            </div>

            <DonutChart
              stats={stats}
              total={total}
            />
          </div>
        </section>

        {/* ==================================================
            PLATFORM STATUS
        ================================================== */}

        <section className="grid gap-6 lg:grid-cols-3">
          {/* PLATFORM HEALTH */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400">
                Plateforme
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                État général
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Indicateurs calculés à partir des données
                disponibles.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #0b1736 ${activityScore}%,
                      #e2e8f0 ${activityScore}% 100%
                    )`,
                  }}
                />

                <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-bold text-slate-900">
                    {activityScore}
                  </span>

                  <span className="text-[10px] text-slate-400">
                    indice
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Activité globale
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Cet indicateur résume les volumes
                  actuellement disponibles.
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-400">
                Ressources
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                État de la plateforme
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatusItem
                label="Utilisateurs"
                value={stats.users}
                description="Comptes enregistrés"
                icon="👥"
                status="info"
              />

              <StatusItem
                label="Boutiques"
                value={stats.shops}
                description="Boutiques présentes"
                icon="🏪"
                status="success"
              />

              <StatusItem
                label="Catalogue"
                value={stats.products}
                description="Produits disponibles"
                icon="📦"
                status="success"
              />

              <StatusItem
                label="Commandes"
                value={stats.orders}
                description="Commandes enregistrées"
                icon="🛒"
                status="warning"
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            VOLUME
        ================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400">
                Comparaison
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Volume des ressources
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Comparaison relative entre les différentes
                ressources.
              </p>
            </div>

            <div className="space-y-6">
              <ProgressBar
                label="Utilisateurs"
                value={stats.users}
                max={maxStat}
                icon="👥"
              />

              <ProgressBar
                label="Boutiques"
                value={stats.shops}
                max={maxStat}
                icon="🏪"
              />

              <ProgressBar
                label="Produits"
                value={stats.products}
                max={maxStat}
                icon="📦"
              />

              <ProgressBar
                label="Commandes"
                value={stats.orders}
                max={maxStat}
                icon="🛒"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0b1736] p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">
              Synthèse
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Vue globale
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Résumé rapide de l'état actuel de la
              marketplace.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {total}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Utilisateurs
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {usersShare}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Produits
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {productsShare}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">
                  Commandes
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {ordersShare}%
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium text-slate-400">
                Indice d'activité
              </p>

              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-bold text-white">
                  {activityScore}
                </span>

                <span className="text-xs text-slate-400">
                  / 100
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section>
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-400">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Gestion rapide
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accédez directement aux principales sections
              de votre administration.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <QuickLink
              title="Utilisateurs"
              description="Gérer les comptes et les rôles."
              path="/admin/users"
              icon="👥"
            />

            <QuickLink
              title="Boutiques"
              description="Consulter et gérer les vendeurs."
              path="/admin/shops"
              icon="🏪"
            />

            <QuickLink
              title="Produits"
              description="Superviser le catalogue."
              path="/admin/products"
              icon="📦"
            />

            <QuickLink
              title="Catégories"
              description="Organiser le catalogue."
              path="/admin/categories"
              icon="🗂️"
            />

            <QuickLink
              title="Commandes"
              description="Suivre les commandes."
              path="/admin/orders"
              icon="🛒"
            />

            <QuickLink
              title="Livraisons"
              description="Superviser les livraisons."
              path="/admin/deliveries"
              icon="🚚"
            />
          </div>
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Administration de la marketplace
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Gérez les utilisateurs, boutiques, produits,
                catégories, commandes et livraisons depuis
                votre espace d'administration.
              </p>
            </div>

            <Link
              to="/admin/users"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#162753]"
            >
              Gérer les utilisateurs
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;