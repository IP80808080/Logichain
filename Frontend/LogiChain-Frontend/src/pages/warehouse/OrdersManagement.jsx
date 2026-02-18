import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService } from "../../services/api";
import { toast } from "react-toastify";

function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-700";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      case "REFUNDED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || order.orderStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    PENDING: orders.filter((o) => o.orderStatus === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
    PROCESSING: orders.filter((o) => o.orderStatus === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.orderStatus === "DELIVERED").length,
  };

  return (
    <DashboardLayout role="WAREHOUSE_MANAGER">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600">Process and fulfill customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statusCounts.PENDING}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statusCounts.CONFIRMED}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {statusCounts.PROCESSING}
                </p>
              </div>
              <div className="bg-indigo-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Shipped</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statusCounts.SHIPPED}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-600">
                  {statusCounts.DELIVERED}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 text-black pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-900">
                          {order.customer?.username || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">
                          {order.customer?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-900">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <div className="font-bold text-gray-900">
                        Total: ${parseFloat(order.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {order.orderStatus === "PENDING" && (
                      <button
                        onClick={() => updateStatus(order.id, "CONFIRMED")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.orderStatus === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(order.id, "PROCESSING")}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                        Start Processing
                      </button>
                    )}
                    {order.orderStatus === "PROCESSING" && (
                      <button
                        onClick={() => updateStatus(order.id, "SHIPPED")}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.orderStatus === "SHIPPED" && (
                      <button
                        onClick={() => updateStatus(order.id, "DELIVERED")}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {order.orderStatus === "DELIVERED" && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-center font-semibold">
                        ✓ Completed
                      </div>
                    )}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {order.orderStatus !== "SHIPPED" &&
                      order.orderStatus !== "DELIVERED" &&
                      order.orderStatus !== "CANCELLED" && (
                        <button
                          onClick={() => updateStatus(order.id, "CANCELLED")}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Details: {selectedOrder.orderNumber}
              </h2>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </h3>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                    >
                      Payment: {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-black">
                      <strong>Name:</strong>{" "}
                      {selectedOrder.customer?.username || "N/A"}
                    </p>
                    <p className="text-sm text-black">
                      <strong>Email:</strong>{" "}
                      {selectedOrder.customer?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-black whitespace-pre-line">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Billing Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-black whitespace-pre-line">
                      {selectedOrder.billingAddress}
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Total Amount
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ${parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Order Date
                  </h3>
                  <p className="text-sm text-black">
                    {selectedOrder.orderDate
                      ? new Date(selectedOrder.orderDate).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default OrdersManagement;
