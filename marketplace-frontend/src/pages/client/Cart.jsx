
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const API_URL = "http://127.0.0.1:8000";

function getImageUrl(path) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${API_URL}/${path}`;
  }

  return `${API_URL}/storage/${path.replace(/^\/+/, "")}`;
}

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCart = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger le panier."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const items = Array.isArray(cart?.items)
    ? cart.items
    : [];

  const getProductPrice = (item) => {
    const promotionalPrice = Number(
      item.product?.prix_promotionnel
    );

    const normalPrice = Number(
      item.product?.prix
    );

    const storedPrice = Number(
      item.prix_unitaire
    );

    if (
      promotionalPrice > 0 &&
      promotionalPrice < normalPrice
    ) {
      return promotionalPrice;
    }

    if (normalPrice > 0) {
      return normalPrice;
    }

    return storedPrice || 0;
  };

  const updateQuantity = async (item, quantity) => {
    const stock = Number(
      item.product?.stock ?? 0
    );

    if (quantity < 1) {
      return;
    }

    if (stock > 0 && quantity > stock) {
      setError(
        `Stock disponible : ${stock} article${
          stock > 1 ? "s" : ""
        }.`
      );

      return;
    }

    setUpdatingId(item.id);
    setError("");
    setSuccess("");

    try {
      await api.put(
        `/cart/items/${item.id}`,
        {
          quantite: quantity,
        }
      );

      await loadCart();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de modifier la quantité."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item) => {
    setUpdatingId(item.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/cart/items/${item.id}`
      );

      setSuccess(
        "Article supprimé du panier."
      );

      await loadCart();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer l'article."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const clearCart = async () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment vider le panier ?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete("/cart/clear");

      setSuccess(
        "Panier vidé avec succès."
      );

      await loadCart();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de vider le panier."
      );
    }
  };

  const totalItems = items.reduce(
    (total, item) =>
      total + Number(item.quantite || 0),
    0
  );

  const subtotal = items.reduce(
    (total, item) => {
      const price = getProductPrice(item);
      const quantity = Number(
        item.quantite || 0
      );

      return total + price * quantity;
    },
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Mon panier
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Vérifiez vos articles avant de passer commande.
            </p>
          </div>

          {!loading && items.length > 0 && (
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {totalItems} article
              {totalItems > 1 ? "s" : ""}
            </div>
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 font-semibold hover:text-red-900"
            >
              ×
            </button>

          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-4 font-semibold hover:text-emerald-900"
            >
              ×
            </button>

          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Chargement du panier...
            </p>

          </div>
        ) : items.length === 0 ? (

          /* Empty cart */
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">

              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="text-slate-400"
              >
                <circle
                  cx="9"
                  cy="20"
                  r="1"
                />

                <circle
                  cx="19"
                  cy="20"
                  r="1"
                />

                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" />
              </svg>

            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Votre panier est vide
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Découvrez nos produits et ajoutez vos articles
              au panier pour commencer votre commande.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/client/products")
              }
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Voir les produits
            </button>

          </div>

        ) : (

          /* Cart */
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Products */}
            <div className="space-y-4 lg:col-span-2">

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
                >
                  Vider le panier
                </button>

              </div>

              {items.map((item) => {
                const product = item.product;

                const price =
                  getProductPrice(item);

                const quantity =
                  Number(item.quantite || 0);

                const stock =
                  Number(product?.stock ?? 0);

                const imagePath =
                  product?.images?.[0]?.chemin;

                const imageUrl =
                  getImageUrl(imagePath);

                const total =
                  price * quantity;

                const isUpdating =
                  updatingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                      {/* Image */}
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              product?.nom ||
                              "Produit"
                            }
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">

                            <span className="text-2xl font-bold text-slate-300">
                              {product?.nom
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}
                            </span>

                          </div>
                        )}

                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {product?.category?.nom ||
                            "Produit"}
                        </p>

                        <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                          {product?.nom ||
                            `Produit #${item.product_id}`}
                        </h3>

                        {product?.marque && (
                          <p className="mt-1 text-xs text-slate-400">
                            {product.marque}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-2">

                          <span className="font-semibold text-slate-900">
                            {price.toFixed(2)} DH
                          </span>

                          {Number(
                            product?.prix_promotionnel
                          ) > 0 &&
                            Number(
                              product?.prix_promotionnel
                            ) <
                              Number(
                                product?.prix
                              ) && (
                              <span className="text-xs text-slate-400 line-through">
                                {Number(
                                  product.prix
                                ).toFixed(2)}{" "}
                                DH
                              </span>
                            )}

                        </div>

                        <p
                          className={`mt-1 text-xs ${
                            stock > 0
                              ? "text-slate-400"
                              : "font-medium text-red-500"
                          }`}
                        >
                          {stock > 0
                            ? `Stock disponible : ${stock}`
                            : "Rupture de stock"}
                        </p>

                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            quantity <= 1
                          }
                          onClick={() =>
                            updateQuantity(
                              item,
                              quantity - 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="flex h-9 min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            (stock > 0 &&
                              quantity >= stock)
                          }
                          onClick={() =>
                            updateQuantity(
                              item,
                              quantity + 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>

                      </div>

                      {/* Total */}
                      <div className="text-left sm:min-w-28 sm:text-right">

                        <p className="text-base font-bold text-slate-900">
                          {total.toFixed(2)} DH
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item)
                          }
                          disabled={isUpdating}
                          className="mt-2 text-xs font-medium text-red-600 transition hover:text-red-700 hover:underline disabled:opacity-40"
                        >
                          Supprimer
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* Summary */}
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

              <h2 className="text-lg font-semibold text-slate-900">
                Résumé de la commande
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Articles
                  </span>

                  <span className="font-medium text-slate-700">
                    {totalItems}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Sous-total
                  </span>

                  <span className="font-medium text-slate-700">
                    {subtotal.toFixed(2)} DH
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">
                    Livraison
                  </span>

                  <span className="font-medium text-emerald-600">
                    À calculer
                  </span>

                </div>

                <div className="border-t border-slate-200 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      {subtotal.toFixed(2)} DH
                    </span>

                  </div>

                </div>

              </div>

              {/* IMPORTANT : vers Checkout */}
              <button
                type="button"
                onClick={() =>
                  navigate("/client/checkout")
                }
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Passer la commande
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/client/products")
                }
                className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Continuer mes achats
              </button>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Cart;

