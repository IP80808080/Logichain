import { useState, useEffect } from "react";
import { Users, Package, Warehouse, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  userService,
  orderService,
  productService,
  warehouseService,
} from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalWarehouses: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [systemOverview, setSystemOverview] = useState({
    activeUsers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    activeShipments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, ordersRes, productsRes, warehousesRes] =
        await Promise.all([
          userService.getAll(),
          orderService.getAll(),
          productService.getAll(),
          warehouseService.getAll(),
        ]);

      // Extract data from ApiResponse wrapper
      const users = usersRes.data.data || [];
      const orders = ordersRes.data.data || [];
      const products = productsRes.data.data || [];
      const warehouses = warehousesRes.data.data || [];

      // Set stats
      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
      });

      // Get recent orders (last 3)
      const sortedOrders = orders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 3);
      setRecentOrders(sortedOrders);

      // Calculate system overview
      const activeUsers = users.filter(
        (u) =>
          u.approvalStatus === "APPROVED" ||
          u.role === "ADMIN" ||
          u.role === "CUSTOMER",
      ).length;
      const pendingOrders = orders.filter(
        (o) => o.orderStatus === "PENDING" || o.orderStatus === "PROCESSING",
      ).length;

      setSystemOverview({
        activeUsers,
        pendingOrders,
        lowStockItems: 0, // This would come from inventory service
        activeShipments: 0, // This would come from shipment service
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      textColor: "text-[#2B7FFF]",
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      textColor: "text-[#00C950]",
      color: "bg-green-500",
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      icon: TrendingUp,
      textColor: "text-[#AD46FF]",
      color: "bg-purple-500",
    },
    {
      title: "Warehouses",
      value: stats.totalWarehouses.toString(),
      icon: Warehouse,
      textColor: "text-[#FF6900]",
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of entire system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl text-black font-bold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-semibold text-black">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl text-black font-bold mb-4">System Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-green-600">
                {systemOverview.activeUsers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Orders</span>
              <span className="font-semibold text-yellow-600">
                {systemOverview.pendingOrders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-semibold text-red-600">
                {systemOverview.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Shipments</span>
              <span className="font-semibold text-blue-600">
                {systemOverview.activeShipments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
