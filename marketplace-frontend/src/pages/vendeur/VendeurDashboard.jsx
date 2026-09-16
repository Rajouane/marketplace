import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function VendeurDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("marketplace_user") || "null"
  );

  const userId = user?.id;

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          productsResponse,
          shopsResponse,
          ordersResponse,
        ] = await Promise.all([
          api.get("/products"),
          api.get("/shops"),
          api.get("/orders"),
        ]);

        const allProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        const allShops = Array.isArray(shopsResponse.data)
          ? shopsResponse.data
          : [];

        const allOrders = Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : [];

        const myShops = allShops.filter(
          (shop) =>
            Number(shop.vendeur_id) === Number(userId)
        );

        const myShopIds = myShops.map((shop) =>
          Number(shop.id)
        );

        const myProducts = allProducts.filter((product) =>
          myShopIds.includes(Number(product.shop_id))
        );

        const myOrders = allOrders.filter((order) => {
          if (order.shop_id) {
            return myShopIds.includes(
              Number(order.shop_id)
            );
          }

          if (order.items) {
            return order.items.some((item) =>
              myShopIds.includes(Number(item.shop_id))
            );
          }

          return false;
        });

        setShops(myShops);
        setProducts(myProducts);
        setOrders(myOrders);
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

    loadDashboard();
  }, [userId]);

  const publishedProducts = products.filter(
    (product) => product.statut === "publie"
  );

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);
    const threshold = Number(
      product.seuil_alerte || 5
    );

    return stock <= threshold;
  });

  const pendingOrders = orders.filter(
    (order) =>
      order.statut === "en_attente"
  );

  const activeShop = shops.find(
    (shop) => shop.statut === "active"
  );

  const stats = [
    {
      label: "Mes produits",
      value: products.length,
      description: "Produits dans votre boutique",
    },
    {
      label: "Produits publiés",
      value: publishedProducts.length,
      description: "Produits visibles",
    },
    {
      label: "Stock faible",
      value: lowStockProducts.length,
      description: "Produits à surveiller",
    },
    {
      label: "Commandes",
      value: orders.length,
      description: "Commandes concernant votre boutique",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tableau de bord vendeur
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Bienvenue {user?.nom || "Vendeur"}.
            Voici un aperçu de votre activité.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Shop information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ma boutique
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {activeShop?.nom ||
                  shops[0]?.nom ||
                  "Aucune boutique"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {activeShop
                  ? "Votre boutique est active."
                  : shops.length > 0
                  ? `Statut : ${
                      shops[0]?.statut || "en_attente"
                    }`
                  : "Créez votre boutique pour commencer à vendre."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/vendeur/shop")}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Gérer ma boutique
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "..." : stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          ))}

        </div>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-2">

          {/* Low stock */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Stock faible
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Produits nécessitant votre attention
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/vendeur/products")
                }
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                Voir tout
              </button>

            </div>

            <div className="p-6">

              {loading ? (
                <p className="text-sm text-slate-500">
                  Chargement...
                </p>
              ) : lowStockProducts.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Aucun produit en stock faible
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Votre stock est actuellement correct.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {lowStockProducts
                    .slice(0, 5)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.nom}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Seuil :{" "}
                            {product.seuil_alerte || 5}
                          </p>
                        </div>

                        <span className="ml-4 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Stock : {product.stock}
                        </span>
                      </div>
                    ))}

                </div>
              )}

            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Commandes récentes
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Dernières commandes de votre boutique
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/vendeur/orders")
                }
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                Voir tout
              </button>

            </div>

            <div className="p-6">

              {loading ? (
                <p className="text-sm text-slate-500">
                  Chargement...
                </p>
              ) : orders.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Aucune commande
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Les nouvelles commandes apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {orders
                    .slice(0, 5)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.numero ||
                              `Commande #${order.id}`}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.client?.nom ||
                              "Client"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">
                            {Number(
                              order.total || 0
                            ).toFixed(2)}{" "}
                            DH
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.statut ||
                              "en_attente"}
                          </p>
                        </div>
                      </div>
                    ))}

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="font-semibold text-slate-900">
            Actions rapides
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <button
              type="button"
              onClick={() =>
                navigate("/vendeur/products")
              }
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-800">
                Mes produits
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Ajouter ou modifier vos produits
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/vendeur/shop")
              }
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-800">
                Ma boutique
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Gérer les informations de la boutique
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/vendeur/orders")
              }
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-800">
                Commandes
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Consulter les commandes
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/vendeur/products")
              }
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-800">
                Ajouter un produit
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mettre un nouveau produit en vente
              </p>
            </button>

          </div>
        </div>

        {/* Pending orders information */}
        {pendingOrders.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-800">
              {pendingOrders.length} commande
              {pendingOrders.length > 1 ? "s" : ""} en attente
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Vous avez des commandes qui nécessitent
              votre attention.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/vendeur/orders")
              }
              className="mt-3 text-sm font-semibold text-amber-800 hover:underline"
            >
              Consulter les commandes
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default VendeurDashboard;