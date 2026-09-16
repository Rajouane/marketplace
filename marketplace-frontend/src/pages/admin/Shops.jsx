import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Shops() {
  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [editingShop, setEditingShop] =
    useState(null);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    statut: "en_attente",
  });

  const loadShops = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/shops");

      setShops(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les boutiques."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const openEdit = (shop) => {
    setEditingShop(shop);

    setForm({
      nom: shop.nom || "",
      description: shop.description || "",
      statut: shop.statut || "en_attente",
    });
  };

  const closeModal = () => {
    setEditingShop(null);

    setForm({
      nom: "",
      description: "",
      statut: "en_attente",
    });
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const updateShop = async (event) => {
    event.preventDefault();

    try {
      await api.put(
        `/shops/${editingShop.id}`,
        form
      );

      closeModal();
      await loadShops();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier la boutique."
      );
    }
  };

  const deleteShop = async (shop) => {
    const confirmed = window.confirm(
      `Supprimer la boutique "${shop.nom}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/shops/${shop.id}`);

      await loadShops();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer la boutique."
      );
    }
  };

  const filteredShops = shops.filter((shop) => {
    const value = search.toLowerCase();

    return (
      shop.nom
        ?.toLowerCase()
        .includes(value) ||
      shop.vendeur?.nom
        ?.toLowerCase()
        .includes(value) ||
      shop.vendeur?.email
        ?.toLowerCase()
        .includes(value)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Boutiques
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Supervisez les boutiques des vendeurs.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {shops.length} boutique(s)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher une boutique ou un vendeur..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chargement des boutiques...
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucune boutique trouvée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Boutique
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vendeur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShops.map((shop) => (
                    <tr
                      key={shop.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {shop.nom}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {shop.description ||
                            "Aucune description"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {shop.vendeur?.nom || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {shop.vendeur?.email || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-medium",
                            shop.statut === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : shop.statut ===
                                "suspendue"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {shop.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(shop)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteShop(shop)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(editingShop)}
        onClose={closeModal}
        title="Modifier la boutique"
      >
        <form
          onSubmit={updateShop}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nom
            </label>

            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
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
              rows="4"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Statut
            </label>

            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="en_attente">
                En attente
              </option>

              <option value="active">
                Active
              </option>

              <option value="suspendue">
                Suspendue
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Shops;