import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  ArrowLeft,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, shipmentService } from "../../services/api";

function TrackShipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTrackingData();
    }
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // Fetch order details
      const orderResponse = await orderService.getById(id);
      const orderData = orderResponse.data.data || orderResponse.data;
      setOrder(orderData);

      // Try to fetch shipment data
      try {
        const shipmentsResponse = await shipmentService.getAll();
        const allShipments =
          shipmentsResponse.data.data || shipmentsResponse.data || [];

        // Find shipment for this order
        const orderShipment = allShipments.find(
          (s) => s.orderId === parseInt(id),
        );

        if (orderShipment) {
          setShipment(orderShipment);
        }
      } catch (shipmentError) {
        console.log("No shipment data available:", shipmentError);
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      toast.error("Failed to load tracking information", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getShipmentStatus = () => {
    if (!shipment) {
      // Fallback to order status
      switch (order?.orderStatus) {
        case "PENDING":
          return "Order Pending";
        case "PROCESSING":
          return "Processing";
        case "SHIPPED":
          return "In Transit";
        case "DELIVERED":
          return "Delivered";
        default:
          return "Unknown";
      }
    }
    return shipment.shipmentStatus || "In Transit";
  };

  const getTrackingTimeline = () => {
    const timeline = [];

    if (order) {
      timeline.push({
        title: "Order Placed",
        date: order.orderDate || order.createdAt,
        completed: true,
        icon: Package,
      });

      timeline.push({
        title: "Order Confirmed",
        date: order.orderDate || order.createdAt,
        completed: true,
        icon: CheckCircle,
      });
    }

    if (shipment) {
      timeline.push({
        title: "Picked Up",
        date: shipment.shippedDate || shipment.createdAt,
        completed: shipment.shipmentStatus !== "PENDING",
        icon: Truck,
      });

      timeline.push({
        title: "In Transit",
        date: shipment.updatedAt,
        completed:
          shipment.shipmentStatus === "IN_TRANSIT" ||
          shipment.shipmentStatus === "OUT_FOR_DELIVERY" ||
          shipment.shipmentStatus === "DELIVERED",
        icon: Truck,
      });

      timeline.push({
        title: "Out for Delivery",
        date: shipment.updatedAt,
        completed:
          shipment.shipmentStatus === "OUT_FOR_DELIVERY" ||
          shipment.shipmentStatus === "DELIVERED",
        icon: Truck,
      });

      timeline.push({
        title: "Delivered",
        date: shipment.deliveredDate,
        completed: shipment.shipmentStatus === "DELIVERED",
        icon: CheckCircle,
      });
    } else {
      // Fallback timeline based on order status
      timeline.push({
        title: "Shipped",
        date: order?.updatedAt,
        completed:
          order?.orderStatus === "SHIPPED" ||
          order?.orderStatus === "DELIVERED",
        icon: Truck,
      });

      timeline.push({
        title: "Delivered",
        date: order?.updatedAt,
        completed: order?.orderStatus === "DELIVERED",
        icon: CheckCircle,
      });
    }

    return timeline;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
            <p className="text-gray-600">Loading tracking information...</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Track Shipment</h1>
          <p className="text-gray-600 mt-1">
            Order {order.orderNumber || `#${order.id}`}
          </p>
        </div>

        {/* Shipment Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Shipment Status
              </h2>
              <p className="text-gray-600">Current location and status</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {getShipmentStatus()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Carrier</p>
                <p className="text-lg font-semibold text-gray-900">
                  {shipment?.carrier?.name || "Standard Shipping"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {shipment?.trackingNumber || "Pending"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Est. Delivery</p>
                <p className="text-lg font-semibold text-gray-900">
                  {shipment?.estimatedDeliveryDate
                    ? new Date(
                        shipment.estimatedDeliveryDate,
                      ).toLocaleDateString()
                    : "Calculating..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Location */}
        {shipment?.currentLocation && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Current Location
                </h3>
                <p className="text-gray-700">{shipment.currentLocation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Tracking Timeline
          </h2>
          <div className="space-y-6">
            {getTrackingTimeline().map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`p-2 rounded-full ${
                      event.completed
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <event.icon
                      className={`h-5 w-5 ${
                        event.completed ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  {index < getTrackingTimeline().length - 1 && (
                    <div
                      className={`w-0.5 h-16 ${
                        event.completed
                          ? "bg-gradient-to-b from-blue-600 to-purple-600"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4
                        className={`font-semibold ${
                          event.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {event.title}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          event.completed ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {formatDate(event.date)}
                      </p>
                    </div>
                    {event.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Delivery Address
          </h2>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <p className="text-gray-700">{order.shippingAddress || "N/A"}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TrackShipment;
