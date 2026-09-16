
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Shops from "./pages/admin/Shops";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Deliveries from "./pages/admin/Deliveries";
import Coupons from "./pages/admin/Coupons";
import Reviews from "./pages/admin/Reviews";
import Commissions from "./pages/admin/Commissions";
import Notifications from "./pages/admin/Notifications";

// VENDEUR
import VendeurDashboard from "./pages/vendeur/VendeurDashboard";
import MyShop from "./pages/vendeur/MyShop";
import VendeurProducts from "./pages/vendeur/Products";
import VendeurOrders from "./pages/vendeur/Orders";

// CLIENT
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProducts from "./pages/client/Products";
import ProductDetails from "./pages/client/ProductDetails";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import ClientOrders from "./pages/client/Orders";
import Favorites from "./pages/client/Favorites";
import Addresses from "./pages/client/Addresses";

// LIVREUR
import LivreurDashboard from "./pages/livreur/LivreurDashboard";
import LivreurDeliveries from "./pages/livreur/Deliveries";


function RoleRoute({ children, allowedRoles }) {
  const token = localStorage.getItem(
    "marketplace_token"
  );

  const storedUser = localStorage.getItem(
    "marketplace_user"
  );

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(
      "marketplace_token"
    );

    localStorage.removeItem(
      "marketplace_user"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role = user?.role?.nom;

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function HomeRedirect() {
  const token = localStorage.getItem(
    "marketplace_token"
  );

  const storedUser = localStorage.getItem(
    "marketplace_user"
  );

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {
    const user = JSON.parse(storedUser);
    const role = user?.role?.nom;

    switch (role) {
      case "Administrateur":
        return (
          <Navigate
            to="/admin"
            replace
          />
        );

      case "Vendeur":
        return (
          <Navigate
            to="/vendeur"
            replace
          />
        );

      case "Client":
        return (
          <Navigate
            to="/client"
            replace
          />
        );

      case "Livreur":
        return (
          <Navigate
            to="/livreur"
            replace
          />
        );

      default:
        localStorage.removeItem(
          "marketplace_token"
        );

        localStorage.removeItem(
          "marketplace_user"
        );

        return (
          <Navigate
            to="/login"
            replace
          />
        );
    }
  } catch {
    localStorage.removeItem(
      "marketplace_token"
    );

    localStorage.removeItem(
      "marketplace_user"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            AUTHENTIFICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Users />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/shops"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Shops />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Products />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Categories />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Orders />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/deliveries"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Deliveries />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/coupons"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Coupons />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Reviews />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/commissions"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Commissions />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <RoleRoute
              allowedRoles={[
                "Administrateur",
              ]}
            >
              <Notifications />
            </RoleRoute>
          }
        />


        {/* =========================
            VENDEUR
        ========================= */}

        <Route
          path="/vendeur"
          element={
            <RoleRoute
              allowedRoles={["Vendeur"]}
            >
              <VendeurDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/vendeur/shop"
          element={
            <RoleRoute
              allowedRoles={["Vendeur"]}
            >
              <MyShop />
            </RoleRoute>
          }
        />

        <Route
          path="/vendeur/products"
          element={
            <RoleRoute
              allowedRoles={["Vendeur"]}
            >
              <VendeurProducts />
            </RoleRoute>
          }
        />

        <Route
          path="/vendeur/orders"
          element={
            <RoleRoute
              allowedRoles={["Vendeur"]}
            >
              <VendeurOrders />
            </RoleRoute>
          }
        />


        {/* =========================
            CLIENT
        ========================= */}

        <Route
          path="/client"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <ClientDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/client/products"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <ClientProducts />
            </RoleRoute>
          }
        />

        <Route
          path="/client/products/:id"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <ProductDetails />
            </RoleRoute>
          }
        />

        <Route
          path="/client/cart"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <Cart />
            </RoleRoute>
          }
        />

        {/* CHECKOUT */}
        <Route
          path="/client/checkout"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <Checkout />
            </RoleRoute>
          }
        />

        <Route
          path="/client/orders"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <ClientOrders />
            </RoleRoute>
          }
        />

        <Route
          path="/client/favorites"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <Favorites />
            </RoleRoute>
          }
        />

        <Route
          path="/client/addresses"
          element={
            <RoleRoute
              allowedRoles={["Client"]}
            >
              <Addresses />
            </RoleRoute>
          }
        />


        {/* =========================
            LIVREUR
        ========================= */}

        <Route
          path="/livreur"
          element={
            <RoleRoute
              allowedRoles={["Livreur"]}
            >
              <LivreurDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/livreur/deliveries"
          element={
            <RoleRoute
              allowedRoles={["Livreur"]}
            >
              <LivreurDeliveries />
            </RoleRoute>
          }
        />


        {/* =========================
            REDIRECTIONS
        ========================= */}

        <Route
          path="/"
          element={<HomeRedirect />}
        />

        <Route
          path="*"
          element={<HomeRedirect />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

