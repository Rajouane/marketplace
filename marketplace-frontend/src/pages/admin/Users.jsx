import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] =
    useState(null);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    role_id: "",
    statut: "actif",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les utilisateurs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEdit = (user) => {
    setEditingUser(user);

    setForm({
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      role_id:
        user.role_id ||
        user.role?.id ||
        "",
      statut: user.statut || "actif",
    });
  };

  const closeEdit = () => {
    setEditingUser(null);

    setForm({
      nom: "",
      email: "",
      telephone: "",
      role_id: "",
      statut: "actif",
    });
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const updateUser = async (event) => {
    event.preventDefault();

    try {
      await api.put(
        `/users/${editingUser.id}`,
        {
          ...form,
          role_id: Number(form.role_id),
        }
      );

      closeEdit();
      await loadUsers();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier l'utilisateur."
      );
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer l'utilisateur "${user.nom}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);

      await loadUsers();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer l'utilisateur."
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.nom
        ?.toLowerCase()
        .includes(value) ||
      user.email
        ?.toLowerCase()
        .includes(value) ||
      user.role?.nom
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
              Utilisateurs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gérez les comptes, les rôles et les statuts.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {users.length} utilisateur(s)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher par nom, email ou rôle..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
              Chargement des utilisateurs...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Aucun utilisateur trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Utilisateur
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Téléphone
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rôle
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {user.nom}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.telephone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {user.role?.nom ||
                            "Sans rôle"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-medium",
                            user.statut === "actif"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700",
                          ].join(" ")}
                        >
                          {user.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(user)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteUser(user)
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
        isOpen={Boolean(editingUser)}
        onClose={closeEdit}
        title="Modifier l'utilisateur"
      >
        <form
          onSubmit={updateUser}
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
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Téléphone
            </label>

            <input
              type="text"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rôle
            </label>

            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="1">
                Administrateur
              </option>

              <option value="2">
                Vendeur
              </option>

              <option value="3">
                Client
              </option>

              <option value="4">
                Livreur
              </option>
            </select>
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
              <option value="actif">
                Actif
              </option>

              <option value="suspendu">
                Suspendu
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={closeEdit}
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

export default Users;