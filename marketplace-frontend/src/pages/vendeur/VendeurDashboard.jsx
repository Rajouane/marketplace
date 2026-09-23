import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";

// ======================================================
// HELPERS
// ======================================================

const formatPrice = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ======================================================
// ORDER STATUS
// ======================================================

const normalizeStatus = (order) => {
  const status =
    order?.status ??
    order?.statut ??
    order?.order_status ??
    order?.statut_commande ??
    "";

  return String(status).toLowerCase().trim();
};

const getStatusLabel = (order) => {
  const status = normalizeStatus(order);

  const labels = {
    en_attente: "En attente",
    pending: "En attente",

    confirmee: "Confirmée",
    confirme: "Confirmée",
    confirmed: "Confirmée",

    en_cours: "En cours",
    en_cours_de_traitement: "En cours",
    processing: "En cours",

    expediee: "Expédiée",
    expedie: "Expédiée",
    shipped: "Expédiée",

    livree: "Livrée",
    livre: "Livrée",
    delivered: "Livrée",

    annulee: "Annulée",
    annule: "Annulée",
    cancelled: "Annulée",
    canceled: "Annulée",

    refusee: "Refusée",
    refuse: "Refusée",
    refused: "Refusée",
    rejected: "Refusée",
  };

  return labels[status] || status || "Inconnu";
};

const getStatusClass = (order) => {
  const status = normalizeStatus(order);

  switch (status) {
    case "livree":
    case "livre":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";

    case "expediee":
    case "expedie":
    case "shipped":
      return "bg-blue-50 text-blue-700 border border-blue-200";

    case "confirmee":
    case "confirme":
    case "confirmed":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";

    case "en_cours":
    case "en_cours_de_traitement":
    case "processing":
      return "bg-purple-50 text-purple-700 border border-purple-200";

    case "annulee":
    case "annule":
    case "cancelled":
    case "canceled":
      return "bg-red-50 text-red-700 border border-red-200";

    case "refusee":
    case "refuse":
    case "refused":
    case "rejected":
      return "bg-red-100 text-red-800 border border-red-300";

    case "en_attente":
    case "pending":
    default:
      return "bg-amber-50 text-amber-700 border border-amber-200";
  }
};

// ======================================================
// ORDER DATE
// ======================================================

const getOrderDate = (order) => {
  return (
    order?.created_at ??
    order?.date_commande ??
    order?.order_date ??
    order?.date ??
    null
  );
};

// ======================================================
// ORDER SELLER TOTAL
// ======================================================

const getSellerOrderTotal = (order, sellerId) => {
  if (!order || !Array.isArray(order.items)) {
    return 0;
  }

  return order.items.reduce((total, item) => {
    const shop = item?.shop ?? item?.boutique ?? null;

    const itemSellerId =
      item?.vendeur_id ??
      item?.seller_id ??
      shop?.vendeur_id ??
      shop?.seller_id;

    if (Number(itemSellerId) !== Number(sellerId)) {
      return total;
    }

    const quantity = Number(
      item?.quantity ??
        item?.quantite ??
        item?.qty ??
        1
    );

    const price = Number(
      item?.price ??
        item?.prix ??
        item?.unit_price ??
        item?.prix_unitaire ??
        0
    );

    return total + quantity * price;
  }, 0);
};

// ======================================================
// GENERIC STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass = "bg-slate-100 text-slate-700",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PROGRESS BAR
// ======================================================

