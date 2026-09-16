import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Connexion
      const response = await api.post("/login", form);

      const token = response.data.token;

      if (!token) {
        throw new Error("Token non reçu.");
      }

      // 2. Sauvegarder le token
      localStorage.setItem("marketplace_token", token);

      // 3. Récupérer l'utilisateur connecté avec son rôle
      const meResponse = await api.get("/me");

      const user = meResponse.data.user || meResponse.data;

      if (!user) {
        throw new Error("Utilisateur non trouvé.");
      }

      // 4. Sauvegarder l'utilisateur
      localStorage.setItem(
        "marketplace_user",
        JSON.stringify(user)
      );

      // 5. Récupérer le rôle
      const role = user?.role?.nom;

      console.log("Utilisateur connecté :", user);
      console.log("Rôle :", role);

      // 6. Redirection selon le rôle
      switch (role) {
        case "Administrateur":
          navigate("/admin");
          break;

        case "Vendeur":
          navigate("/vendeur");
          break;

        case "Client":
          navigate("/client");
          break;

        case "Livreur":
          navigate("/livreur");
          break;

        default:
          setError(
            "Votre compte ne possède pas un rôle valide."
          );

          localStorage.removeItem("marketplace_token");
          localStorage.removeItem("marketplace_user");
      }
    } catch (err) {
      console.error("Erreur Login :", err);

      localStorage.removeItem("marketplace_token");
      localStorage.removeItem("marketplace_user");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Email ou mot de passe incorrect."
      );
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
            Marketplace
            <br />
            Multi-Vendeurs
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Une plateforme e-commerce permettant aux vendeurs,
            clients et livreurs de travailler dans un même
            environnement.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">

          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1736]">
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Connexion
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Connectez-vous à votre espace.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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
                  Mot de passe
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0b1736] focus:ring-2 focus:ring-[#0b1736]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0b1736] px-4 py-3 font-medium text-white transition hover:bg-[#142653] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Connexion..."
                  : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Vous n'avez pas encore de compte ?{" "}

              <Link
                to="/register"
                className="font-semibold text-[#0b1736] hover:underline"
              >
                Créer un compte
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;