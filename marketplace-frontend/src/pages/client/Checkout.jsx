
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
  const [paymentMethod, setPaymentMethod] = useState(
    "paiement_a_la_livraison"
  );
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
    (address) =>
      String(address.id) === String(selectedAddressId)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAddressId) {
      setError("Veuillez sélectionner une adresse de livraison.");
      return;
    }

    if (!paymentMethod) {
      setError("Veuillez sélectionner un mode de paiement.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      /*
      |--------------------------------------------------------------------------
      | PayPal
      |--------------------------------------------------------------------------
      |
      | Cette requête crée uniquement une commande PayPal.
      | Elle ne crée PAS encore une commande Marketplace.
      |
      */

      if (paymentMethod === "paypal") {
        const paymentResponse = await api.post(
          "/orders/payment/paypal",
          {
            address_id: Number(selectedAddressId),
          }
        );

        const approvalUrl =
          paymentResponse.data?.paypal?.approval_url;

        if (!approvalUrl) {
          throw new Error(
            "L'URL de paiement PayPal est introuvable."
          );
        }

        window.location.href = approvalUrl;

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Paiement à la livraison
      |--------------------------------------------------------------------------
      |
      | Pour le paiement à la livraison, la commande Marketplace
      | est créée directement.
      |
      */

      const orderResponse = await api.post("/orders", {
        address_id: Number(selectedAddressId),
      });

      const order = orderResponse.data?.order;

      if (!order?.id) {
        throw new Error(
          "La commande n'a pas pu être créée."
        );
      }

      navigate("/client/orders", {
        state: {
          successMessage:
            orderResponse.data?.message ||
            "Commande créée avec succès.",
          orderId: order.id,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de créer la commande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Préparation de votre commande...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Finaliser la commande
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Sélectionnez votre adresse et votre mode de paiement.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-8 w-8 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune adresse de livraison
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Ajoutez une adresse avant de continuer.
            </p>

            <button
              type="button"
              onClick={() => navigate("/client/addresses")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            <div className="grid gap-6 lg:grid-cols-3">

              <div className="space-y-6 lg:col-span-2">

                {/* Address */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Adresse de livraison
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choisissez l'adresse où votre commande sera livrée.
                    </p>
                  </div>

                  <div className="space-y-3">

                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block cursor-pointer rounded-xl border p-4 transition ${
                          String(selectedAddressId) ===
                          String(address.id)
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-start gap-3">

                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={
                              String(selectedAddressId) ===
                              String(address.id)
                            }
                            onChange={(e) =>
                              setSelectedAddressId(e.target.value)
                            }
                            className="mt-1 h-4 w-4"
                          />

                          <div>
                            <p className="font-semibold text-slate-900">
                              {address.nom ||
                                address.name ||
                                "Adresse de livraison"}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {address.adresse ||
                                address.address ||
                                ""}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {address.ville ||
                                address.city ||
                                ""}
                            </p>

                            {address.telephone && (
                              <p className="mt-1 text-sm text-slate-500">
                                {address.telephone}
                              </p>
                            )}
                          </div>

                        </div>
                      </label>
                    ))}

                  </div>
                </div>

                {/* Products */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Articles commandés
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Vérifiez les articles avant de confirmer.
                    </p>
                  </div>

                  <div className="space-y-4">

                    {items.map((item) => {
                      const price = getProductPrice(item);

                      const quantity = Number(
                        item.quantite || 0
                      );

                      const image =
                        item.product?.image_principale ||
                        item.product?.image ||
                        item.product?.images?.[0]?.url ||
                        item.product?.images?.[0]?.path;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-xl border border-slate-200 p-4"
                        >

                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                            {image ? (
                              <img
                                src={getImageUrl(image)}
                                alt={
                                  item.product?.nom ||
                                  "Produit"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                No image
                              </div>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="font-semibold text-slate-900">
                              {item.product?.nom ||
                                "Produit"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Quantité : {quantity}
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {price.toFixed(2)} MAD
                            </p>

                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {(price * quantity).toFixed(2)} MAD
                            </p>
                          </div>

                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Payment method */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Mode de paiement
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choisissez comment vous souhaitez payer.
                    </p>
                  </div>

                  <div className="space-y-3">

                    {/* Cash on delivery */}
                    <label
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        paymentMethod ===
                        "paiement_a_la_livraison"
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paiement_a_la_livraison"
                          checked={
                            paymentMethod ===
                            "paiement_a_la_livraison"
                          }
                          onChange={(e) =>
                            setPaymentMethod(e.target.value)
                          }
                          className="mt-1 h-4 w-4"
                        />

                        <div>
                          <p className="font-semibold text-slate-900">
                            Paiement à la livraison
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Vous paierez lors de la réception de votre commande.
                          </p>
                        </div>

                      </div>
                    </label>

                    {/* PayPal */}
                    <label
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        paymentMethod === "paypal"
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value)
                          }
                          className="mt-1 h-4 w-4"
                        />

                        <div className="flex-1">

                          <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-[#0070ba] px-3 py-1.5 text-sm font-bold text-white">
                              PayPal
                            </div>

                            <p className="font-semibold text-slate-900">
                              Paiement avec PayPal
                            </p>

                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            Vous serez redirigé vers PayPal Sandbox pour effectuer le paiement de test.
                          </p>

                        </div>

                      </div>
                    </label>

                  </div>
                </div>

              </div>

              {/* Summary */}
              <div className="lg:col-span-1">

                <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <h2 className="text-lg font-semibold text-slate-900">
                    Résumé
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Sous-total
                      </span>

                      <span className="font-medium text-slate-900">
                        {subtotal.toFixed(2)} MAD
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Livraison
                      </span>

                      <span className="font-medium text-slate-900">
                        {deliveryFee.toFixed(2)} MAD
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">

                      <div className="flex justify-between">

                        <span className="font-semibold text-slate-900">
                          Total
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          {total.toFixed(2)} MAD
                        </span>

                      </div>

                    </div>

                  </div>

                  {selectedAddress && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Livraison
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {selectedAddress.nom ||
                          selectedAddress.name ||
                          "Adresse"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {selectedAddress.adresse ||
                          selectedAddress.address ||
                          ""}
                      </p>

                      <p className="text-sm text-slate-600">
                        {selectedAddress.ville ||
                          selectedAddress.city ||
                          ""}
                      </p>

                    </div>
                  )}

                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                    <p className="text-sm font-semibold text-blue-900">
                      {paymentMethod === "paypal"
                        ? "Paiement PayPal Sandbox"
                        : "Paiement à la livraison"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      {paymentMethod === "paypal"
                        ? "Vous allez être redirigé vers PayPal Sandbox pour utiliser un compte ou des moyens de paiement de test."
                        : "Vous paierez votre commande lors de sa réception."}
                    </p>

                  </div>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !selectedAddressId ||
                      !paymentMethod
                    }
                    className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? paymentMethod === "paypal"
                        ? "Redirection vers PayPal..."
                        : "Création de la commande..."
                      : paymentMethod === "paypal"
                      ? "Payer avec PayPal"
                      : "Confirmer la commande"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/client/cart")}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Retour au panier
                  </button>

                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Checkout;

