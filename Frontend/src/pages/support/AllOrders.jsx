import { useState, useEffect } from "react";
import { ShoppingCart, Search, Filter, Eye, Package, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService } from "../../services/api";
import { toast } from "react-toastify";

function AllOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setOrderToUpdate(null);
    setNewStatus("");
  };

  const updateStatus = async () => {
    if (!orderToUpdate || !newStatus) return;

    try {
      setUpdating(true);
      await orderService.updateStatus(orderToUpdate.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();

      if (selectedOrder && selectedOrder.id === orderToUpdate.id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }

      closeStatusModal();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
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

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const orderNum = order.orderNumber?.toLowerCase() || "";
    const username = order.customer?.username?.toLowerCase() || "";
    const email = order.customer?.email?.toLowerCase() || "";

    const matchesSearch =
      orderNum.includes(term) ||
      username.includes(term) ||
      email.includes(term);

    const matchesFilter =
      filterStatus === "All" || order.orderStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    All: orders.length,
    PENDING: orders.filter((o) => o.orderStatus === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
    PROCESSING: orders.filter((o) => o.orderStatus === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.orderStatus === "CANCELLED").length,
  };

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER_SUPPORT">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER_SUPPORT">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Orders</h1>
          <p className="text-gray-600">
            View and update order status for all customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(statusCounts).map(([key, count]) => (
            <div
              key={key}
              className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4"
            >
              <p className="text-xs text-gray-600 mb-1 capitalize">
                {key.toLowerCase()}
              </p>
              <p
                className={`text-2xl font-bold ${
                  key === "All"
                    ? "text-gray-900"
                    : getStatusColor(key).split(" ")[1]
                }`}
              >
                {count}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
          {filteredOrders.length === 0 ? (
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
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-900">
                          {order.customer?.username || "Guest/Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer?.email || "No Email"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">
                          {order.customer?.phone || "N/A"}
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
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {order.items?.length || 0} items
                        </span>
                      </div>

                      <div className="font-bold text-gray-900">
                        Total: ${parseFloat(order.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>

                    <button
                      onClick={() => openStatusModal(order)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && orderToUpdate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Update Order Status
                </h2>
                <button
                  onClick={closeStatusModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Order Number</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {orderToUpdate.orderNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      orderToUpdate.orderStatus,
                    )}`}
                  >
                    {orderToUpdate.orderStatus}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeStatusModal}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-gray-200 text-white rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateStatus}
                    disabled={
                      updating || newStatus === orderToUpdate.orderStatus
                    }
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.customer?.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.customer?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedOrder.orderStatus,
                      )}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.orderDate
                        ? new Date(selectedOrder.orderDate).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Billing Address</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.billingAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-gray-900 text-xl">
                      ${parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => alert("Mailto or Call logic here")}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700"
                  >
                    Contact Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AllOrders;
