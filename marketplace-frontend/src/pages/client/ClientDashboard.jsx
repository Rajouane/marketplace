import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

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

  useEffect(() => {
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

        const allProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        const allOrders = Array.isArray(ordersResponse.data)
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

    loadDashboard();
  }, []);

  const cartItems = Array.isArray(cart?.items)
    ? cart.items
    : [];

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.statut === "en_attente" ||
      order.statut === "confirmee"
  ).length;

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantite || 0),
    0
  );

  const stats = [
    {
      label: "Produits disponibles",
      value: products.length,
      description: "Produits actuellement publiés",
    },
    {
      label: "Mes commandes",
      value: totalOrders,
      description: "Commandes passées",
    },
    {
      label: "Commandes en cours",
      value: pendingOrders,
      description: "Commandes à suivre",
    },
    {
      label: "Mon panier",
      value: cartCount,
      description: "Articles dans le panier",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bienvenue {user?.nom || "Client"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Retrouvez vos produits, commandes et favoris.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Explorer les produits
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Découvrez les produits disponibles sur la marketplace.
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/products")}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Voir les produits
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Mes commandes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Consultez l'état et les détails de vos commandes.
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/orders")}
              className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir mes commandes
            </button>
          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Commandes récentes
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Vos dernières commandes
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/client/orders")}
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
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Vous n'avez aucune commande.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/client/products")
                  }
                  className="mt-3 text-sm font-semibold text-slate-900 hover:underline"
                >
                  Commencer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
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
                        {order.statut || "en_attente"}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-800">
                      {Number(order.total || 0).toFixed(2)} DH
                    </p>
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