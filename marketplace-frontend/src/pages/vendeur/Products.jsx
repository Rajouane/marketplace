
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import ProductCard from "../../components/common/ProductCard";
import api from "../../services/api";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("marketplace_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export default function Products() {
  const user = useMemo(() => getStoredUser(), []);

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    shop_id: "",
    category_id: "",
    nom: "",
    description: "",
    prix: "",
    prix_promotionnel: "",
    stock: "",
    seuil_alerte: "5",
    marque: "",
    statut: "brouillon",
  });

  // =========================================================
  // CHARGER LES DONNÉES
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        shopsResponse,
        categoriesResponse,
      ] = await Promise.all([
        api.get("/products"),
        api.get("/shops"),
        api.get("/categories"),
      ]);

      const allProducts = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data?.data || [];

      const allShops = Array.isArray(shopsResponse.data)
        ? shopsResponse.data
        : shopsResponse.data?.data || [];

      const allCategories = Array.isArray(
        categoriesResponse.data
      )
        ? categoriesResponse.data
        : categoriesResponse.data?.data || [];

      // Boutiques du vendeur connecté
      const myShops = allShops.filter(
        (shop) =>
          Number(shop.vendeur_id) === Number(user?.id)
      );

      const myShopIds = myShops.map((shop) =>
        Number(shop.id)
      );

      // Produits appartenant aux boutiques du vendeur
      const myProducts = allProducts.filter((product) =>
        myShopIds.includes(Number(product.shop_id))
      );

      setShops(myShops);
      setProducts(myProducts);
      setCategories(allCategories);

      // Sélection automatique si le vendeur possède une seule boutique
      if (
        myShops.length === 1 &&
        !editingProduct
      ) {
        setForm((previous) => ({
          ...previous,
          shop_id: String(myShops[0].id),
        }));
      }
    } catch (err) {
      console.error(
        "Erreur chargement produits :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de charger les produits."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FILTRAGE
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.nom
          ?.toLowerCase()
          .includes(searchValue) ||
        product.marque
          ?.toLowerCase()
          .includes(searchValue) ||
        product.shop?.nom
          ?.toLowerCase()
          .includes(searchValue) ||
        product.category?.nom
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        product.statut === statusFilter;

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

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      shop_id:
        shops.length === 1
          ? String(shops[0].id)
          : "",
      category_id: "",
      nom: "",
      description: "",
      prix: "",
      prix_promotionnel: "",
      stock: "",
      seuil_alerte: "5",
      marque: "",
      statut: "brouillon",
    });

    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
  };

  // =========================================================
  // OUVRIR MODAL AJOUT
  // =========================================================

  const openCreateModal = () => {
    setError("");
    setSuccess("");

    resetForm();

    setModalOpen(true);
  };

  // =========================================================
  // OUVRIR MODAL MODIFICATION
  // =========================================================

  const openEditModal = (product) => {
    setError("");
    setSuccess("");

    setEditingProduct(product);

    setForm({
      shop_id: String(
        product.shop_id || ""
      ),

      category_id: String(
        product.category_id || ""
      ),

      nom: product.nom || "",

      description:
        product.description || "",

      prix: product.prix || "",

      prix_promotionnel:
        product.prix_promotionnel || "",

      stock: product.stock ?? "",

      seuil_alerte:
        product.seuil_alerte ?? "5",

      marque: product.marque || "",

      statut:
        product.statut || "brouillon",
    });

    setImageFile(null);

    const existingImage =
      product?.images?.[0]?.chemin;

    if (existingImage) {
      const API_URL =
        "http://127.0.0.1:8000";

      let imageUrl;

      if (
        existingImage.startsWith(
          "http://"
        ) ||
        existingImage.startsWith(
          "https://"
        )
      ) {
        imageUrl = existingImage;
      } else if (
        existingImage.startsWith(
          "/storage/"
        )
      ) {
        imageUrl =
          `${API_URL}${existingImage}`;
      } else if (
        existingImage.startsWith(
          "storage/"
        )
      ) {
        imageUrl =
          `${API_URL}/${existingImage}`;
      } else {
        imageUrl =
          `${API_URL}/storage/${existingImage.replace(
            /^\/+/,
            ""
          )}`;
      }

      setImagePreview(imageUrl);
    } else {
      setImagePreview("");
    }

    setModalOpen(true);
  };

  // =========================================================
  // FERMER MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    resetForm();
  };

  // =========================================================
  // CHANGEMENT FORMULAIRE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Veuillez sélectionner une image valide."
      );

      return;
    }

    // Laravel max:2048 = 2 Mo
    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setError(
        "L'image ne doit pas dépasser 2 Mo."
      );

      return;
    }

    setError("");

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  const uploadProductImage = async (
    productId
  ) => {
    if (!imageFile || !productId) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "image",
      imageFile
    );

    // Ne pas mettre Content-Type manuellement.
    // Axios ajoute automatiquement le boundary.
    await api.post(
      `/products/${productId}/images`,
      formData
    );
  };

  // =========================================================
  // AJOUT / MODIFICATION
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // -------------------------
      // VALIDATIONS
      // -------------------------

      if (!form.shop_id) {
        throw new Error(
          "Veuillez sélectionner une boutique."
        );
      }

      if (!form.category_id) {
        throw new Error(
          "Veuillez sélectionner une catégorie."
        );
      }

      if (!form.nom.trim()) {
        throw new Error(
          "Veuillez saisir le nom du produit."
        );
      }

      if (form.prix === "") {
        throw new Error(
          "Veuillez saisir le prix du produit."
        );
      }

      if (form.stock === "") {
        throw new Error(
          "Veuillez saisir le stock."
        );
      }

      // -------------------------
      // PAYLOAD
      // -------------------------

      const payload = {
        shop_id: Number(
          form.shop_id
        ),

        category_id: Number(
          form.category_id
        ),

        nom: form.nom.trim(),

        description:
          form.description || null,

        prix: Number(
          form.prix
        ),

        prix_promotionnel:
          form.prix_promotionnel === ""
            ? null
            : Number(
                form.prix_promotionnel
              ),

        stock: Number(
          form.stock
        ),

        seuil_alerte: Number(
          form.seuil_alerte || 5
        ),

        marque:
          form.marque || null,

        statut: form.statut,
      };

      let productId;

      // =====================================================
      // MODIFICATION
      // =====================================================

      if (editingProduct) {
        const response =
          await api.put(
            `/products/${editingProduct.id}`,
            payload
          );

        productId =
          response.data?.product?.id ||
          editingProduct.id;
      }

      // =====================================================
      // AJOUT
      // =====================================================

      else {
        const response =
          await api.post(
            "/products",
            payload
          );

        productId =
          response.data?.product?.id;
      }

      if (!productId) {
        throw new Error(
          "Le produit a été enregistré mais son identifiant est introuvable."
        );
      }

      // =====================================================
      // IMAGE
      // =====================================================

      if (imageFile) {
        await uploadProductImage(
          productId
        );
      }

      // =====================================================
      // MESSAGE
      // =====================================================

      if (editingProduct) {
        setSuccess(
          imageFile
            ? "Produit et image modifiés avec succès."
            : "Produit modifié avec succès."
        );
      } else {
        setSuccess(
          imageFile
            ? "Produit et image ajoutés avec succès."
            : "Produit ajouté avec succès."
        );
      }

      // Recharger les produits
      await loadData();

      // Fermer modal
      setModalOpen(false);

      resetForm();
    } catch (err) {
      console.error(
        "Erreur produit :",
        err
      );

      const backendErrors =
        err.response?.data?.errors;

      if (backendErrors) {
        const firstError =
          Object.values(
            backendErrors
          )?.[0]?.[0];

        setError(
          firstError ||
            "Veuillez vérifier les informations saisies."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Une erreur est survenue."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SUPPRESSION
  // =========================================================

  const handleDelete = async (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer le produit "${product.nom}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/products/${product.id}`
      );

      setProducts((previous) =>
        previous.filter(
          (item) =>
            item.id !== product.id
        )
      );

      setSuccess(
        "Produit supprimé avec succès."
      );
    } catch (err) {
      console.error(
        "Erreur suppression produit :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer le produit."
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Espace vendeur
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Mes produits
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gérez les produits de vos boutiques.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {filteredProducts.length} produit(s)
            </span>

            <Button
              onClick={openCreateModal}
            >
              + Ajouter un produit
            </Button>
          </div>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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

        {/* PRODUCTS */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Chargement des produits...
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
                <path d="m3 7 9-4 9 4" />
                <path d="M3 7v10l9 4 9-4V7" />
                <path d="M3 7l9 4 9-4" />
                <path d="M12 11v10" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Aucun produit
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Vous n'avez pas encore ajouté de produit.
            </p>

            <div className="mt-5">
              <Button
                onClick={openCreateModal}
              >
                Ajouter un produit
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              )
            )}
          </div>
        )}

        {/* MODAL */}

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={
            editingProduct
              ? "Modifier le produit"
              : "Ajouter un produit"
          }
          size="lg"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* IMAGE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image du produit
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                {imagePreview ? (
                  <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img
                      src={imagePreview}
                      alt="Aperçu du produit"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-white">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          className="text-slate-400"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                          />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>

                      <p className="text-sm text-slate-400">
                        Aucune image sélectionnée
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG ou WEBP — maximum 2 Mo.
                </p>
              </div>
            </div>

            {/* SHOP */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Boutique
              </label>

              <select
                name="shop_id"
                value={form.shop_id}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">
                  Sélectionner une boutique
                </option>

                {shops.map((shop) => (
                  <option
                    key={shop.id}
                    value={shop.id}
                  >
                    {shop.nom}
                  </option>
                ))}
              </select>

              {shops.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  Vous devez avoir une boutique avant d'ajouter un produit.
                </p>
              )}
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Catégorie
              </label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">
                  Sélectionner une catégorie
                </option>

                {categories
                  .filter(
                    (category) =>
                      category.statut
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

            {/* NAME */}

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
                placeholder="Ex: iPhone 15"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Description du produit..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* PRICE */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prix
                </label>

                <input
                  type="number"
                  name="prix"
                  value={form.prix}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
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
                  placeholder="Optionnel"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            {/* STOCK */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
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
                  placeholder="5"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            {/* MARQUE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Marque
              </label>

              <input
                type="text"
                name="marque"
                value={form.marque}
                onChange={handleChange}
                placeholder="Ex: Apple"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* STATUS */}

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

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={saving}
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={
                  saving ||
                  shops.length === 0
                }
              >
                {saving
                  ? "Enregistrement..."
                  : editingProduct
                  ? "Enregistrer les modifications"
                  : "Ajouter le produit"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

