import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Commissions() {
  const [commissions, setCommissions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    order_id: "",
    vendeur_id: "",
    taux: "",
    montant: "",
  });

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/commissions"
      );

      setCommissions(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les commissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const createCommission = async (event) => {
    event.preventDefault();

    try {
      await api.post("/commissions", {
        order_id: Number(form.order_id),
        vendeur_id: Number(form.vendeur_id),
        taux: Number(form.taux),
        montant: Number(form.montant),
      });

      setModalOpen(false);

      setForm({
        order_id: "",
        vendeur_id: "",
        taux: "",
        montant: "",
      });

      await loadCommissions();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de créer la commission."
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
              Commissions
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Suivez les commissions générées par les commandes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Nouvelle commission
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
          ) : commissions.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucune commission.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Commande
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vendeur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Taux
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Montant
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {commissions.map((commission) => (
                    <tr
                      key={commission.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {commission.order?.numero ||
                          `#${commission.order_id}`}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {commission.vendeur?.nom ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {commission.taux}%
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {commission.montant} MAD
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
        onClose={() => setModalOpen(false)}
        title="Nouvelle commission"
      >
        <form
          onSubmit={createCommission}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ID commande
            </label>

            <input
              type="number"
              name="order_id"
              value={form.order_id}
              onChange={handleChange}
              required
              min="1"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ID vendeur
            </label>

            <input
              type="number"
              name="vendeur_id"
              value={form.vendeur_id}
              onChange={handleChange}
              required
              min="1"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Taux
            </label>

            <input
              type="number"
              name="taux"
              value={form.taux}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Montant
            </label>

            <input
              type="number"
              name="montant"
              value={form.montant}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default Commissions;