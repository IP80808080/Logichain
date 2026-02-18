import { useState, useEffect } from "react";
import { Package, AlertTriangle, Truck, CheckCircle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  inventoryService,
  orderService,
  shipmentService,
} from "../../services/api";

function WarehouseDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    ordersToday: 0,
    shipments: 0,
    lowStock: 0,
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [inventoryRes, ordersRes, shipmentsRes] = await Promise.all([
        inventoryService.getAll(),
        orderService.getAll(),
        shipmentService.getAll(),
      ]);

      const inventory = inventoryRes.data.data || [];
      const orders = ordersRes.data.data || [];
      const shipments = shipmentsRes.data.data || [];

      // Calculate today's orders
      const today = new Date().toISOString().split("T")[0];
      const ordersToday = orders.filter((order) => {
        const orderDate = new Date(order.orderDate).toISOString().split("T")[0];
        return orderDate === today;
      }).length;

      // Get low stock items (quantity < 50)
      const lowStock = inventory.filter((item) => item.quantity < 50);

      // Get active shipments
      const activeShipments = shipments.filter(
        (s) =>
          s.shipmentStatus === "IN_TRANSIT" || s.shipmentStatus === "CREATED",
      ).length;

      setStats({
        totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
        ordersToday: ordersToday,
        shipments: activeShipments,
        lowStock: lowStock.length,
      });

      // Get pending orders (CONFIRMED or PROCESSING status)
      const pending = orders
        .filter(
          (o) =>
            o.orderStatus === "CONFIRMED" || o.orderStatus === "PROCESSING",
        )
        .slice(0, 3);
      setPendingOrders(pending);

      // Get top 3 low stock items
      setLowStockItems(lowStock.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (orderId) => {
    try {
      await orderService.updateStatus(orderId, "SHIPPED");
      alert("Order marked as shipped!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error shipping order:", error);
      alert("Failed to ship order");
    }
  };

  const statsConfig = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Orders Today",
      value: stats.ordersToday,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Shipments",
      value: stats.shipments,
      icon: Truck,
      color: "bg-purple-500",
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="WAREHOUSE_MANAGER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="WAREHOUSE_MANAGER">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Warehouse Dashboard
        </h1>
        <p className="text-gray-600">Manage inventory and shipments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Pending Shipments & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Shipments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Pending Shipments</h2>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No pending orders
              </p>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-semibold text-black">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer?.username || "Unknown Customer"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleShipOrder(order.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Ship Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No low stock items
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded"
                >
                  <div>
                    <p className="font-semibold text-black">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-black">
                      {item.quantity} units left
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      (window.location.href = "/warehouse/inventory")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WarehouseDashboard;
