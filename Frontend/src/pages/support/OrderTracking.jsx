import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, shipmentService } from "../../services/api";

function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await orderService.getAll();
      // Get the 3 most recent orders
      const recent = response.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setRecentOrders(recent);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter an order ID or tracking number");
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      // Try to fetch order by order number first
      const orderResponse = await orderService.getAll();
      const order = orderResponse.data.find(
        (o) => o.orderNumber.toUpperCase() === searchTerm.toUpperCase(),
      );

      if (order) {
        // Try to get shipment data
        try {
          const shipmentResponse = await shipmentService.getAll();
          const shipment = shipmentResponse.data.find(
            (s) => s.orderId === order.id,
          );

          if (shipment) {
            // Build tracking data from shipment
            const tracking = buildTrackingData(order, shipment);
            setTrackingData(tracking);
          } else {
            // No shipment found, create basic tracking from order
            const tracking = buildTrackingDataFromOrder(order);
            setTrackingData(tracking);
          }
        } catch (shipmentErr) {
          console.error("Error fetching shipment:", shipmentErr);
          // Fallback to order data only
          const tracking = buildTrackingDataFromOrder(order);
          setTrackingData(tracking);
        }
      } else {
        // Try to search by tracking number in shipments
        try {
          const shipmentResponse = await shipmentService.track(searchTerm);
          if (shipmentResponse.data) {
            const orderResponse = await orderService.getById(
              shipmentResponse.data.orderId,
            );
            const tracking = buildTrackingData(
              orderResponse.data,
              shipmentResponse.data,
            );
            setTrackingData(tracking);
          } else {
            setError(
              "Order not found. Please check the order ID or tracking number and try again.",
            );
          }
        } catch (trackErr) {
          setError(
            "Order not found. Please check the order ID or tracking number and try again.",
          );
        }
      }
    } catch (err) {
      console.error("Error searching for order:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buildTrackingData = (order, shipment) => {
    const timeline = buildTimeline(order, shipment);
    const progress = calculateProgress(shipment.status);

    return {
      orderId: order.orderNumber,
      customer: order.customerName || "Customer",
      trackingNumber: shipment.trackingNumber || "N/A",
      carrier: shipment.carrier?.name || "Standard Shipping",
      status: formatStatus(shipment.status),
      currentLocation: shipment.currentLocation || "Processing",
      destination: order.shippingAddress || "Destination",
      estimatedDelivery: shipment.estimatedDeliveryDate
        ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString()
        : "Calculating...",
      progress,
      timeline,
    };
  };

  const buildTrackingDataFromOrder = (order) => {
    const timeline = buildTimelineFromOrder(order);
    const progress = calculateProgressFromOrderStatus(order.status);

    return {
      orderId: order.orderNumber,
      customer: order.customerName || "Customer",
      trackingNumber: "Pending",
      carrier: "Standard Shipping",
      status: formatStatus(order.status),
      currentLocation: "Processing",
      destination: order.shippingAddress || "Destination",
      estimatedDelivery: order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
        : "Calculating...",
      progress,
      timeline,
    };
  };

  const buildTimeline = (order, shipment) => {
    const events = [];

    // Order Placed
    events.push({
      status: "Order Placed",
      date: new Date(order.createdAt).toLocaleString(),
      completed: true,
      location: "Online",
    });

    // Order Confirmed
    events.push({
      status: "Order Confirmed",
      date: new Date(order.createdAt).toLocaleString(),
      completed: true,
      location: shipment.originWarehouse || "Warehouse",
    });

    // Picked Up
    const pickedUp =
      shipment.status !== "PENDING" && shipment.status !== "PROCESSING";
    events.push({
      status: "Picked Up",
      date: shipment.shippedDate
        ? new Date(shipment.shippedDate).toLocaleString()
        : "Pending",
      completed: pickedUp,
      location: shipment.originWarehouse || "Warehouse",
    });

    // In Transit
    const inTransit =
      shipment.status === "IN_TRANSIT" ||
      shipment.status === "OUT_FOR_DELIVERY" ||
      shipment.status === "DELIVERED";
    events.push({
      status: "In Transit",
      date: inTransit
        ? new Date(shipment.updatedAt).toLocaleString()
        : "Pending",
      completed: inTransit,
      location: shipment.currentLocation || "Distribution Center",
    });

    // Out for Delivery
    const outForDelivery =
      shipment.status === "OUT_FOR_DELIVERY" || shipment.status === "DELIVERED";
    events.push({
      status: "Out for Delivery",
      date: outForDelivery
        ? new Date(shipment.updatedAt).toLocaleString()
        : "Pending",
      completed: outForDelivery,
      location: "Local Hub",
    });

    // Delivered
    const delivered = shipment.status === "DELIVERED";
    events.push({
      status: "Delivered",
      date: shipment.deliveredDate
        ? new Date(shipment.deliveredDate).toLocaleString()
        : "Pending",
      completed: delivered,
      location: order.shippingAddress || "Destination",
    });

    return events;
  };

  const buildTimelineFromOrder = (order) => {
    const events = [];

    events.push({
      status: "Order Placed",
      date: new Date(order.createdAt).toLocaleString(),
      completed: true,
      location: "Online",
    });

    events.push({
      status: "Order Confirmed",
      date: new Date(order.createdAt).toLocaleString(),
      completed: true,
      location: "Warehouse",
    });

    const processing = order.status !== "PENDING";
    events.push({
      status: "Picked Up",
      date: processing ? new Date(order.updatedAt).toLocaleString() : "Pending",
      completed: processing,
      location: "Warehouse",
    });

    const shipped =
      order.status === "SHIPPED" ||
      order.status === "OUT_FOR_DELIVERY" ||
      order.status === "DELIVERED";
    events.push({
      status: "In Transit",
      date: shipped ? new Date(order.updatedAt).toLocaleString() : "Pending",
      completed: shipped,
      location: "Distribution Center",
    });

    const outForDelivery =
      order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED";
    events.push({
      status: "Out for Delivery",
      date: outForDelivery
        ? new Date(order.updatedAt).toLocaleString()
        : "Pending",
      completed: outForDelivery,
      location: "Local Hub",
    });

    const delivered = order.status === "DELIVERED";
    events.push({
      status: "Delivered",
      date: delivered ? new Date(order.updatedAt).toLocaleString() : "Pending",
      completed: delivered,
      location: order.shippingAddress || "Destination",
    });

    return events;
  };

  const calculateProgress = (status) => {
    switch (status) {
      case "PENDING":
        return 10;
      case "PROCESSING":
        return 20;
      case "PICKED_UP":
        return 40;
      case "IN_TRANSIT":
        return 60;
      case "OUT_FOR_DELIVERY":
        return 80;
      case "DELIVERED":
        return 100;
      default:
        return 0;
    }
  };

  const calculateProgressFromOrderStatus = (status) => {
    switch (status) {
      case "PENDING":
        return 10;
      case "PROCESSING":
        return 30;
      case "SHIPPED":
        return 60;
      case "OUT_FOR_DELIVERY":
        return 80;
      case "DELIVERED":
        return 100;
      default:
        return 0;
    }
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusColor = (status) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus.includes("DELIVERED")) return "text-green-600";
    if (upperStatus.includes("TRANSIT") || upperStatus.includes("SHIPPED"))
      return "text-blue-600";
    if (upperStatus.includes("DELIVERY")) return "text-purple-600";
    return "text-yellow-600";
  };

  const handleRecentOrderClick = (orderNumber) => {
    setSearchTerm(orderNumber);
    // Auto-search after setting the term
    setTimeout(() => {
      document.querySelector('button[type="button"]')?.click();
    }, 100);
  };

  return (
    <DashboardLayout role="CUSTOMER_SUPPORT">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Order Tracking
          </h1>
          <p className="text-gray-600">
            Help customers track their orders in real-time
          </p>
        </div>

        {/* Search */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Track Order</h2>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Order ID or Tracking Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </div>

          {/* Recent Orders Quick Access */}
          {recentOrders.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Recent orders:</p>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleRecentOrderClick(order.orderNumber)}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    {order.orderNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {trackingData.orderId}
                  </h2>
                  <p className="text-gray-600">
                    Customer: {trackingData.customer}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    trackingData.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : trackingData.status.includes("Transit") ||
                          trackingData.status === "Shipped"
                        ? "bg-blue-100 text-blue-700"
                        : trackingData.status.includes("Delivery")
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {trackingData.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Carrier</p>
                  <p className="font-bold text-gray-900">
                    {trackingData.carrier}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                  <p className="font-bold text-gray-900">
                    {trackingData.trackingNumber}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Current Location</p>
                  <p className="font-bold text-gray-900">
                    {trackingData.currentLocation}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Est. Delivery</p>
                  <p className="font-bold text-gray-900">
                    {trackingData.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Progress
                </h3>
                <span className="text-sm font-semibold text-gray-600">
                  {trackingData.progress}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${trackingData.progress}%` }}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Tracking Timeline
              </h3>
              <div className="space-y-6">
                {trackingData.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-2 rounded-full ${
                          event.completed
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      {index < trackingData.timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-16 ${
                            event.completed
                              ? "bg-gradient-to-b from-purple-600 to-pink-600"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            className={`font-bold ${event.completed ? "text-gray-900" : "text-gray-500"}`}
                          >
                            {event.status}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.location}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium ${event.completed ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {event.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Shipment Route
              </h3>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">
                    Interactive Map View
                  </p>
                  <p className="text-sm text-gray-600">
                    Tracking from {trackingData.currentLocation} to{" "}
                    {trackingData.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Support Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                  Contact Customer
                </button>
                <button className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                  Update Customer
                </button>
                <button className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!trackingData && !loading && (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <Truck className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Ready to Track
            </h3>
            <p className="text-gray-600">
              Enter an order ID or tracking number above to view real-time
              tracking information
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default OrderTracking;
