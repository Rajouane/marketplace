
import { useEffect, useMemo, useState } from "react";
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

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCheckout = async () => {
      setLoading(true);
      setError("");

      try {
        const [cartResponse, addressesResponse] = await Promise.all([
          api.get("/cart"),
          api.get("/addresses"),
        ]);

        const cartData = cartResponse.data;
        const addressesData = Array.isArray(addressesResponse.data)
          ? addressesResponse.data
          : [];

        const cartItems = Array.isArray(cartData?.items)
          ? cartData.items
          : [];

        setCart(cartData);
        setAddresses(addressesData);

        if (addressesData.length > 0) {
          setSelectedAddressId(String(addressesData[0].id));
        }

        if (cartItems.length === 0) {
          navigate("/client/products");
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Impossible de charger les informations de commande."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [navigate]);

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const getProductPrice = (item) => {
    const promotionalPrice = Number(
      item.product?.prix_promotionnel
    );

    const normalPrice = Number(item.product?.prix);

    const storedPrice = Number(item.prix_unitaire);

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

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = getProductPrice(item);
      const quantity = Number(item.quantite || 0);

      return total + price * quantity;
    }, 0);
  }, [items]);

  const deliveryFee = 30;

  const total = subtotal + deliveryFee;

  const selectedAddress = addresses.find(
    (address) => String(address.id) === String(selectedAddressId)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAddressId) {
      setError("Veuillez sélectionner une adresse de livraison.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/orders", {
        address_id: Number(selectedAddressId),
      });

      const order = response.data?.order;

      if (order?.id) {
        navigate("/client/orders", {
          state: {
            successMessage:
              response.data?.message ||
              "Commande créée avec succès.",
            orderId: order.id,
          },
        });
      } else {
        navigate("/client/orders");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de créer la commande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Finaliser la commande
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Sélectionnez votre adresse et vérifiez votre commande.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Préparation de votre commande...
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Aucune adresse de livraison
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Vous devez ajouter une adresse avant de pouvoir
              passer votre commande.
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/addresses")}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ajouter une adresse
            </button>

          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-3">

              <div className="space-y-6 lg:col-span-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Adresse de livraison
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Où souhaitez-vous recevoir votre commande ?
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/client/addresses")
                      }
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
                    >
                      Gérer mes adresses
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">

                    {addresses.map((address) => {
                      const selected =
                        String(address.id) ===
                        String(selectedAddressId);

                      return (
                        <label
                          key={address.id}
                          className={[
                            "block cursor-pointer rounded-xl border p-4 transition",
                            selected
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 hover:border-slate-300",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">

                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selected}
                              onChange={(event) =>
                                setSelectedAddressId(
                                  event.target.value
                                )
                              }
                              className="mt-1 h-4 w-4 accent-slate-900"
                            />

                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">
                                {address.adresse}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {address.ville}
                                {address.code_postal
                                  ? `, ${address.code_postal}`
                                  : ""}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {address.pays || "Maroc"}
                              </p>
                            </div>

                          </div>
                        </label>
                      );
                    })}

                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h2 className="text-lg font-semibold text-slate-900">
                    Articles commandés
                  </h2>

                  <div className="mt-5 divide-y divide-slate-100">

                    {items.map((item) => {
                      const product = item.product;
                      const price = getProductPrice(item);
                      const quantity = Number(
                        item.quantite || 0
                      );
                      const imageUrl = getImageUrl(
                        product?.images?.[0]?.chemin
                      );

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >

                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product?.nom || "Produit"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-xl font-bold text-slate-300">
                                  {product?.nom
                                    ?.charAt(0)
                                    ?.toUpperCase() || "P"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate font-semibold text-slate-900">
                              {product?.nom ||
                                `Produit #${item.product_id}`}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Quantité : {quantity}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {price.toFixed(2)} DH / unité
                            </p>

                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-slate-900">
                              {(price * quantity).toFixed(2)} DH
                            </p>
                          </div>

                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>

              <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

                <h2 className="text-lg font-semibold text-slate-900">
                  Résumé
                </h2>

                <div className="mt-6 space-y-4">

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

                    <span className="font-medium text-slate-700">
                      {deliveryFee.toFixed(2)} DH
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="text-xl font-bold text-slate-900">
                        {total.toFixed(2)} DH
                      </span>
                    </div>

                  </div>

                </div>

                {selectedAddress && (
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Livraison à
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {selectedAddress.adresse}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedAddress.ville}
                      {selectedAddress.code_postal
                        ? `, ${selectedAddress.code_postal}`
                        : ""}
                    </p>

                    <p className="text-sm text-slate-500">
                      {selectedAddress.pays || "Maroc"}
                    </p>

                  </div>
                )}

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Paiement
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    Paiement à la livraison
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Vous paierez lors de la réception de votre commande.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedAddressId}
                  className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Création de la commande..."
                    : "Confirmer la commande"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/client/cart")}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Retour au panier
                </button>

              </div>

            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Checkout;

