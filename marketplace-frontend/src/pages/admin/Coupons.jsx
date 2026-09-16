import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Coupons() {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] =
    useState(null);

  const [form, setForm] = useState({
    code: "",
    type: "pourcentage",
    valeur: "",
    montant_minimum: "",
    date_debut: "",
    date_fin: "",
    nombre_max_utilisations: "",
    actif: true,
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/coupons");

      setCoupons(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setForm({
      code: "",
      type: "pourcentage",
      valeur: "",
      montant_minimum: "",
      date_debut: "",
      date_fin: "",
      nombre_max_utilisations: "",
      actif: true,
    });
  };

  const openCreate = () => {
    setEditingCoupon(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      type: coupon.type || "pourcentage",
      valeur: coupon.valeur || "",
      montant_minimum:
        coupon.montant_minimum || "",
      date_debut:
        coupon.date_debut
          ? coupon.date_debut.slice(0, 10)
          : "",
      date_fin:
        coupon.date_fin
          ? coupon.date_fin.slice(0, 10)
          : "",
      nombre_max_utilisations:
        coupon.nombre_max_utilisations || "",
      actif: Boolean(coupon.actif),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
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

  const saveCoupon = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        code: form.code,
        type: form.type,
        valeur: Number(form.valeur),
        montant_minimum:
          form.montant_minimum === ""
            ? 0
            : Number(form.montant_minimum),
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        nombre_max_utilisations:
          form.nombre_max_utilisations === ""
            ? null
            : Number(
                form.nombre_max_utilisations
              ),
        actif: form.actif,
      };

      if (editingCoupon) {
        await api.put(
          `/coupons/${editingCoupon.id}`,
          payload
        );
      } else {
        await api.post("/coupons", payload);
      }

      closeModal();
      await loadCoupons();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible d'enregistrer le coupon."
      );
    }
  };

  const deleteCoupon = async (coupon) => {
    const confirmed = window.confirm(
      `Supprimer le coupon "${coupon.code}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/coupons/${coupon.id}`
      );

      await loadCoupons();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer le coupon."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Coupons
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gérez les promotions et les codes de réduction.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Nouveau coupon
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
          ) : coupons.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucun coupon.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Code
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Réduction
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Utilisations
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
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {coupon.code}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {coupon.valeur}{" "}
                        {coupon.type ===
                        "pourcentage"
                          ? "%"
                          : "MAD"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {coupon.nombre_utilisations ??
                          0}
                        {" / "}
                        {coupon.nombre_max_utilisations ??
                          "∞"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            coupon.actif
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {coupon.actif
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(coupon)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCoupon(coupon)
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
          editingCoupon
            ? "Modifier le coupon"
            : "Nouveau coupon"
        }
        size="lg"
      >
        <form
          onSubmit={saveCoupon}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Code
              </label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                placeholder="PROMO10"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
              >
                <option value="pourcentage">
                  Pourcentage
                </option>

                <option value="montant">
                  Montant
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Valeur
              </label>

              <input
                type="number"
                name="valeur"
                value={form.valeur}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Montant minimum
              </label>

              <input
                type="number"
                name="montant_minimum"
                value={form.montant_minimum}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date début
              </label>

              <input
                type="date"
                name="date_debut"
                value={form.date_debut}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date fin
              </label>

              <input
                type="date"
                name="date_fin"
                value={form.date_fin}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre maximum
              </label>

              <input
                type="number"
                name="nombre_max_utilisations"
                value={
                  form.nombre_max_utilisations
                }
                onChange={handleChange}
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="actif"
              checked={form.actif}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm text-slate-700">
              Coupon actif
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
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Coupons;