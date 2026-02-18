import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  Search,
  Eye,
  Truck,
  Filter,
  Calendar,
  DollarSign,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, returnService } from "../../services/api";

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchData();

    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing orders and returns...");
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        toast.error("Please login to view orders", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      console.log("📥 Fetching orders and returns...");

      // Fetch orders
      const ordersResponse = await orderService.getByCustomer(user.id);
      const ordersData = ordersResponse.data.data || ordersResponse.data || [];

      // Fetch returns
      let returnsData = [];
      try {
        const returnsResponse = await returnService.getAll();
        const allReturns = returnsResponse.data.data || [];

        // Filter returns for this customer's orders
        const customerOrderIds = ordersData.map((o) => o.id);
        returnsData = allReturns.filter((r) =>
          customerOrderIds.includes(r.orderId),
        );

        console.log("✅ Loaded returns:", returnsData.length);
      } catch (error) {
        console.log("No returns found:", error);
      }

      setReturns(returnsData);

      // Sort by date (newest first)
      const sortedOrders = ordersData.sort(
        (a, b) =>
          new Date(b.orderDate || b.createdAt) -
          new Date(a.orderDate || a.createdAt),
      );

      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);

      if (!showLoader) {
        console.log("🔄 Silent refresh completed");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      if (showLoader) {
        toast.error("Failed to load orders", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing order status...", {
      position: "top-right",
      autoClose: 2000,
    });
    fetchData(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id?.toString().includes(searchTerm),
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  // Get return info for an order
  const getOrderReturn = (orderId) => {
    return returns.find((r) => r.orderId === orderId);
  };

  // ✅ Check if can request new return
  const canRequestReturn = (order) => {
    const existingReturn = getOrderReturn(order.id);

    // Can't return if not delivered/shipped
    if (order.orderStatus !== "DELIVERED" && order.orderStatus !== "SHIPPED") {
      return false;
    }

    // No existing return
    if (!existingReturn) return true;

    // Can request if previous was rejected or refunded
    return (
      existingReturn.returnStatus === "REJECTED" ||
      existingReturn.returnStatus === "REFUNDED"
    );
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

  const getReturnStatusBadge = (returnItem) => {
    if (!returnItem) return null;

    const badges = {
      REQUESTED: {
        color: "bg-yellow-50 border-yellow-300 text-yellow-800",
        icon: Clock,
        text: "Return Pending",
      },
      APPROVED: {
        color: "bg-green-50 border-green-300 text-green-800",
        icon: CheckCircle,
        text: "Return Approved",
      },
      REJECTED: {
        color: "bg-red-50 border-red-300 text-red-800",
        icon: XCircle,
        text: "Return Rejected",
      },
      RECEIVED: {
        color: "bg-blue-50 border-blue-300 text-blue-800",
        icon: Package,
        text: "Return Received",
      },
      REFUNDED: {
        color: "bg-green-50 border-green-300 text-green-800",
        icon: CheckCircle,
        text: "Refunded",
      },
    };

    const badge = badges[returnItem.returnStatus] || {
      color: "bg-gray-50 border-gray-300 text-gray-800",
      icon: RotateCcw,
      text: "Return in Progress",
    };

    const Icon = badge.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg ${badge.color}`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold">{badge.text}</span>
      </div>
    );
  };

  const getReturnMessage = (returnItem) => {
    if (!returnItem) return null;

    const messages = {
      REQUESTED: {
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        text: "⏳ Your return request is pending review. You'll be notified when processed.",
      },
      APPROVED: {
        color: "bg-green-50 border-green-200 text-green-800",
        text: "✓ Return approved! Ship the item back to receive your refund.",
      },
      REJECTED: {
        color: "bg-red-50 border-red-200 text-red-800",
        text: "✗ Return request was not approved. You can submit a new request.",
      },
      RECEIVED: {
        color: "bg-blue-50 border-blue-200 text-blue-800",
        text: "📦 We received your return. Processing refund now.",
      },
      REFUNDED: {
        color: "bg-green-50 border-green-200 text-green-800",
        text: `✓ Refund of $${parseFloat(returnItem.refundAmount || 0).toFixed(2)} has been processed!`,
      },
    };

    const message = messages[returnItem.returnStatus];
    if (!message) return null;

    return (
      <div className={`mt-3 p-3 border rounded-lg ${message.color}`}>
        <p className="text-sm font-medium">{message.text}</p>
        {returnItem.processingNotes && (
          <p className="text-sm mt-2 opacity-90">
            Note: {returnItem.processingNotes}
          </p>
        )}
        {returnItem.processedAt && (
          <p className="text-xs mt-2 opacity-75">
            Processed {new Date(returnItem.processedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">
              View and track all your orders and returns
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "ALL"
                  ? "No orders found"
                  : "No orders yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your filters"
                  : "Start shopping to see your orders here"}
              </p>
              <button
                onClick={() => navigate("/new-order")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Place New Order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const orderReturn = getOrderReturn(order.id);

                return (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order {order.orderNumber || `#${order.id}`}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.orderDate || order.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />$
                              {parseFloat(order.totalAmount || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                        {orderReturn && getReturnStatusBadge(orderReturn)}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mb-4 text-sm text-gray-600">
                        <span className="font-medium">Ship to:</span>{" "}
                        {order.shippingAddress}
                      </div>
                    )}

                    {/* Return Message */}
                    {orderReturn && getReturnMessage(orderReturn)}

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {(order.orderStatus === "SHIPPED" ||
                        order.orderStatus === "PROCESSING") && (
                        <button
                          onClick={() => navigate(`/track/${order.id}`)}
                          className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                          <Truck className="h-4 w-4" />
                          Track Order
                        </button>
                      )}
                      {canRequestReturn(order) && (
                        <button
                          onClick={() => navigate("/my-returns")}
                          className="flex items-center gap-2 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {orderReturn?.returnStatus === "REJECTED" ||
                          orderReturn?.returnStatus === "REFUNDED"
                            ? "Request New Return"
                            : "Request Return"}
                        </button>
                      )}
                      {orderReturn && (
                        <button
                          onClick={() => navigate("/my-returns")}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                        >
                          <RotateCcw className="h-4 w-4" />
                          View Return
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredOrders.length}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    filteredOrders.filter((o) => o.orderStatus === "PENDING")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    filteredOrders.filter(
                      (o) =>
                        o.orderStatus === "SHIPPED" ||
                        o.orderStatus === "PROCESSING",
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredOrders.filter((o) => o.orderStatus === "DELIVERED")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {returns.length}
                </p>
                <p className="text-sm text-gray-600">Returns</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyOrders;
