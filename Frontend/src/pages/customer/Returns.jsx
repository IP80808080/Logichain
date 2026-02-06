import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  RotateCcw,
  Plus,
  X,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  RefreshCw,
  FileText,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { returnService, orderService } from "../../services/api";

function Returns() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    orderId: "",
    reason: "",
    description: "",
  });

  useEffect(() => {
    fetchData();

    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing returns...");
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        toast.error("Please login to view returns", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      console.log("📥 Fetching returns data...");

      // Fetch customer orders - both DELIVERED and SHIPPED can be returned
      const ordersResponse = await orderService.getByCustomer(user.id);
      const allOrders = ordersResponse.data.data || ordersResponse.data || [];

      const eligibleOrders = allOrders.filter(
        (order) =>
          order.orderStatus === "DELIVERED" || order.orderStatus === "SHIPPED",
      );
      setOrders(eligibleOrders);
      console.log("📦 Eligible orders for return:", eligibleOrders.length);

      // Fetch all returns
      try {
        const returnsResponse = await returnService.getAll();
        const allReturns =
          returnsResponse.data.data || returnsResponse.data || [];

        // Filter returns for this customer's orders
        const customerOrderIds = allOrders.map((o) => o.id);
        const customerReturns = allReturns.filter((r) =>
          customerOrderIds.includes(r.orderId),
        );

        // Sort by date (newest first)
        customerReturns.sort(
          (a, b) =>
            new Date(b.requestedAt || b.createdAt) -
            new Date(a.requestedAt || a.createdAt),
        );

        setReturns(customerReturns);
        console.log("✅ Loaded returns:", customerReturns.length);

        if (!showLoader) {
          console.log("🔄 Silent refresh completed");
        }
      } catch (error) {
        console.log("No returns found:", error);
        setReturns([]);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      if (showLoader) {
        toast.error("Failed to load returns data", {
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
    toast.info("Refreshing returns status...", {
      position: "top-right",
      autoClose: 2000,
    });
    fetchData(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.orderId || !formData.reason || !formData.description) {
      toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (formData.description.length < 10) {
      toast.error("Description must be at least 10 characters", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);

      // Find the order
      const selectedOrder = orders.find(
        (o) => o.id === parseInt(formData.orderId),
      );

      if (!selectedOrder) {
        toast.error("Selected order not found", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Generate unique return number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const returnNumber = `RET-${timestamp}-${random}`;

      const returnPayload = {
        orderId: parseInt(formData.orderId),
        returnNumber: returnNumber,
        returnStatus: "REQUESTED",
        reason: formData.description,
        refundAmount: parseFloat(selectedOrder.totalAmount),
      };

      console.log("📤 Submitting return:", returnPayload);

      const response = await returnService.create(returnPayload);

      if (response.data.success || response.data) {
        toast.success("Return request submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Reset form and close modal
        setFormData({
          orderId: "",
          reason: "",
          description: "",
        });
        setShowCreateModal(false);

        // Refresh to show new return
        await fetchData(false);
      }
    } catch (error) {
      console.error("❌ Error creating return:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit return request. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Check if order has an ACTIVE return (not rejected or refunded)
  const hasActiveReturn = (orderId) => {
    return returns.some(
      (r) =>
        r.orderId === orderId &&
        r.returnStatus !== "REJECTED" &&
        r.returnStatus !== "REFUNDED",
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "REQUESTED":
        return Clock;
      case "APPROVED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      case "RECEIVED":
        return Package;
      case "REFUNDED":
        return DollarSign;
      default:
        return RotateCcw;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: "bg-yellow-100 text-yellow-700 border-yellow-300",
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
      RECEIVED: "bg-blue-100 text-blue-700 border-blue-300",
      REFUNDED: "bg-green-100 text-green-700 border-green-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusMessage = (returnItem) => {
    const messages = {
      REQUESTED:
        "⏳ Your return request is pending review by customer support.",
      APPROVED:
        "✓ Your return has been approved! Ship the item back to receive your refund.",
      REJECTED: "✗ Your return request was not approved.",
      RECEIVED:
        "📦 We have received your returned item and are processing your refund.",
      REFUNDED: "✓ Your refund has been processed successfully!",
    };

    let message = messages[returnItem.returnStatus] || "Return in progress";

    // Add processing notes if available
    if (returnItem.processingNotes) {
      message += `\n\nNote: ${returnItem.processingNotes}`;
    }

    return message;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderNumber = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    return order?.orderNumber || `#${orderId}`;
  };

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading returns...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Returns</h1>
            <p className="text-gray-600">
              Track and manage your return requests
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              Request Return
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{returns.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {returns.filter((r) => r.returnStatus === "REQUESTED").length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {returns.filter((r) => r.returnStatus === "APPROVED").length}
            </p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {returns.filter((r) => r.returnStatus === "REJECTED").length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {returns.filter((r) => r.returnStatus === "REFUNDED").length}
            </p>
            <p className="text-sm text-gray-600">Refunded</p>
          </div>
        </div>

        {/* Returns List */}
        <div className="bg-white rounded-lg shadow">
          {returns.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Returns Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't requested any returns
              </p>
              {orders.length > 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Request Your First Return
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {returns.map((returnItem) => {
                const StatusIcon = getStatusIcon(returnItem.returnStatus);

                return (
                  <div
                    key={returnItem.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <RotateCcw className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {returnItem.returnNumber}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Order: {getOrderNumber(returnItem.orderId)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            Requested{" "}
                            {formatDate(
                              returnItem.requestedAt || returnItem.createdAt,
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(returnItem.returnStatus)}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {returnItem.returnStatus}
                      </span>
                    </div>

                    {/* Status Message */}
                    <div
                      className={`p-4 rounded-lg border-2 mb-4 ${getStatusColor(returnItem.returnStatus)}`}
                    >
                      <p className="text-sm font-medium whitespace-pre-line">
                        {getStatusMessage(returnItem)}
                      </p>
                      {returnItem.processedAt && (
                        <p className="text-xs mt-2 opacity-75">
                          Processed on {formatDate(returnItem.processedAt)}
                        </p>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Return Reason
                          </span>
                        </div>
                        <p className="text-gray-900 text-sm">
                          {returnItem.reason}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Refund Amount
                          </span>
                        </div>
                        <p className="text-gray-900 text-lg font-bold">
                          ${parseFloat(returnItem.refundAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>
                          Last updated:{" "}
                          {formatDate(
                            returnItem.updatedAt || returnItem.createdAt,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Return Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Request Return
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Submit a return request for your order
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ orderId: "", reason: "", description: "" });
                  }}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Order *
                  </label>
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Choose an order to return</option>
                    {orders.map((order) => {
                      const alreadyHasReturn = hasActiveReturn(order.id);
                      return (
                        <option
                          key={order.id}
                          value={order.id}
                          disabled={alreadyHasReturn}
                        >
                          {order.orderNumber || `Order #${order.id}`} - $
                          {parseFloat(order.totalAmount).toFixed(2)}
                          {alreadyHasReturn ? " (Return in progress)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {orders.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      No eligible orders. Orders must be delivered or shipped.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason Category *
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select a reason</option>
                    <option value="DEFECTIVE">Defective or Damaged</option>
                    <option value="WRONG_ITEM">Wrong Item</option>
                    <option value="NOT_AS_DESCRIBED">Not as Described</option>
                    <option value="SIZE_ISSUE">Size/Fit Issue</option>
                    <option value="QUALITY_ISSUE">Poor Quality</option>
                    <option value="CHANGED_MIND">Changed Mind</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description * (Min 10 characters)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    rows="5"
                    minLength="10"
                    maxLength="500"
                    placeholder="Please explain why you're returning this item..."
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Returns reviewed within 24-48 hours</li>
                        <li>Can submit new request if rejected</li>
                        <li>Refund processed after item received</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ orderId: "", reason: "", description: "" });
                    }}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      orders.length === 0 ||
                      formData.description.length < 10
                    }
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Return Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Returns;
