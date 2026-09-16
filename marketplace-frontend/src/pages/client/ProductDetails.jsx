import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        setProduct(response.data);
      } catch (err) {
        console.error("Erreur produit :", err);

        setError(
          err.response?.data?.message ||
            "Impossible de charger le produit."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      setMessage("");
      setError("");

      await api.post("/cart/items", {
        product_id: product.id,
        quantite: quantity,
      });

      setMessage("Produit ajouté au panier.");

    } catch (err) {
      console.error("Erreur panier :", err);

      setError(
        err.response?.data?.message ||
          "Impossible d'ajouter le produit au panier."
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-96 items-center justify-center">
          <p className="text-sm text-slate-500">
            Chargement du produit...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !product) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/products")}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Retour aux produits
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const price = Number(product?.prix || 0);
  const promotionalPrice = product?.prix_promotionnel
    ? Number(product.prix_promotionnel)
    : null;

  const finalPrice = promotionalPrice || price;

  const image = product?.images?.[0]?.chemin;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() => navigate("/client/products")}
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Retour aux produits
        </button>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">

          <div className="flex min-h-96 items-center justify-center rounded-2xl bg-slate-100">
            {image ? (
              <img
                src={image}
                alt={product.nom}
                className="max-h-96 w-full rounded-2xl object-contain"
              />
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl">
                  🛍️
                </div>

                <p className="text-sm text-slate-400">
                  Aucune image disponible
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">

            <div className="mb-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {product.category?.nom || "Sans catégorie"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              {product.nom}
            </h1>

            {product.marque && (
              <p className="mt-2 text-sm text-slate-500">
                Marque : {product.marque}
              </p>
            )}

            <div className="mt-6">
              {promotionalPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900">
                    {promotionalPrice.toFixed(2)} DH
                  </span>

                  <span className="text-lg text-slate-400 line-through">
                    {price.toFixed(2)} DH
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-slate-900">
                  {price.toFixed(2)} DH
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>

              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.description ||
                  "Aucune description disponible pour ce produit."}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm font-medium text-slate-700">
                Stock disponible
              </span>

              <span
                className={
                  product.stock > 0
                    ? "text-sm font-semibold text-emerald-600"
                    : "text-sm font-semibold text-red-600"
                }
              >
                {product.stock > 0
                  ? `${product.stock} disponible(s)`
                  : "Rupture de stock"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="mt-6">

                <div className="mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    Quantité
                  </label>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg text-slate-700 hover:bg-slate-50"
                  >
                    −
                  </button>

                  <span className="flex h-10 min-w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(product.stock, value + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg text-slate-700 hover:bg-slate-50"
                  >
                    +
                  </button>

                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding
                    ? "Ajout..."
                    : "Ajouter au panier"}
                </button>

              </div>
            )}

          </div>
        </div>

        {product.shop && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Boutique
            </h2>

            <div className="mt-4">
              <p className="font-medium text-slate-800">
                {product.shop.nom}
              </p>

              {product.shop.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {product.shop.description}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default ProductDetails;