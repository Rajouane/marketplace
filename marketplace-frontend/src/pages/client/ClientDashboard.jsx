import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  label,
  value,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl transition group-hover:bg-slate-900 group-hover:text-white">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {description}
        </p>

        <span className="text-xs font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">
          Voir →
        </span>
      </div>
    </button>
  );
}

// ======================================================
// DONUT CHART
// ======================================================

function OrderDonut({
  pending,
  confirmed,
  completed,
  cancelled,
  total,
}) {
  const pendingPercent =
    total > 0 ? (pending / total) * 100 : 0;

  const confirmedPercent =
    total > 0 ? (confirmed / total) * 100 : 0;

  const completedPercent =
    total > 0 ? (completed / total) * 100 : 0;

  const first = pendingPercent;
  const second = first + confirmedPercent;
  const third = second + completedPercent;

  const background =
    total === 0
      ? "conic-gradient(#e2e8f0 0% 100%)"
      : `conic-gradient(
          #f59e0b 0% ${first}%,
          #3b82f6 ${first}% ${second}%,
          #10b981 ${second}% ${third}%,
          #ef4444 ${third}% 100%
        )`;

  return (
    <div
      className="relative flex h-48 w-48 items-center justify-center rounded-full"
      style={{ background }}
    >
      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
        <span className="text-3xl font-bold text-slate-900">
          {total}
        </span>

        <span className="text-xs text-slate-400">
          commandes
        </span>
      </div>
    </div>
  );
}

// ======================================================
// LEGEND ITEM
// ======================================================

function LegendItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${color}`}
        />

        <span className="text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

// ======================================================
// ORDER STATUS BAR
// ======================================================

function OrderStatusBar({
  label,
  value,
  total,
  color,
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

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
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

function ClientDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("marketplace_user") || "null"
  );

  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        productsResponse,
        ordersResponse,
        favoritesResponse,
        cartResponse,
      ] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
        api.get("/favorites"),
        api.get("/cart"),
      ]);

      const allProducts = Array.isArray(
        productsResponse.data
      )
        ? productsResponse.data
        : [];

      const allOrders = Array.isArray(
        ordersResponse.data
      )
        ? ordersResponse.data
        : [];

      const allFavorites = Array.isArray(
        favoritesResponse.data
      )
        ? favoritesResponse.data
        : [];

      setProducts(
        allProducts.filter(
          (product) => product.statut === "publie"
        )
      );

      setOrders(allOrders);
      setFavorites(allFavorites);
      setCart(cartResponse.data);
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

  // ====================================================
  // DATA
  // ====================================================

  const cartItems = Array.isArray(cart?.items)
    ? cart.items
    : [];

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.statut === "en_attente" ||
      order.statut === "confirmee"
  ).length;

  const pendingOnly = orders.filter(
    (order) => order.statut === "en_attente"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.statut === "confirmee"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.statut === "livree" ||
      order.statut === "terminee"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.statut === "annulee" ||
      order.statut === "annule"
  ).length;

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantite || 0),
    0
  );

  // ====================================================
  // ORDER STATUS
  // ====================================================

  const orderStatusData = [
    {
      label: "En attente",
      value: pendingOnly,
      color: "bg-amber-500",
    },
    {
      label: "Confirmées",
      value: confirmedOrders,
      color: "bg-blue-500",
    },
    {
      label: "Livrées",
      value: completedOrders,
      color: "bg-emerald-500",
    },
    {
      label: "Annulées",
      value: cancelledOrders,
      color: "bg-red-500",
    },
  ];

  // ====================================================
  // RECENT ORDERS
  // ====================================================

  const recentOrders = [...orders]
    .slice(0, 7)
    .reverse();

  const maxOrderAmount = Math.max(
    ...recentOrders.map((order) =>
      Number(order.total || 0)
    ),
    1
  );

  // ====================================================
  // STATS
  // ====================================================

  const stats = [
    {
      label: "Produits disponibles",
      value: products.length,
      description: "Produits actuellement publiés",
      icon: "🛍️",
      action: () => navigate("/client/products"),
    },
    {
      label: "Mes commandes",
      value: totalOrders,
      description: "Commandes passées",
      icon: "📦",
      action: () => navigate("/client/orders"),
    },
    {
      label: "Commandes en cours",
      value: pendingOrders,
      description: "Commandes à suivre",
      icon: "🚚",
      action: () => navigate("/client/orders"),
    },
    {
      label: "Mon panier",
      value: cartCount,
      description: "Articles dans le panier",
      icon: "🛒",
      action: () => navigate("/client/cart"),
    },
  ];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-6 bg-slate-50 p-1">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="relative overflow-hidden rounded-3xl bg-[#0b1736] px-6 py-8 shadow-xl sm:px-8">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />

          <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>
              <p className="mb-2 text-sm font-medium text-slate-400">
                Espace client
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-white">
                Bienvenue {user?.nom || "Client"}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Gérez vos achats, suivez vos commandes,
                consultez vos favoris et votre panier.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/client/products")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <span>Explorer les produits</span>
              <span>→</span>
            </button>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </span>

              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={loading ? "..." : stat.value}
              description={stat.description}
              icon={stat.icon}
              onClick={stat.action}
            />
          ))}

        </div>

        {/* ==================================================
            ORDER ANALYTICS
        ================================================== */}

        <div className="grid gap-6 xl:grid-cols-3">

          {/* ORDER STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  État de mes commandes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vue globale de vos commandes.
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {totalOrders} commande
                {totalOrders > 1 ? "s" : ""}
              </div>

            </div>

            <div className="mt-8 space-y-5">

              {orderStatusData.map((item) => (
                <OrderStatusBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  total={totalOrders}
                  color={item.color}
                />
              ))}

            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {totalOrders}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  En cours
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {pendingOrders}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Livrées
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {completedOrders}
                </p>
              </div>

            </div>
          </div>

          {/* DONUT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Répartition
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Répartition de vos commandes.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <OrderDonut
                pending={pendingOnly}
                confirmed={confirmedOrders}
                completed={completedOrders}
                cancelled={cancelledOrders}
                total={totalOrders}
              />
            </div>

            <div className="mt-6 space-y-4">

              <LegendItem
                label="En attente"
                value={pendingOnly}
                color="bg-amber-500"
              />

              <LegendItem
                label="Confirmées"
                value={confirmedOrders}
                color="bg-blue-500"
              />

              <LegendItem
                label="Livrées"
                value={completedOrders}
                color="bg-emerald-500"
              />

              <LegendItem
                label="Annulées"
                value={cancelledOrders}
                color="bg-red-500"
              />

            </div>
          </div>

        </div>

        {/* ==================================================
            ACTIVITY
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Mon activité
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vue rapide de votre activité.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                📊
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/client/favorites")
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    ❤️
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Favoris
                    </p>

                    <p className="text-xs text-slate-400">
                      Produits sauvegardés
                    </p>
                  </div>

                </div>

                <span className="text-lg font-bold text-slate-900">
                  {loading ? "..." : favorites.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/client/cart")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    🛒
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Panier
                    </p>

                    <p className="text-xs text-slate-400">
                      Articles sélectionnés
                    </p>
                  </div>

                </div>

                <span className="text-lg font-bold text-slate-900">
                  {loading ? "..." : cartCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/client/products")
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    🛍️
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Catalogue
                    </p>

                    <p className="text-xs text-slate-400">
                      Produits disponibles
                    </p>
                  </div>

                </div>

                <span className="text-lg font-bold text-slate-900">
                  {loading ? "..." : products.length}
                </span>
              </button>

            </div>
          </div>

          {/* SUMMARY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Résumé de votre compte
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quelques indicateurs importants.
                </p>
              </div>

              <div className="text-2xl">
                ✨
              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-400">
                  Produits disponibles
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading ? "..." : products.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  À découvrir dans le catalogue
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-400">
                  Produits favoris
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loading ? "..." : favorites.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Produits que vous avez sauvegardés
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-400">
                  Commandes terminées
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {loading ? "..." : completedOrders}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Commandes livrées ou terminées
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-400">
                  Commandes annulées
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {loading ? "..." : cancelledOrders}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Commandes annulées
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ==================================================
            ORDER AMOUNT GRAPH
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Montant des commandes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Visualisation de vos dernières commandes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/client/orders")}
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-900 hover:underline"
            >
              Voir toutes les commandes
            </button>

          </div>

          {loading ? (

            <div className="mt-8 h-56 animate-pulse rounded-xl bg-slate-100" />

          ) : recentOrders.length === 0 ? (

            <div className="mt-8 flex h-56 items-center justify-center rounded-xl bg-slate-50">

              <div className="text-center">

                <div className="text-3xl">
                  📦
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Aucune commande disponible
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/client/products")
                  }
                  className="mt-2 text-sm font-semibold text-slate-900 hover:underline"
                >
                  Commencer mes achats
                </button>

              </div>
            </div>

          ) : (

            <div className="mt-8 overflow-x-auto">

              <div className="flex h-64 min-w-150 items-end gap-4 border-b border-slate-200 px-4">

                {recentOrders.map((order, index) => {

                  const amount = Number(
                    order.total || 0
                  );

                  const height =
                    amount === 0
                      ? 8
                      : Math.max(
                          (amount / maxOrderAmount) * 100,
                          10
                        );

                  return (
                    <div
                      key={order.id}
                      className="group flex h-full flex-1 flex-col items-center justify-end"
                    >

                      <div className="mb-2 text-xs font-semibold text-slate-600 opacity-0 transition group-hover:opacity-100">
                        {amount.toFixed(2)} DH
                      </div>

                      <div
                        className="w-full max-w-17.5 rounded-t-xl bg-slate-900 transition-all duration-300 group-hover:bg-slate-700"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <div className="mt-3 text-center">

                        <p className="text-xs font-semibold text-slate-700">
                          #{index + 1}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {order.numero ||
                            `Commande ${order.id}`}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </div>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Accès rapides
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accédez rapidement aux principales fonctionnalités.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <button
              type="button"
              onClick={() =>
                navigate("/client/products")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
                  🛍️
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-900">
                  →
                </span>

              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Parcourir les produits
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Découvrez les produits disponibles.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/client/orders")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  📦
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-900">
                  →
                </span>

              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Mes commandes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Suivez vos commandes et leur statut.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/client/favorites")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  ❤️
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-900">
                  →
                </span>

              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Mes favoris
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Retrouvez vos produits favoris.
              </p>
            </button>

          </div>
        </div>

        {/* ==================================================
            RECENT ORDERS
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-bold text-slate-900">
                Commandes récentes
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Vos dernières commandes
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/client/orders")
              }
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline"
            >
              Voir tout →
            </button>

          </div>

          <div className="p-6">

            {loading ? (

              <div className="space-y-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}

              </div>

            ) : orders.length === 0 ? (

              <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                  📦
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Vous n'avez aucune commande.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Commencez vos achats pour créer votre première commande.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/client/products")
                  }
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Commencer mes achats
                </button>

              </div>

            ) : (

              <div className="space-y-3">

                {orders.slice(0, 5).map((order) => (

                  <div
                    key={order.id}
                    className="group flex flex-col gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                        📦
                      </div>

                      <div>

                        <p className="text-sm font-bold text-slate-800">
                          {order.numero ||
                            `Commande #${order.id}`}
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                          <p className="text-xs text-slate-400">
                            {order.statut || "en_attente"}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">

                      <p className="text-sm font-bold text-slate-900">
                        {Number(
                          order.total || 0
                        ).toFixed(2)}{" "}
                        DH
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/client/orders")
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Détails
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ClientDashboard;