import {
  BarChart3,
  BoxIcon,
  ChartArea,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  RotateCcw,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

function DashboardLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navigation = {
    ADMIN: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Users", icon: Users, href: "/users" },
      { name: "Products", icon: Package, href: "/admin-products" },
      { name: "Warehouses", icon: Warehouse, href: "/admin-warehouses" },
      { name: "Orders", icon: ShoppingCart, href: "/admin-orders" },
      { name: "Inventory", icon: BoxIcon, href: "/inventory-overview" },
      { name: "Carriers", icon: Truck, href: "/carriers" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Logs", icon: ChartArea, href: "/logs" },
    ],
    WAREHOUSE_MANAGER: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Inventory", icon: BoxIcon, href: "/inventory" },
      { name: "Warehouses", icon: Warehouse, href: "/warehouses" },
      { name: "Orders", icon: ShoppingCart, href: "/orders" },
      { name: "Shipments", icon: Truck, href: "/shipments" },
      { name: "Products", icon: Package, href: "/ware-products" },
    ],
    CUSTOMER_SUPPORT: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "All Orders", icon: ShoppingCart, href: "/all-orders" },
      { name: "Returns", icon: RotateCcw, href: "/returns" },
      { name: "Customers", icon: Users, href: "/customers" },
      { name: "Tracking", icon: Eye, href: "/tracking" },
      { name: "Notifications", icon: MessageSquare, href: "/notifications" },
    ],
    CUSTOMER: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "New Order", icon: Plus, href: "/new-order" },
      { name: "My Orders", icon: ShoppingCart, href: "/my-orders" },
      { name: "Returns", icon: RotateCcw, href: "/my-returns" },
    ],
    PRODUCT_MANAGER: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Products", icon: Package, href: "/products" },
    ],
  };

  const menuItems = navigation[role] || navigation.CUSTOMER;

  const isActivePath = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden
      bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-30 h-full w-64 backdrop-blur-md bg-white/80 shadow-lg transform transition-transform duration-200 border-r border-white/20
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LogiChain
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = isActivePath(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200
          ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-1 ring-white/30"
              : "text-gray-800 hover:bg-white/60 hover:text-blue-700"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        `}
              >
                <item.icon
                  className={`h-5 w-5 mr-3 transition-colors
            ${
              isActive
                ? "text-white"
                : "text-gray-500 group-hover:text-blue-600"
            }
          `}
                />

                <span
                  className={`font-medium tracking-wide
            ${isActive ? "text-white drop-shadow-sm" : "text-gray-800"}
          `}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/20">
          {/* Profile */}
          <Link
            to="/profile"
            className={`group flex items-center px-4 py-3 w-full rounded-lg mb-2 transition-all duration-200
      ${
        isActivePath("/profile")
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-1 ring-white/30"
          : "text-gray-800 hover:bg-white/60 hover:text-blue-700"
      }
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
    `}
          >
            <Settings
              className={`h-5 w-5 mr-3 transition-colors
        ${
          isActivePath("/profile")
            ? "text-white"
            : "text-gray-500 group-hover:text-blue-600"
        }
      `}
            />
            <span
              className={`font-medium tracking-wide
        ${
          isActivePath("/profile")
            ? "text-white drop-shadow-sm"
            : "text-gray-800"
        }
      `}
            >
              Profile
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex items-center px-4 py-3 w-full rounded-lg transition-all duration-200
      text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
    "
          >
            <LogOut className="h-5 w-5 mr-3 text-red-500 group-hover:text-red-600" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navbar */}
        <header className="backdrop-blur-md bg-white/80 shadow-sm sticky top-0 z-10 border-b border-white/20">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {role[0]}
                </div>
                <span className="text-sm font-medium hidden sm:block text-black">
                  {role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
