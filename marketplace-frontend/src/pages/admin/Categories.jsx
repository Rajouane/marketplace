import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] = useState({
    nom: "",
    parent_id: "",
    statut: true,
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/categories"
      );

      setCategories(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les catégories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);

    setForm({
      nom: "",
      parent_id: "",
      statut: true,
    });

    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);

    setForm({
      nom: category.nom || "",
      parent_id: category.parent_id || "",
      statut: Boolean(category.statut),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const saveCategory = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        nom: form.nom,
        parent_id: form.parent_id
          ? Number(form.parent_id)
          : null,
        statut: form.statut,
      };

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.id}`,
          payload
        );
      } else {
        await api.post(
          "/categories",
          payload
        );
      }

      closeModal();
      await loadCategories();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible d'enregistrer la catégorie."
      );
    }
  };

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Supprimer la catégorie "${category.nom}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/categories/${category.id}`
      );

      await loadCategories();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer la catégorie."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Catalogue
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Catégories
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Organisez les produits de la marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Nouvelle catégorie
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chargement...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucune catégorie.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nom
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parent
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
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {category.nom}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.parent?.nom || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-medium",
                            category.statut
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {category.statut
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(category)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCategory(category)
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
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingCategory
            ? "Modifier la catégorie"
            : "Nouvelle catégorie"
        }
      >
        <form
          onSubmit={saveCategory}
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
              placeholder="Ex: Électronique"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Catégorie parent
            </label>

            <select
              name="parent_id"
              value={form.parent_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="">
                Aucune
              </option>

              {categories
                .filter(
                  (category) =>
                    category.id !==
                    editingCategory?.id
                )
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.nom}
                  </option>
                ))}
            </select>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="statut"
              checked={form.statut}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm text-slate-700">
              Catégorie active
            </span>
          </label>

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
              {editingCategory
                ? "Enregistrer"
                : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Categories;