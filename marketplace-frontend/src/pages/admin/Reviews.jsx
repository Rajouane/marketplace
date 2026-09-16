import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function Reviews() {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reviews");

      setReviews(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les avis."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const updateReview = async (
    review,
    statut
  ) => {
    try {
      await api.put(`/reviews/${review.id}`, {
        statut,
      });

      await loadReviews();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier l'avis."
      );
    }
  };

  const deleteReview = async (review) => {
    const confirmed = window.confirm(
      "Voulez-vous supprimer cet avis ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/reviews/${review.id}`
      );

      await loadReviews();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer l'avis."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Avis
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Modérez les avis publiés par les clients.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Chargement des avis...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucun avis.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Produit
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Note
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Commentaire
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
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {review.client?.nom ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {review.product?.nom ||
                          "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-amber-600">
                          {review.note}/5
                        </span>
                      </td>

                      <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                        {review.commentaire ||
                          "Aucun commentaire"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {review.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <select
                            value={
                              review.statut || ""
                            }
                            onChange={(event) =>
                              updateReview(
                                review,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs outline-none"
                          >
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

                          <button
                            type="button"
                            onClick={() =>
                              deleteReview(review)
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
    </DashboardLayout>
  );
}

export default Reviews;