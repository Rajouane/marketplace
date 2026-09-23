import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteMap, setFavoriteMap] = useState({});
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // CHARGEMENT
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
          favoritesResponse,
        ] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/favorites"),
        ]);

        // PRODUITS
        const allProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.data || [];

        // CATÉGORIES
        const allCategories = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.data || [];

        // FAVORIS
        const allFavorites = Array.isArray(favoritesResponse.data)
          ? favoritesResponse.data
          : favoritesResponse.data?.data || [];

        // Produits publiés uniquement
        const publishedProducts = allProducts.filter(
          (product) => product.statut === "publie"
        );

        setProducts(publishedProducts);
        setCategories(allCategories);

        // IDs favoris
        const ids = allFavorites
          .map((favorite) => Number(favorite.product_id))
          .filter(Boolean);

        setFavoriteIds(ids);

        // product_id => favorite.id
        const map = {};

        allFavorites.forEach((favorite) => {
          if (favorite.product_id && favorite.id) {
            map[Number(favorite.product_id)] = favorite.id;
          }
        });

        setFavoriteMap(map);
      } catch (err) {
        console.error("Erreur chargement catalogue :", err);

        setError(
          err.response?.data?.message ||
            "Impossible de charger le catalogue."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================================
  // FILTRAGE
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = `
        ${product.nom || ""}
        ${product.marque || ""}
        ${product.shop?.nom || ""}
        ${product.category?.nom || ""}
      `.toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        Number(product.category_id) === Number(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // =========================================================
  // IMAGE
  // =========================================================

  const getProductImages = (product) => {
    const images = [];

    if (product?.image) {
      images.push(product.image);
    }

    if (Array.isArray(product?.images)) {
      product.images.forEach((image) => {
        const value = image?.url || image?.chemin || image?.path;

        if (value && !images.includes(value)) {
          images.push(value);
        }
      });
    }

    return images;
  };

  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const cleanImage = image
      .replace(/^\/+/, "")
      .replace(/^storage\//, "");

    return `http://127.0.0.1:8000/storage/${cleanImage}`;
  };

  // =========================================================
  // PANIER
  // =========================================================

  const addToCart = async (product) => {
    try {
      setAddingId(product.id);
      setError("");
      setSuccess("");

      await api.post("/cart/items", {
        product_id: product.id,
        quantite: 1,
      });

      setSuccess(`${product.nom} a été ajouté au panier.`);
    } catch (err) {
      console.error("Erreur ajout panier :", err);

      setError(
        err.response?.data?.message ||
          "Impossible d'ajouter le produit au panier."
      );
    } finally {
      setAddingId(null);
    }
  };

  // =========================================================
  // FAVORIS
  // =========================================================

  const toggleFavorite = async (product) => {
    try {
      setFavoriteLoadingId(product.id);
      setError("");
      setSuccess("");

      const productId = Number(product.id);
      const isFavorite = favoriteIds.includes(productId);

      // RETIRER
      if (isFavorite) {
        const favoriteId = favoriteMap[productId];

        if (!favoriteId) {
          throw new Error("Favori introuvable.");
        }

        await api.delete(`/favorites/${favoriteId}`);

        setFavoriteIds((previous) =>
          previous.filter((id) => id !== productId)
        );

        setFavoriteMap((previous) => {
          const updated = { ...previous };
          delete updated[productId];
          return updated;
        });

        setSuccess(
          `${product.nom} a été retiré des favoris.`
        );
      }

      // AJOUTER
      else {
        const response = await api.post("/favorites", {
          product_id: productId,
        });

        const newFavoriteId =
          response.data?.id ||
          response.data?.favorite?.id ||
          response.data?.data?.id;

        setFavoriteIds((previous) => [
          ...previous,
          productId,
        ]);

        if (newFavoriteId) {
          setFavoriteMap((previous) => ({
            ...previous,
            [productId]: newFavoriteId,
          }));
        }

        setSuccess(
          `${product.nom} a été ajouté aux favoris.`
        );
      }
    } catch (err) {
      console.error("Erreur favoris :", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de modifier les favoris."
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Marketplace
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Découvrez nos produits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Découvrez les produits proposés par nos vendeurs,
                profitez des promotions et ajoutez vos produits
                préférés au panier.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Produits
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {filteredProducts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center text-white">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Favoris
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {favoriteIds.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MESSAGES
        ====================================================== */}

        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-semibold text-emerald-500 hover:text-emerald-700"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================================
            FILTRES
        ====================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* RECHERCHE */}

            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un produit, une marque ou une boutique..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>

            {/* CATÉGORIE */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 lg:min-w-60"
            >
              <option value="all">
                Toutes les catégories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.nom}
                </option>
              ))}
            </select>

            {/* RESET */}

            {(search || categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            CHARGEMENT
        ====================================================== */}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-60 animate-pulse bg-slate-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (

          /* =====================================================
             AUCUN PRODUIT
          ====================================================== */

          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Aucun produit trouvé
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Aucun produit ne correspond à votre recherche.
              Essayez une autre recherche ou une autre catégorie.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Voir tous les produits
            </button>
          </div>

        ) : (

          /* =====================================================
             PRODUITS
          ====================================================== */

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Produits disponibles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredProducts.length} produit(s)
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => {
                const images = getProductImages(product);
                const productImage = getImageUrl(images[0]);

                const isFavorite = favoriteIds.includes(
                  Number(product.id)
                );

                const favoriteLoading =
                  favoriteLoadingId === product.id;

                const adding = addingId === product.id;

                const regularPrice = Number(
                  product.prix || 0
                );

                const promotionalPrice =
                  product.prix_promotionnel !== null &&
                  product.prix_promotionnel !== undefined &&
                  product.prix_promotionnel !== ""
                    ? Number(product.prix_promotionnel)
                    : 0;

                const hasPromotion =
                  promotionalPrice > 0 &&
                  promotionalPrice < regularPrice;

                const finalPrice = hasPromotion
                  ? promotionalPrice
                  : regularPrice;

                const discount = hasPromotion
                  ? Math.round(
                      ((regularPrice - promotionalPrice) /
                        regularPrice) *
                        100
                    )
                  : 0;

                const saving = hasPromotion
                  ? regularPrice - promotionalPrice
                  : 0;

                const stock = Number(product.stock || 0);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                  >
                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    <div className="relative h-64 overflow-hidden bg-slate-100">

                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.nom}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                              🛍️
                            </div>

                            <p className="mt-3 text-xs text-slate-400">
                              Aucune image
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Overlay léger */}

                      <div className="absolute inset-x-0 bottom-0 h-24 bbg-linear-to-t from-black/20 to-transparent" />

                      {/* PROMOTION */}

                      {hasPromotion && (
                        <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                          -{discount}%
                        </div>
                      )}

                      {/* FAVORI */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(product)
                        }
                        disabled={favoriteLoading}
                        title={
                          isFavorite
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                        }
                        className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition-all ${
                          favoriteLoading
                            ? "cursor-wait opacity-60"
                            : "hover:scale-110"
                        } ${
                          isFavorite
                            ? "text-red-500"
                            : "text-slate-500 hover:text-red-500"
                        }`}
                      >
                        {favoriteLoading ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                        ) : (
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill={
                              isFavorite
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M20.8 8.6c0 5.4-8.8 10.1-8.8 10.1S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />
                          </svg>
                        )}
                      </button>

                      {/* STOCK */}

                      <div className="absolute bottom-3 left-3">
                        {stock > 0 ? (
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
                            {stock} en stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow">
                            Rupture de stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        INFORMATIONS
                    ================================================== */}

                    <div className="p-5">

                      {/* CATÉGORIE */}

                      {product.category?.nom && (
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {product.category.nom}
                          </span>

                          {hasPromotion && (
                            <span className="text-xs font-bold text-red-500">
                              Offre
                            </span>
                          )}
                        </div>
                      )}

                      {/* NOM */}

                      <h2 className="line-clamp-2 min-h-13 text-lg font-bold text-slate-900">
                        {product.nom}
                      </h2>

                      {/* MARQUE */}

                      {product.marque && (
                        <p className="mt-1 text-sm text-slate-500">
                          {product.marque}
                        </p>
                      )}

                      {/* BOUTIQUE */}

                      {product.shop?.nom && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path d="M3 10h18" />
                            <path d="M5 10v10h14V10" />
                            <path d="M4 10 6 4h12l2 6" />
                          </svg>

                          <span>
                            {product.shop.nom}
                          </span>
                        </div>
                      )}

                      {/* SEPARATEUR */}

                      <div className="my-4 border-t border-slate-100" />

                      {/* =================================================
                          PRIX
                      ================================================== */}

                      <div>
                        {hasPromotion ? (
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-extrabold text-red-600">
                                {finalPrice.toFixed(2)} DH
                              </span>

                              <span className="text-sm font-medium text-slate-400 line-through">
                                {regularPrice.toFixed(2)} DH
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-600">
                                Économie de{" "}
                                {saving.toFixed(2)} DH
                              </span>

                              <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                                -{discount}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl font-extrabold text-slate-900">
                              {finalPrice.toFixed(2)} DH
                            </span>
                          </div>
                        )}
                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================== */}

                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <Link
                          to={`/client/products/${product.id}`}
                          className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Voir le produit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            addToCart(product)
                          }
                          disabled={
                            adding || stock <= 0
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {adding ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Ajout...
                            </>
                          ) : (
                            <>
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M6 6h15l-1.5 9h-12z" />
                                <path d="M6 6 5 3H2" />
                                <circle
                                  cx="9"
                                  cy="20"
                                  r="1"
                                />
                                <circle
                                  cx="18"
                                  cy="20"
                                  r="1"
                                />
                              </svg>

                              Panier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Products;