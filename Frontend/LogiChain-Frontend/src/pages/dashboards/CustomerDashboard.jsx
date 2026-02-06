import {
  CheckCircle,
  Package,
  RotateCcw,
  Truck,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, returnService } from "../../services/api";
import { toast } from "react-toastify";

function CustomerDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeShipments: 0,
    pendingReturns: 0,
    approvedReturns: 0,
    rejectedReturns: 0,
    delivered: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        console.error("No user found in localStorage");
        toast.error("Please login again", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      // Fetch customer orders
      const ordersRes = await orderService.getByCustomer(user.id);
      const orders = ordersRes.data.data || [];

      // Calculate order stats
      const totalOrders = orders.length;
      const delivered = orders.filter(
        (o) => o.orderStatus === "DELIVERED",
      ).length;
      const activeShipments = orders.filter(
        (o) => o.orderStatus === "SHIPPED" || o.orderStatus === "PROCESSING",
      ).length;

      // Fetch returns
      let pendingReturns = 0;
      let approvedReturns = 0;
      let rejectedReturns = 0;
      let customerReturns = [];

      try {
        const returnsRes = await returnService.getAll();
        const allReturns = returnsRes.data.data || [];

        // Filter returns for this customer's orders
        const customerOrderIds = orders.map((o) => o.id);
        customerReturns = allReturns.filter((r) =>
          customerOrderIds.includes(r.orderId),
        );

        // Count by status
        pendingReturns = customerReturns.filter(
          (r) => r.returnStatus === "REQUESTED",
        ).length;
        approvedReturns = customerReturns.filter(
          (r) =>
            r.returnStatus === "APPROVED" ||
            r.returnStatus === "RECEIVED" ||
            r.returnStatus === "REFUNDED",
        ).length;
        rejectedReturns = customerReturns.filter(
          (r) => r.returnStatus === "REJECTED",
        ).length;
      } catch (error) {
        console.log("Returns not available:", error);
      }

      setStats({
        totalOrders,
        activeShipments,
        pendingReturns,
        approvedReturns,
        rejectedReturns,
        delivered,
      });

      // Get recent orders (last 3)
      const recent = orders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 3);
      setRecentOrders(recent);

      // Get recent returns (last 3)
      const recentRet = customerReturns
        .sort(
          (a, b) =>
            new Date(b.requestedAt || b.createdAt) -
            new Date(a.requestedAt || a.createdAt),
        )
        .slice(0, 3);
      setRecentReturns(recentRet);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-blue-100 text-blue-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getReturnStatusColor = (status) => {
    const colors = {
      REQUESTED: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      RECEIVED: "bg-blue-100 text-blue-700",
      REFUNDED: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getOrderNumber = (orderId) => {
    const order = recentOrders.find((o) => o.id === orderId);
    return order?.orderNumber || `#${orderId}`;
  };

  const statsData = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: Package,
      color: "bg-blue-500",
      onClick: () => navigate("/my-orders"),
    },
    {
      title: "Active Shipments",
      value: stats.activeShipments.toString(),
      icon: Truck,
      color: "bg-purple-500",
      onClick: () => navigate("/my-orders"),
    },
    {
      title: "Pending Returns",
      value: stats.pendingReturns.toString(),
      icon: RotateCcw,
      color: "bg-orange-500",
      onClick: () => navigate("/my-returns"),
    },
    {
      title: "Delivered",
      value: stats.delivered.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
      onClick: () => navigate("/my-orders"),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">
          Track your orders, shipments, and returns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
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

      {/* Return Status Summary (if there are returns) */}
      {(stats.pendingReturns > 0 ||
        stats.approvedReturns > 0 ||
        stats.rejectedReturns > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow p-6 mb-6 border border-orange-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            Return Status Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingReturns}
                  </p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approvedReturns}
                  </p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rejectedReturns}
                  </p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Returns */}
      {recentReturns.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Returns</h2>
            <button
              onClick={() => navigate("/my-returns")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentReturns.map((returnItem) => (
              <div
                key={returnItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate("/my-returns")}
              >
                <div className="flex items-center gap-4">
                  <RotateCcw className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Return for {getOrderNumber(returnItem.orderId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${parseFloat(returnItem.refundAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getReturnStatusColor(returnItem.returnStatus)}`}
                >
                  {returnItem.returnStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate("/my-orders")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
            <button
              onClick={() => navigate("/new-order")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Place Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}
                  >
                    {order.orderStatus}
                  </span>
                  <button
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    Track
                  </button>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/new-order")}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
        >
          <Package className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-gray-900">New Order</h3>
          <p className="text-sm text-gray-600">Place a new order</p>
        </button>

        <button
          onClick={() => navigate("/my-orders")}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
        >
          <Truck className="h-10 w-10 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-gray-900">Track Orders</h3>
          <p className="text-sm text-gray-600">Track your shipments</p>
        </button>

        <button
          onClick={() => navigate("/my-returns")}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
        >
          <RotateCcw className="h-10 w-10 text-orange-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-gray-900">Returns</h3>
          <p className="text-sm text-gray-600">Manage return requests</p>
        </button>
      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
