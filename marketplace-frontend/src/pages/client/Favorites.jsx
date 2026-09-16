import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFavorites = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/favorites");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setFavorites(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger vos favoris."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = async (favorite) => {
    setRemovingId(favorite.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/favorites/${favorite.id}`
      );

      setFavorites((previous) =>
        previous.filter(
          (item) => item.id !== favorite.id
        )
      );

      setSuccess("Produit retiré des favoris.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer le favori."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (favorite) => {
    const product = favorite.product;

    if (!product) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.post("/cart/items", {
        product_id: product.id,
        quantite: 1,
      });

      setSuccess(
        `${product.nom} a été ajouté au panier.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible d'ajouter le produit au panier."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mes favoris
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Retrouvez les produits que vous avez enregistrés.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Chargement des favoris...
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              Aucun favori
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Vous n'avez pas encore enregistré de produit.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {favorites.map((favorite) => {
              const product = favorite.product;

              return (
                <div
                  key={favorite.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  <div className="flex h-40 items-center justify-center bg-slate-100">
                    <span className="text-4xl font-bold text-slate-300">
                      {product?.nom
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </span>
                  </div>

                  <div className="p-5">

                    <p className="text-xs text-slate-400">
                      {product?.category?.nom ||
                        "Produit"}
                    </p>

                    <h2 className="mt-2 font-semibold text-slate-900">
                      {product?.nom ||
                        `Produit #${favorite.product_id}`}
                    </h2>

                    <p className="mt-3 text-lg font-bold text-slate-900">
                      {Number(
                        product?.prix_promotionnel ||
                          product?.prix ||
                          0
                      ).toFixed(2)}{" "}
                      DH
                    </p>

                    <div className="mt-4 flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(favorite)
                        }
                        disabled={
                          !product ||
                          Number(product.stock) <= 0
                        }
                        className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Ajouter au panier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeFavorite(favorite)
                        }
                        disabled={
                          removingId === favorite.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Retirer
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Favorites;