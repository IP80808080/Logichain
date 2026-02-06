import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService } from "../../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      const orderData = response.data.data || response.data;
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details", {
        position: "top-right",
        autoClose: 4000,
      });
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      PROCESSING: "bg-purple-100 text-purple-700 border-purple-300",
      SHIPPED: "bg-blue-100 text-blue-700 border-blue-300",
      DELIVERED: "bg-green-100 text-green-700 border-green-300",
      CANCELLED: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      case "PROCESSING":
        return <Package className="h-5 w-5" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5" />;
      case "CANCELLED":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Order Not Found
            </h3>
            <button
              onClick={() => navigate("/my-orders")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order {order.orderNumber || `#${order.id}`}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.orderDate || order.createdAt)}
              </p>
            </div>
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(order.orderStatus)}`}
            >
              {getStatusIcon(order.orderStatus)}
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  ${parseFloat(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(order.orderDate || order.createdAt).split(",")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Shipping Address
          </h2>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <p className="text-gray-700">{order.shippingAddress || "N/A"}</p>
          </div>
        </div>

        {/* Order Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="divide-y divide-gray-200">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.productName || `Product #${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(item.price || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Subtotal: $
                      {(
                        parseFloat(item.price || 0) * (item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${parseFloat(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {(order.orderStatus === "SHIPPED" ||
            order.orderStatus === "PROCESSING") && (
            <button
              onClick={() => navigate(`/track/${order.id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Truck className="h-5 w-5" />
              Track Shipment
            </button>
          )}
          {order.orderStatus === "DELIVERED" && (
            <button
              onClick={() => navigate("/my-returns")}
              className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Request Return
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default OrderDetails;
