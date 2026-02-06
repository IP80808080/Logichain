import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import WarehouseDashboard from "./pages/dashboards/WarehouseDashboard";
import SupportDashboard from "./pages/dashboards/SupportDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import ProductDashboard from "./pages/dashboards/ProductDashboard";
import Profile from "./components/Profile";

// Customer Pages
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import TrackShipment from "./pages/customer/TrackShipment";
import Returns from "./pages/customer/Returns";
import NewOrder from "./pages/customer/NewOrder";

// Warehouse Manager Pages
import InventoryManagement from "./pages/warehouse/InventoryManagement";
import WarehouseList from "./pages/warehouse/WarehouseList";
import OrdersManagement from "./pages/warehouse/OrdersManagement";
import ShipmentsManagement from "./pages/warehouse/ShipmentsManagement";
import WProductsManagement from "./pages/warehouse/WProductsManagement";

// Customer Support Pages
import AllOrders from "./pages/support/AllOrders";
import ReturnsManagement from "./pages/support/ReturnsManagement";
import CustomersView from "./pages/support/CustomersView";
import OrderTracking from "./pages/support/OrderTracking";
import Notifications from "./pages/support/Notifications";

//Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import AllOrdersAdmin from "./pages/admin/AllOrdersAdmin";
import AnalyticsReports from "./pages/admin/AnalyticsReports";
import CarriersManagement from "./pages/admin/CarriersManagement";
import InventoryOverview from "./pages/admin/InventoryOverview";
import ProductManagement from "./pages/admin/ProductManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import WarehouseManagement from "./pages/admin/WarehouseManagement";

//Product Manager
import ProductsManagement from "./pages/productmanager/ProductsManagement";

import NotFound from "./components/NotFound";
import Logs from "./pages/admin/Logs";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Dashboard Routes - Role-based */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile - All Roles */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}

          <Route
            path="/new-order"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <NewOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <TrackShipment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-returns"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <Returns />
              </ProtectedRoute>
            }
          />

          {/* Warehouse Manager Routes */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE_MANAGER", "ADMIN"]}>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE_MANAGER", "ADMIN"]}>
                <WarehouseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "WAREHOUSE_MANAGER",
                  "ADMIN",
                  "CUSTOMER_SUPPORT",
                ]}
              >
                <OrdersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE_MANAGER", "ADMIN"]}>
                <ShipmentsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ware-products"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE_MANAGER", "ADMIN"]}>
                <WProductsManagement />
              </ProtectedRoute>
            }
          />

          {/* Customer Support Routes */}
          <Route
            path="/all-orders"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER_SUPPORT", "ADMIN"]}>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER_SUPPORT", "ADMIN"]}>
                <ReturnsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER_SUPPORT", "ADMIN"]}>
                <CustomersView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER_SUPPORT", "ADMIN"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER_SUPPORT", "ADMIN"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* ADMIN Routes */}

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-products"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-warehouses"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <WarehouseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-orders"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AllOrdersAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory-overview"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <InventoryOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carriers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CarriersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AnalyticsReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Logs />
              </ProtectedRoute>
            }
          />

          {/* Product Manager */}
          <Route
            path="/products"
            element={
              <ProtectedRoute
                allowedRoles={["PRODUCT_MANAGER", "ADMIN", "WAREHOUSE_MANAGER"]}
              >
                <ProductsManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

// Helper component to render dashboard based on role
function RoleBasedDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "WAREHOUSE_MANAGER":
      return <WarehouseDashboard />;
    case "CUSTOMER_SUPPORT":
      return <SupportDashboard />;
    case "CUSTOMER":
      return <CustomerDashboard />;
    case "PRODUCT_MANAGER":
      return <ProductDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}

export default App;