function ProgressBar({ label, value, total, colorClass }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-slate-500">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

// ======================================================
// SIMPLE BAR CHART
// ======================================================

function BarChart({ data }) {
  const maxValue = Math.max(
    ...data.map((item) => Number(item.value || 0)),
    1
  );

  return (
    <div className="flex h-64 items-end gap-3">
      {data.map((item) => {
        const height =
          (Number(item.value || 0) / maxValue) * 100;

        return (
          <div
            key={item.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-full max-w-10 rounded-t-lg bg-slate-800 transition-all hover:bg-slate-700"
                style={{
                  height: `${Math.max(height, 3)}%`,
                }}
                title={formatPrice(item.value)}
              />
            </div>

            <span className="text-xs text-slate-500">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function VendeurDashboard() {
  const [user, setUser] = useState(null);

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderFilter, setOrderFilter] = useState("all");

  // ====================================================
  // LOAD USER
  // ====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("marketplace_user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur:",
        error
      );
    }
  }, []);

  // ====================================================
  // LOAD DATA
  // ====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("marketplace_user");

        const currentUser = storedUser
          ? JSON.parse(storedUser)
          : null;

        if (!currentUser?.id) {
          setError("Utilisateur vendeur introuvable.");
          return;
        }

        const [
          shopsResponse,
          productsResponse,
          ordersResponse,
        ] = await Promise.all([
          api.get("/shops"),
          api.get("/products"),
          api.get("/vendeur/orders"),
        ]);

        const shopsData =
          shopsResponse?.data?.data ??
          shopsResponse?.data ??
          [];

        const productsData =
          productsResponse?.data?.data ??
          productsResponse?.data ??
          [];

        const ordersData =
          ordersResponse?.data?.data ??
          ordersResponse?.data ??
          [];

        setShops(
          Array.isArray(shopsData)
            ? shopsData
            : []
        );

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );
      } catch (err) {
        console.error(
          "Erreur chargement dashboard vendeur:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Impossible de charger les données du dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ====================================================
  // SELLER ID
  // ====================================================

  const sellerId = user?.id;

  // ====================================================
  // SELLER SHOPS
  // ====================================================

  const sellerShops = useMemo(() => {
    if (!sellerId) return [];

    return shops.filter(
      (shop) =>
        Number(
          shop?.vendeur_id ??
            shop?.seller_id ??
            shop?.user_id
        ) === Number(sellerId)
    );
  }, [shops, sellerId]);

  // ====================================================
  // SELLER SHOP IDS
  // ====================================================

  const sellerShopIds = useMemo(() => {
    return sellerShops.map((shop) => Number(shop.id));
  }, [sellerShops]);

  // ====================================================
  // SELLER PRODUCTS
  // ====================================================

  const sellerProducts = useMemo(() => {
    if (!sellerId) return [];

    return products.filter((product) => {
      const productSellerId =
        product?.vendeur_id ??
        product?.seller_id;

      const productShopId =
        product?.shop_id ??
        product?.boutique_id ??
        product?.shop?.id ??
        product?.boutique?.id;

      if (
        productSellerId !== undefined &&
        productSellerId !== null
      ) {
        return (
          Number(productSellerId) ===
          Number(sellerId)
        );
      }

      if (
        productShopId !== undefined &&
        productShopId !== null
      ) {
        return sellerShopIds.includes(
          Number(productShopId)
        );
      }

      return false;
    });
  }, [products, sellerId, sellerShopIds]);

  // ====================================================
  // ORDER STATS
  // ====================================================

  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refused: 0,
    };

    orders.forEach((order) => {
      const status = normalizeStatus(order);

      switch (status) {
        case "en_attente":
        case "pending":
          stats.pending++;
          break;

        case "confirmee":
        case "confirme":
        case "confirmed":
          stats.confirmed++;
          break;

        case "en_cours":
        case "en_cours_de_traitement":
        case "processing":
          stats.processing++;
          break;

        case "expediee":
        case "expedie":
        case "shipped":
          stats.shipped++;
          break;

        case "livree":
        case "livre":
        case "delivered":
          stats.delivered++;
          break;

        case "annulee":
        case "annule":
        case "cancelled":
        case "canceled":
          stats.cancelled++;
          break;

        case "refusee":
        case "refuse":
        case "refused":
        case "rejected":
          stats.refused++;
          break;

        default:
          break;
      }
    });

    return stats;
  }, [orders]);

  // ====================================================
  // REVENUE
  // ====================================================

  const totalRevenue = useMemo(() => {
    if (!sellerId) return 0;

    return orders.reduce(
      (total, order) =>
        total +
        getSellerOrderTotal(order, sellerId),
      0
    );
  }, [orders, sellerId]);

  // ====================================================
  // STOCK
  // ====================================================

  const stockStats = useMemo(() => {
    let total = 0;
    let low = 0;
    let out = 0;

    sellerProducts.forEach((product) => {
      const stock = Number(
        product?.stock ??
          product?.quantite_stock ??
          product?.quantity ??
          0
      );

      total += stock;

      if (stock <= 0) {
        out++;
      } else if (stock <= 5) {
        low++;
      }
    });

    return {
      total,
      low,
      out,
    };
  }, [sellerProducts]);

  // ====================================================
  // FILTERED ORDERS
  // ====================================================

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") {
      return orders;
    }

    return orders.filter((order) => {
      const status = normalizeStatus(order);

      if (orderFilter === "pending") {
        return (
          status === "pending" ||
          status === "en_attente"
        );
      }

      if (orderFilter === "confirmed") {
        return (
          status === "confirmed" ||
          status === "confirmee" ||
          status === "confirme"
        );
      }

      if (orderFilter === "processing") {
        return (
          status === "processing" ||
          status === "en_cours" ||
          status === "en_cours_de_traitement"
        );
      }

      if (orderFilter === "shipped") {
        return (
          status === "shipped" ||
          status === "expediee" ||
          status === "expedie"
        );
      }

      if (orderFilter === "delivered") {
        return (
          status === "delivered" ||
          status === "livree" ||
          status === "livre"
        );
      }

      if (orderFilter === "cancelled") {
        return (
          status === "cancelled" ||
          status === "canceled" ||
          status === "annulee" ||
          status === "annule"
        );
      }

      if (orderFilter === "refused") {
        return (
          status === "refused" ||
          status === "rejected" ||
          status === "refusee" ||
          status === "refuse"
        );
      }

      return true;
    });
  }, [orders, orderFilter]);

  // ====================================================
  // RECENT ORDERS
  // ====================================================

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => {
        const dateA = new Date(
          getOrderDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getOrderDate(b) || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [filteredOrders]);

  // ====================================================
  // MONTHLY REVENUE
  // ====================================================

  const revenueChart = useMemo(() => {
    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString("fr-FR", {
          month: "short",
        }),
        value: 0,
      });
    }

    if (!sellerId) {
      return months;
    }

    orders.forEach((order) => {
      const orderDateValue =
        getOrderDate(order);

      if (!orderDateValue) return;

      const orderDate = new Date(
        orderDateValue
      );

      if (Number.isNaN(orderDate.getTime())) {
        return;
      }

      const orderTotal =
        getSellerOrderTotal(
          order,
          sellerId
        );

      const month = months.find(
        (item) =>
          item.month ===
            orderDate.getMonth() &&
          item.year ===
            orderDate.getFullYear()
      );

      if (month) {
        month.value += orderTotal;
      }
    });

    return months;
  }, [orders, sellerId]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-125 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

            <p className="mt-4 text-sm text-slate-500">
              Chargement du dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Erreur
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ==============================================
            HEADER
        ============================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Espace vendeur
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Bonjour{" "}
              <span className="font-medium text-slate-700">
                {user?.nom ||
                  user?.name ||
                  "Vendeur"}
              </span>
              , voici l'état de votre activité.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/vendeur/products"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Mes produits
            </Link>

            <Link
              to="/vendeur/orders"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Voir les commandes
            </Link>
          </div>
        </div>

        {/* ==============================================
            MAIN STATS
        ============================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Chiffre d'affaires"
            value={formatPrice(totalRevenue)}
            subtitle="Total des ventes vendeur"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 1v22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
              </svg>
            }
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Commandes"
            value={orderStats.total}
            subtitle="Toutes les commandes"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2l-3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-3-6z" />
                <path d="M3 8h18" />
                <path d="M8 12a4 4 0 0 0 8 0" />
              </svg>
            }
            iconClass="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Produits"
            value={sellerProducts.length}
            subtitle={`${stockStats.total} unités en stock`}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
            }
            iconClass="bg-violet-50 text-violet-700"
          />

          <StatCard
            title="Boutiques"
            value={sellerShops.length}
            subtitle="Vos boutiques actives"
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l2-6h14l2 6" />
                <path d="M5 9v11h14V9" />
                <path d="M3 9h18" />
                <path d="M9 20v-6h6v6" />
              </svg>
            }
            iconClass="bg-amber-50 text-amber-700"
          />
        </div>

        {/* ==============================================
            CHART + ORDER STATUS
        ============================================== */}

        <div className="grid gap-6 xl:grid-cols-3">
          {/* REVENUE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Chiffre d'affaires
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Évolution des six derniers mois
                </p>
              </div>
            </div>

            <div className="mt-6">
              <BarChart
                data={revenueChart}
              />
            </div>
          </div>

          {/* ORDER STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                État des commandes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Répartition actuelle
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <ProgressBar
                label="En attente"
                value={orderStats.pending}
                total={orderStats.total}
                colorClass="bg-amber-500"
              />

              <ProgressBar
                label="Confirmées"
                value={orderStats.confirmed}
                total={orderStats.total}
                colorClass="bg-indigo-500"
              />

              <ProgressBar
                label="En cours"
                value={orderStats.processing}
                total={orderStats.total}
                colorClass="bg-purple-500"
              />

              <ProgressBar
                label="Expédiées"
                value={orderStats.shipped}
                total={orderStats.total}
                colorClass="bg-blue-500"
              />

              <ProgressBar
                label="Livrées"
                value={orderStats.delivered}
                total={orderStats.total}
                colorClass="bg-emerald-500"
              />

              <ProgressBar
                label="Annulées"
                value={orderStats.cancelled}
                total={orderStats.total}
                colorClass="bg-red-500"
              />

              <ProgressBar
                label="Refusées"
                value={orderStats.refused}
                total={orderStats.total}
                colorClass="bg-red-700"
              />
            </div>
          </div>
        </div>

        {/* ==============================================
            STOCK + SHOPS
        ============================================== */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* STOCK */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Stock
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  État de votre inventaire
                </p>
              </div>

              <Link
                to="/vendeur/products"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Gérer
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Total
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stockStats.total}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs text-amber-700">
                  Faible
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {stockStats.low}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-700">
                  Rupture
                </p>

                <p className="mt-1 text-2xl font-bold text-red-800">
                  {stockStats.out}
                </p>
              </div>
            </div>
          </div>

          {/* SHOPS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Mes boutiques
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Boutiques associées à votre compte
                </p>
              </div>

              <Link
                to="/vendeur/shops"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Voir tout
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {sellerShops.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Aucune boutique trouvée.
                  </p>
                </div>
              ) : (
                sellerShops.slice(0, 4).map((shop) => (
                  <div
                    key={shop.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {shop.nom ||
                          shop.name ||
                          "Boutique sans nom"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {shop.statut === true ||
                        shop.statut === 1 ||
                        shop.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Boutique
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==============================================
            ORDERS
        ============================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* HEADER */}

          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Commandes récentes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Suivez l'évolution de vos commandes.
                </p>
              </div>

              <Link
                to="/vendeur/orders"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Voir toutes les commandes →
              </Link>
            </div>

            {/* FILTERS */}

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                {
                  key: "all",
                  label: "Toutes",
                },
                {
                  key: "pending",
                  label: "En attente",
                },
                {
                  key: "confirmed",
                  label: "Confirmées",
                },
                {
                  key: "processing",
                  label: "En cours",
                },
                {
                  key: "shipped",
                  label: "Expédiées",
                },
                {
                  key: "delivered",
                  label: "Livrées",
                },
                {
                  key: "cancelled",
                  label: "Annulées",
                },
                {
                  key: "refused",
                  label: "Refusées",
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    setOrderFilter(filter.key)
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    orderFilter === filter.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 2l-3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-3-6z" />
                    <path d="M3 8h18" />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Aucune commande
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Aucune commande ne correspond à ce filtre.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Commande
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Client
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Montant
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Statut
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => {
                    const sellerTotal =
                      getSellerOrderTotal(
                        order,
                        sellerId
                      );

                    const customer =
                      order?.user ??
                      order?.client ??
                      order?.customer ??
                      null;

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              #
                              {order.id}
                            </p>

                            {Array.isArray(
                              order.items
                            ) && (
                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  order.items.length
                                }{" "}
                                article
                                {order.items
                                  .length > 1
                                  ? "s"
                                  : ""}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(
                            getOrderDate(order)
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {customer?.nom ||
                                customer?.name ||
                                customer?.prenom ||
                                "Client"}
                            </p>

                            {customer?.email && (
                              <p className="mt-1 text-xs text-slate-500">
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatPrice(
                            sellerTotal
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              order
                            )}`}
                          >
                            {getStatusLabel(
                              order
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <Link
                            to={`/vendeur/orders/${order.id}`}
                            className="text-sm font-medium text-slate-700 hover:text-slate-900"
                          >
                            Détails
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ==============================================
            QUICK ACTIONS
        ============================================== */}

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Actions rapides
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/vendeur/products"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                +
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Ajouter un produit
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ajouter un nouveau produit au catalogue.
              </p>
            </Link>

            <Link
              to="/vendeur/orders"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                →
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Gérer les commandes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Consulter et traiter les commandes.
              </p>
            </Link>

            <Link
              to="/vendeur/shops"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                +
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Mes boutiques
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Gérer vos boutiques et leurs informations.
              </p>
            </Link>

            <Link
              to="/vendeur/products"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                !
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Vérifier le stock
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {stockStats.out > 0
                  ? `${stockStats.out} produit(s) en rupture de stock.`
                  : stockStats.low > 0
                  ? `${stockStats.low} produit(s) ont un stock faible.`
                  : "Votre stock est correctement approvisionné."}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}