import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import api from "../../services/api";

function Addresses() {
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState(null);

  const [form, setForm] = useState({
    adresse: "",
    ville: "",
    code_postal: "",
    pays: "Maroc",
  });

  const loadAddresses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/addresses");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setAddresses(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les adresses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setForm({
      adresse: "",
      ville: "",
      code_postal: "",
      pays: "Maroc",
    });

    setEditingAddress(null);
  };

  const openCreateModal = () => {
    setError("");
    setSuccess("");

    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setError("");
    setSuccess("");

    setEditingAddress(address);

    setForm({
      adresse: address.adresse || "",
      ville: address.ville || "",
      code_postal: address.code_postal || "",
      pays: address.pays || "Maroc",
    });

    setIsModalOpen(true);
  };

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
      if (editingAddress) {
        await api.put(
          `/addresses/${editingAddress.id}`,
          form
        );

        setSuccess(
          "Adresse modifiée avec succès."
        );
      } else {
        await api.post("/addresses", form);

        setSuccess(
          "Adresse ajoutée avec succès."
        );
      }

      setIsModalOpen(false);
      resetForm();

      await loadAddresses();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible d'enregistrer l'adresse."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (address) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette adresse ?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/addresses/${address.id}`
      );

      setSuccess(
        "Adresse supprimée avec succès."
      );

      await loadAddresses();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer l'adresse."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Mes adresses
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez vos adresses de livraison.
            </p>
          </div>

          <Button onClick={openCreateModal}>
            Ajouter une adresse
          </Button>

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

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Chargement des adresses...
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              Aucune adresse
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ajoutez une adresse pour faciliter vos commandes.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Adresse #{address.id}
                    </p>

                    <p className="mt-3 font-semibold text-slate-900">
                      {address.adresse}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                    A
                  </div>

                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-500">

                  <p>
                    <span className="font-medium text-slate-700">
                      Ville :
                    </span>{" "}
                    {address.ville}
                  </p>

                  {address.code_postal && (
                    <p>
                      <span className="font-medium text-slate-700">
                        Code postal :
                      </span>{" "}
                      {address.code_postal}
                    </p>
                  )}

                  <p>
                    <span className="font-medium text-slate-700">
                      Pays :
                    </span>{" "}
                    {address.pays || "Maroc"}
                  </p>

                </div>

                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(address)
                    }
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteAddress(address)
                    }
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingAddress
              ? "Modifier l'adresse"
              : "Ajouter une adresse"
          }
          size="md"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Adresse
              </label>

              <textarea
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Ex : 12 rue Hassan II"
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ville
              </label>

              <input
                type="text"
                name="ville"
                value={form.ville}
                onChange={handleChange}
                required
                placeholder="Ex : Casablanca"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Code postal
                </label>

                <input
                  type="text"
                  name="code_postal"
                  value={form.code_postal}
                  onChange={handleChange}
                  placeholder="Ex : 20000"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pays
                </label>

                <input
                  type="text"
                  name="pays"
                  value={form.pays}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : editingAddress
                  ? "Enregistrer"
                  : "Ajouter"}
              </Button>

            </div>

          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}

export default Addresses;