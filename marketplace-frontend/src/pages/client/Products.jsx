
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProductCard from "../../components/common/ProductCard";
import api from "../../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // CHARGER LES PRODUITS
  // =========================================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        const allProducts = Array.isArray(
          productsResponse.data
        )
          ? productsResponse.data
          : productsResponse.data?.data || [];

        const allCategories = Array.isArray(
          categoriesResponse.data
        )
          ? categoriesResponse.data
          : categoriesResponse.data?.data || [];

        // Afficher uniquement les produits publiés
        const publishedProducts =
          allProducts.filter(
            (product) =>
              product.statut === "publie"
          );

        setProducts(publishedProducts);
        setCategories(allCategories);
      } catch (err) {
        console.error(
          "Erreur chargement catalogue :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de charger le catalogue."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // =========================================================
  // FILTRER LES PRODUITS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const searchableText = `
        ${product.nom || ""}
        ${product.marque || ""}
        ${product.shop?.nom || ""}
        ${product.category?.nom || ""}
      `.toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        Number(product.category_id) ===
          Number(categoryFilter);

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    categoryFilter,
  ]);

  // =========================================================
  // AJOUTER AU PANIER
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

      setSuccess(
        `${product.nom} a été ajouté au panier.`
      );
    } catch (err) {
      console.error(
        "Erreur ajout panier :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible d'ajouter le produit au panier."
      );
    } finally {
      setAddingId(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Marketplace
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Catalogue
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Découvrez les produits proposés par
                nos vendeurs et ajoutez vos produits
                préférés à votre panier.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Produits disponibles
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {filteredProducts.length}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* MESSAGES                                         */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* FILTRES                                          */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Rechercher un produit, une marque ou une boutique..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 lg:min-w-56"
            >
              <option value="all">
                Toutes les catégories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.nom}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ================================================= */}
        {/* PRODUCTS                                         */}
        {/* ================================================= */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="text-sm text-slate-500">
              Chargement du catalogue...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-400"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Aucun produit trouvé
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Essayez une autre recherche ou
              sélectionnez une autre catégorie.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
              className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div>
            {/* RESULT COUNT */}

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {filteredProducts.length} produit(s)
              </p>
            </div>

            {/* PRODUCT GRID */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showAddToCart
                    adding={
                      addingId === product.id
                    }
                    onAddToCart={addToCart}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Products;

