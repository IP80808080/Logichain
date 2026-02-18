import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (!user) return null;

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "from-red-500 to-pink-500",
      WAREHOUSE_MANAGER: "from-blue-500 to-cyan-500",
      CUSTOMER_SUPPORT: "from-green-500 to-emerald-500",
      CUSTOMER: "from-purple-500 to-indigo-500",
    };
    return colors[role] || "from-gray-500 to-gray-600";
  };

  const stats = [
    {
      title: "Orders",
      value: "1,234",
      icon: "📦",
      color: "from-blue-500 to-cyan-500",
      show: true,
    },
    {
      title: "Products",
      value: "567",
      icon: "🏷️",
      color: "from-purple-500 to-pink-500",
      show: true,
    },
    {
      title: "Inventory",
      value: "8,901",
      icon: "📊",
      color: "from-green-500 to-emerald-500",
      show: ["ADMIN", "WAREHOUSE_MANAGER"].includes(user.role),
    },
    {
      title: "Shipments",
      value: "234",
      icon: "🚚",
      color: "from-orange-500 to-red-500",
      show: true,
    },
  ];

  const quickActions = [
    {
      title: "New Order",
      icon: "➕",
      color: "from-blue-500 to-cyan-500",
      show: true,
    },
    {
      title: "Track Shipment",
      icon: "🔍",
      color: "from-purple-500 to-pink-500",
      show: true,
    },
    {
      title: "Manage Inventory",
      icon: "📦",
      color: "from-green-500 to-emerald-500",
      show: ["ADMIN", "WAREHOUSE_MANAGER"].includes(user.role),
    },
    {
      title: "View Reports",
      icon: "📈",
      color: "from-orange-500 to-red-500",
      show: ["ADMIN", "WAREHOUSE_MANAGER", "CUSTOMER_SUPPORT"].includes(
        user.role,
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Floating Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 glass-card flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">LogicChain</h1>
                <p className="text-xs text-gray-600">Supply Chain Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}
                >
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-glass-danger flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split("@")[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your logistics today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats
            .filter((stat) => stat.show)
            .map((stat, index) => (
              <div key={index} className="stat-card-glass">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}
                ></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{stat.icon}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions
              .filter((action) => action.show)
              .map((action, index) => (
                <button
                  key={index}
                  className="glass-card-hover p-6 text-center"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-3xl`}
                  >
                    {action.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {action.title}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-4 glass-card">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                  {item}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Order #{1000 + item} has been shipped
                  </p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
                <div className="text-green-600 font-medium">✓ Complete</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
