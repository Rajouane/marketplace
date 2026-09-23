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
      await api.delete(`/favorites/${favorite.id}`);

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

    if (!product) return;

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

  const getProductImage = (product) => {
    if (!product) return null;

    if (product.image) {
      return product.image;
    }

    if (
      product.images &&
      product.images.length > 0
    ) {
      const image = product.images[0];

      if (image.url) return image.url;
      if (image.chemin) {
        return `http://127.0.0.1:8000/storage/${image.chemin}`;
      }
    }

    return null;
  };

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                ❤️
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Mes favoris
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Retrouvez tous les produits que vous avez enregistrés.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-5 py-3 text-center ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Produits enregistrés
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {favorites.length}
            </p>
          </div>

        </div>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span className="text-lg">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              >
                <div className="h-56 animate-pulse bg-slate-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}

          </div>
        ) : favorites.length === 0 ? (

          /* ==================================================
              EMPTY STATE
          ================================================== */

          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">
              ❤️
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Aucun favori pour le moment
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Lorsque vous trouvez un produit qui vous plaît,
              ajoutez-le à vos favoris pour le retrouver facilement.
            </p>

          </div>

        ) : (

          /* ==================================================
              PRODUCTS
          ================================================== */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {favorites.map((favorite) => {
              const product = favorite.product;

              if (!product) return null;

              const image = getProductImage(product);

              const originalPrice = Number(
                product.prix || 0
              );

              const promotionalPrice =
                product.prix_promotionnel
                  ? Number(product.prix_promotionnel)
                  : null;

              const currentPrice =
                promotionalPrice &&
                promotionalPrice > 0 &&
                promotionalPrice < originalPrice
                  ? promotionalPrice
                  : originalPrice;

              const hasDiscount =
                promotionalPrice &&
                promotionalPrice < originalPrice;

              const stock = Number(
                product.stock || 0
              );

              return (
                <div
                  key={favorite.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* IMAGE */}

                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-50">

                    {image ? (
                      <img
                        src={image}
                        alt={product.nom}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
                        <span className="text-6xl font-bold text-slate-200">
                          {product.nom
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </span>
                      </div>
                    )}

                    {/* FAVORITE BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(favorite)
                      }
                      disabled={
                        removingId === favorite.id
                      }
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-sm transition hover:scale-105 hover:bg-red-50 disabled:opacity-50"
                      title="Retirer des favoris"
                    >
                      {removingId === favorite.id
                        ? "..."
                        : "❤️"}
                    </button>

                    {/* DISCOUNT */}

                    {hasDiscount && (
                      <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        -
                        {Math.round(
                          ((originalPrice -
                            promotionalPrice) /
                            originalPrice) *
                            100
                        )}
                        %
                      </span>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="p-5">

                    {/* CATEGORY */}

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {product.category?.nom ||
                        "Produit"}
                    </p>

                    {/* NAME */}

                    <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-bold text-slate-900">
                      {product.nom ||
                        `Produit #${favorite.product_id}`}
                    </h2>

                    {/* PRICE */}

                    <div className="mt-3 flex items-center gap-2">

                      <span className="text-xl font-bold text-slate-900">
                        {currentPrice.toFixed(2)} DH
                      </span>

                      {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through">
                          {originalPrice.toFixed(2)} DH
                        </span>
                      )}

                    </div>

                    {/* STOCK */}

                    <div className="mt-3">

                      {stock > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          En stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Rupture de stock
                        </span>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5">

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(favorite)
                        }
                        disabled={stock <= 0}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {stock > 0
                          ? "Ajouter au panier"
                          : "Indisponible"}
                      </button>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(favorite)
                      }
                      disabled={
                        removingId === favorite.id
                      }
                      className="mt-3 w-full text-xs font-medium text-slate-400 transition hover:text-red-600 disabled:opacity-50"
                    >
                      Retirer des favoris
                    </button>

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