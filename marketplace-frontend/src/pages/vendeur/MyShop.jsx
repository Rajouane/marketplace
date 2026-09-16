import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import api from "../../services/api";

function MyShop() {
  const [shop, setShop] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(
    localStorage.getItem("marketplace_user") || "null"
  );

  const userId = user?.id;

  const loadShop = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/shops");

      const shops = Array.isArray(response.data)
        ? response.data
        : [];

      const myShop = shops.find(
        (item) =>
          Number(item.vendeur_id) === Number(userId)
      );

      if (myShop) {
        setShop(myShop);

        setForm({
          nom: myShop.nom || "",
          description: myShop.description || "",
        });
      } else {
        setShop(null);

        setForm({
          nom: "",
          description: "",
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger votre boutique."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, [userId]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.nom.trim()) {
        throw new Error(
          "Le nom de la boutique est obligatoire."
        );
      }

      if (shop) {
        const response = await api.put(
          `/shops/${shop.id}`,
          {
            nom: form.nom,
            description: form.description,
          }
        );

        setShop(response.data.shop || response.data);

        setSuccess(
          "Boutique modifiée avec succès."
        );
      } else {
        const response = await api.post("/shops", {
          nom: form.nom,
          description: form.description,
        });

        setShop(response.data.shop || response.data);

        setSuccess(
          "Boutique créée avec succès."
        );
      }

      await loadShop();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shop) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer votre boutique ?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/shops/${shop.id}`);

      setShop(null);

      setForm({
        nom: "",
        description: "",
      });

      setSuccess(
        "Boutique supprimée avec succès."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer la boutique."
      );
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";

      case "en_attente":
        return "En attente";

      case "suspendue":
        return "Suspendue";

      default:
        return status || "-";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700";

      case "en_attente":
        return "bg-amber-50 text-amber-700";

      case "suspendue":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-96 items-center justify-center">
          <p className="text-sm text-slate-500">
            Chargement de votre boutique...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ma boutique
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gérez les informations de votre boutique.
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

        {shop && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Statut de la boutique
                </p>

                <div className="mt-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1",
                      "text-xs font-semibold",
                      getStatusClass(shop.statut),
                    ].join(" ")}
                  >
                    {getStatusLabel(shop.statut)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Boutique #{shop.id}
              </div>

            </div>

            {shop.statut === "en_attente" && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Boutique en attente de validation
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Votre boutique doit être validée par
                  l'administrateur avant d'être pleinement active.
                </p>
              </div>
            )}

            {shop.statut === "suspendue" && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Boutique suspendue
                </p>

                <p className="mt-1 text-xs text-red-700">
                  Votre boutique est actuellement suspendue.
                </p>
              </div>
            )}

          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {shop
                ? "Modifier la boutique"
                : "Créer ma boutique"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {shop
                ? "Modifiez les informations de votre boutique."
                : "Créez votre boutique pour commencer à vendre vos produits."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nom de la boutique
              </label>

              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                placeholder="Ex : Tech Store"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Présentez votre boutique..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">

              {shop ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                >
                  Supprimer la boutique
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : shop
                  ? "Enregistrer les modifications"
                  : "Créer la boutique"}
              </Button>

            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default MyShop;