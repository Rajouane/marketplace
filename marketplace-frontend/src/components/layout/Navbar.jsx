
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";

// ======================================================
// PALETTE
// ======================================================

const ROLE_COLORS = {
  Administrateur: "#16213E",
  Vendeur: "#C08A3E",
  Client: "#2F7A63",
  Livreur: "#A2493D",
};

// ======================================================
// ROUTES PRINCIPALES PAR ROLE
// ======================================================

const ROLE_BASE_PATH = {
  Administrateur: "/admin",
  Vendeur: "/vendeur",
  Client: "/client",
  Livreur: "/livreur",
};

// ======================================================
// NAVBAR
// ======================================================

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ======================================================
  // RÉCUPÉRER L'UTILISATEUR
  // ======================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("marketplace_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("marketplace_user");
      }
    }
  }, []);

  // ======================================================
  // RÉCUPÉRER LES NOTIFICATIONS NON LUES
  // ======================================================

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get("/notifications");

        const count = response.data.filter(
          (notification) => !notification.lu
        ).length;

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des notifications :",
          error
        );
      }
    };

    fetchUnreadNotifications();
  }, []);

  // ======================================================
  // DÉCONNEXION
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("marketplace_token");
    localStorage.removeItem("marketplace_user");

    navigate("/login");
  };

  // ======================================================
  // ROLE
  // ======================================================

  const role = user?.role?.nom;

  const roleColor = ROLE_COLORS[role] || "#8A8577";

  // ======================================================
  // NAVIGATION PAR ROLE
  // ======================================================

  const navigation = {
    Administrateur: [
      {
        label: "Dashboard",
        path: "/admin",
      },
      {
        label: "Utilisateurs",
        path: "/admin/users",
      },
      {
        label: "Boutiques",
        path: "/admin/shops",
      },
      {
        label: "Produits",
        path: "/admin/products",
      },
      {
        label: "Catégories",
        path: "/admin/categories",
      },
      {
        label: "Commandes",
        path: "/admin/orders",
      },
      {
        label: "Livraisons",
        path: "/admin/deliveries",
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
      },
      {
        label: "Avis",
        path: "/admin/reviews",
      },
      {
        label: "Commissions",
        path: "/admin/commissions",
      },
    ],

    Vendeur: [
      {
        label: "Dashboard",
        path: "/vendeur",
      },
      {
        label: "Ma boutique",
        path: "/vendeur/shop",
      },
      {
        label: "Produits",
        path: "/vendeur/products",
      },
      {
        label: "Commandes",
        path: "/vendeur/orders",
      },
    ],

    Client: [
      {
        label: "Accueil",
        path: "/client",
      },
      {
        label: "Produits",
        path: "/client/products",
      },
      {
        label: "Panier",
        path: "/client/cart",
      },
      {
        label: "Commandes",
        path: "/client/orders",
      },
      {
        label: "Favoris",
        path: "/client/favorites",
      },
      {
        label: "Adresses",
        path: "/client/addresses",
      },
    ],

    Livreur: [
      {
        label: "Dashboard",
        path: "/livreur",
      },
      {
        label: "Livraisons",
        path: "/livreur/deliveries",
      },
    ],
  };

  const links = navigation[role] || [];

  // ======================================================
  // PAGE NOTIFICATIONS
  // ======================================================

  const getNotificationPath = () => {
    return "/notifications";
  };

  // ======================================================
  // LABEL DU ROLE
  // ======================================================

  const getRoleLabel = () => {
    switch (role) {
      case "Administrateur":
        return "Administrateur";

      case "Vendeur":
        return "Vendeur";

      case "Client":
        return "Client";

      case "Livreur":
        return "Livreur";

      default:
        return "Utilisateur";
    }
  };

  // ======================================================
  // PAGE D'ACCUEIL DU ROLE
  // ======================================================

  const goToRoleDashboard = () => {
    if (role === "Administrateur") {
      navigate("/admin");
    } else if (role === "Vendeur") {
      navigate("/vendeur");
    } else if (role === "Client") {
      navigate("/client");
    } else if (role === "Livreur") {
      navigate("/livreur");
    }
  };

  // ======================================================
  // AFFICHAGE DU NOMBRE DE NOTIFICATIONS
  // ======================================================

  const notificationBadge = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center px-4 sm:px-6">

        {/* ==================================================
            LOGO
        ================================================== */}

        <button
          type="button"
          onClick={goToRoleDashboard}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#16213E]">
            <span className="font-serif text-base font-semibold text-white">
              M
            </span>
          </div>

          <div className="hidden text-left sm:block">
            <p className="font-serif text-[15px] font-semibold leading-tight text-[#16213E]">
              Marketplace
            </p>

            <p className="text-[11px] text-stone-400">
              Multi-vendeurs
            </p>
          </div>
        </button>

        {/* ==================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav className="relative ml-10 hidden min-w-0 flex-1 lg:flex">
          <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === ROLE_BASE_PATH[role]}
                className={({ isActive }) =>
                  [
                    "shrink-0 whitespace-nowrap border-b-2 px-3 py-5",
                    "text-[13px] font-medium transition-colors",
                    isActive
                      ? "border-[#C08A3E] text-[#16213E]"
                      : "border-transparent text-stone-500 hover:text-[#16213E]",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white to-transparent" />
        </nav>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="ml-auto flex items-center gap-1">

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate(getNotificationPath())}
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#16213E]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {/* BADGE */}

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C08A3E] px-1 text-[9px] font-bold leading-none text-white">
                {notificationBadge}
              </span>
            )}
          </button>

          {/* ==================================================
              USER
          ================================================== */}

          <div className="ml-2 hidden items-center gap-3 border-l border-stone-200 pl-4 sm:flex">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
              <span className="text-xs font-semibold text-[#16213E]">
                {user?.nom?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
                style={{
                  backgroundColor: roleColor,
                }}
              />
            </div>

            <div className="hidden xl:block">
              <p className="max-w-32.5 truncate text-sm font-medium text-stone-800">
                {user?.nom || "Utilisateur"}
              </p>

              <p className="text-[11px] text-stone-400">
                {getRoleLabel()}
              </p>
            </div>
          </div>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 hidden rounded-md px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#16213E] sm:block"
          >
            Déconnexion
          </button>

          {/* ==================================================
              MOBILE
          ================================================== */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 lg:hidden"
          >
            {menuOpen ? (
              <span className="text-xl leading-none">
                ×
              </span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (
        <div className="border-t border-stone-200 bg-white lg:hidden">
          <nav className="mx-auto max-w-[1600px] space-y-0.5 px-3 py-3">

            {/* NAVIGATION */}

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === ROLE_BASE_PATH[role]}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    "block rounded-md border-l-[3px] px-3 py-3",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#C08A3E] bg-stone-50 text-[#16213E]"
                      : "border-transparent text-stone-600 hover:bg-stone-50",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* ==================================================
                NOTIFICATIONS MOBILE
            ================================================== */}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate(getNotificationPath());
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              <div className="relative">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C08A3E] px-1 text-[9px] font-bold leading-none text-white">
                    {notificationBadge}
                  </span>
                )}
              </div>

              <span>
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="ml-auto text-xs font-semibold text-[#C08A3E]">
                  {unreadCount} non lue
                  {unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </button>

            {/* ==================================================
                MOBILE USER
            ================================================== */}

            <div className="mt-3 border-t border-stone-200 pt-3">
              <div className="mb-2 flex items-center gap-3 px-3">

                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-stone-100">
                  <span className="text-xs font-semibold text-[#16213E]">
                    {user?.nom?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
                    style={{
                      backgroundColor: roleColor,
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-800">
                    {user?.nom || "Utilisateur"}
                  </p>

                  <p className="text-xs text-stone-400">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-md px-3 py-3 text-left text-sm font-medium text-[#A2493D] hover:bg-stone-50"
              >
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;

