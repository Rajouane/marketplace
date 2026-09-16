import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import ProductCard from "../../components/common/ProductCard";
import api from "../../services/api";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    prix_promotionnel: "",
    stock: "",
    seuil_alerte: "",
    marque: "",
    statut: "brouillon",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/products");

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les produits."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      nom: product.nom || "",
      description:
        product.description || "",
      prix: product.prix || "",
      prix_promotionnel:
        product.prix_promotionnel || "",
      stock: product.stock ?? "",
      seuil_alerte:
        product.seuil_alerte ?? "",
      marque: product.marque || "",
      statut:
        product.statut || "brouillon",
    });
  };

  const closeModal = () => {
    setEditingProduct(null);

    setForm({
      nom: "",
      description: "",
      prix: "",
      prix_promotionnel: "",
      stock: "",
      seuil_alerte: "",
      marque: "",
      statut: "brouillon",
    });
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const updateProduct = async (event) => {
    event.preventDefault();

    try {
      await api.put(
        `/products/${editingProduct.id}`,
        {
          ...form,
          prix: Number(form.prix),

          prix_promotionnel:
            form.prix_promotionnel === ""
              ? null
              : Number(
                  form.prix_promotionnel
                ),

          stock: Number(form.stock),

          seuil_alerte:
            form.seuil_alerte === ""
              ? 5
              : Number(
                  form.seuil_alerte
                ),
        }
      );

      closeModal();

      await loadProducts();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier le produit."
      );
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Supprimer le produit "${product.nom}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/products/${product.id}`
      );

      await loadProducts();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer le produit."
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const value =
        search.toLowerCase();

      const matchesSearch =
        product.nom
          ?.toLowerCase()
          .includes(value) ||
        product.marque
          ?.toLowerCase()
          .includes(value) ||
        product.shop?.nom
          ?.toLowerCase()
          .includes(value) ||
        product.category?.nom
          ?.toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        product.statut ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    statusFilter,
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Catalogue
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Produits
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Supervisez les produits proposés
              par les vendeurs.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {filteredProducts.length} produit(s)
          </div>

        </div>

        {/* FILTERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher un produit, une boutique..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="brouillon">
                Brouillon
              </option>

              <option value="en_attente">
                En attente
              </option>

              <option value="publie">
                Publié
              </option>

              <option value="rejete">
                Rejeté
              </option>
            </select>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PRODUCTS */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Chargement des produits...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Aucun produit trouvé.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEdit}
                  onDelete={deleteProduct}
                />
              )
            )}

          </div>
        )}

      </div>

      {/* EDIT MODAL */}

      <Modal
        isOpen={Boolean(
          editingProduct
        )}
        onClose={closeModal}
        title="Modifier le produit"
        size="lg"
      >
        <form
          onSubmit={updateProduct}
          className="space-y-5"
        >

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nom du produit
            </label>

            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prix
              </label>

              <input
                type="number"
                name="prix"
                value={form.prix}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prix promotionnel
              </label>

              <input
                type="number"
                name="prix_promotionnel"
                value={
                  form.prix_promotionnel
                }
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Seuil d'alerte
              </label>

              <input
                type="number"
                name="seuil_alerte"
                value={
                  form.seuil_alerte
                }
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Marque
              </label>

              <input
                type="text"
                name="marque"
                value={form.marque}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Statut
            </label>

            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="brouillon">
                Brouillon
              </option>

              <option value="en_attente">
                En attente
              </option>

              <option value="publie">
                Publié
              </option>

              <option value="rejete">
                Rejeté
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

export default Products;