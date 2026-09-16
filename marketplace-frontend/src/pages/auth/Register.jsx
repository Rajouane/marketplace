import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.password_confirmation) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", form);

      const token = response.data.token;
      const user = response.data.user;

      if (token && user) {
        localStorage.setItem(
          "marketplace_token",
          token
        );

        localStorage.setItem(
          "marketplace_user",
          JSON.stringify(user)
        );

        const role = user?.role?.nom;

        if (role === "Administrateur") {
          navigate("/admin");
        } else if (role === "Vendeur") {
          navigate("/vendeur");
        } else if (role === "Client") {
          navigate("/client");
        } else if (role === "Livreur") {
          navigate("/livreur");
        } else {
          navigate("/");
        }
      } else {
        setSuccess(
          "Compte créé avec succès. Vous pouvez maintenant vous connecter."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors
        )[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Erreur de validation."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Une erreur est survenue lors de l'inscription."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <div className="hidden w-1/2 bg-[#0b1736] lg:flex">
        <div className="flex w-full flex-col justify-center px-16 xl:px-24">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <span className="text-2xl font-bold text-[#0b1736]">
              M
            </span>
          </div>

          <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
            Rejoignez notre
            <br />
            Marketplace
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Créez votre compte et accédez à votre espace
            personnalisé.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1736]">
              <span className="text-xl font-bold text-white">
                M
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Marketplace
            </h1>

            <p className="mt-1 text-slate-500">
              Multi-Vendeurs
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">
                Créer un compte
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Remplissez les informations ci-dessous.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nom complet
                </label>

                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  placeholder="Nom complet"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
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
                  placeholder="votre@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Téléphone
                </label>

                <input
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="06XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirmer le mot de passe
                </label>

                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#0b1736] px-4 py-3 font-medium text-white transition hover:bg-[#142653] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Création..."
                  : "Créer mon compte"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#0b1736] hover:underline"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;