import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Calendar,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  shipmentService,
  orderService,
  carrierService,
} from "../../services/api";
import { toast } from "react-toastify";

function ShipmentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [editingShipment, setEditingShipment] = useState(null);

  const [formData, setFormData] = useState({
    orderId: "",
    carrierId: "",
    trackingNumber: "",
    currentLocation: "",
    estimatedDeliveryDate: "",
    shipmentStatus: "CREATED",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, ordersRes, carriersRes] = await Promise.all([
        shipmentService.getAll(),
        orderService.getAll(),
        carrierService.getAll(),
      ]);

      setShipments(shipmentsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setCarriers(carriersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = {
        ...formData,
        orderId: parseInt(formData.orderId),
        carrierId: parseInt(formData.carrierId),
        estimatedDeliveryDate: formData.estimatedDeliveryDate
          ? `${formData.estimatedDeliveryDate}T00:00:00`
          : null,
      };

      await shipmentService.create(data);
      toast.success("Shipment created successfully!");
      setFormData({
        orderId: "",
        carrierId: "",
        trackingNumber: "",
        currentLocation: "",
        estimatedDeliveryDate: "",
        shipmentStatus: "CREATED",
      });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error(error.response?.data?.message || "Failed to create shipment");
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      orderId: shipment.orderId?.toString() || "",
      carrierId: shipment.carrierId?.toString() || "",
      trackingNumber: shipment.trackingNumber || "",
      currentLocation: shipment.currentLocation || "",
      estimatedDeliveryDate: shipment.estimatedDeliveryDate
        ? shipment.estimatedDeliveryDate.split("T")[0]
        : "",
      shipmentStatus: shipment.shipmentStatus || "CREATED",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const data = {
        ...formData,
        orderId: parseInt(formData.orderId),
        carrierId: parseInt(formData.carrierId),
        estimatedDeliveryDate: formData.estimatedDeliveryDate
          ? `${formData.estimatedDeliveryDate}T00:00:00`
          : null,
      };

      await shipmentService.update(editingShipment.id, data);
      toast.success("Shipment updated successfully!");
      setEditingShipment(null);
      setFormData({
        orderId: "",
        carrierId: "",
        trackingNumber: "",
        currentLocation: "",
        estimatedDeliveryDate: "",
        shipmentStatus: "CREATED",
      });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast.error(error.response?.data?.message || "Failed to update shipment");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this shipment?")) return;

    try {
      await shipmentService.delete(id);
      toast.success("Shipment deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast.error("Failed to delete shipment");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const shipment = shipments.find((s) => s.id === id);
      const data = {
        orderId: shipment.orderId,
        carrierId: shipment.carrierId,
        trackingNumber: shipment.trackingNumber,
        currentLocation: shipment.currentLocation,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        shipmentStatus: newStatus,
        actualDeliveryDate:
          newStatus === "DELIVERED"
            ? new Date().toISOString()
            : shipment.actualDeliveryDate,
      };

      await shipmentService.update(id, data);
      toast.success(`Shipment status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-700";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-700";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredShipments = shipments.filter((ship) => {
    const search = searchTerm.toLowerCase();
    return (
      ship.trackingNumber?.toLowerCase().includes(search) ||
      ship.order?.orderNumber?.toLowerCase().includes(search)
    );
  });

  const statusCounts = {
    CREATED: shipments.filter((s) => s.shipmentStatus === "CREATED").length,
    IN_TRANSIT: shipments.filter((s) => s.shipmentStatus === "IN_TRANSIT")
      .length,
    DELIVERED: shipments.filter((s) => s.shipmentStatus === "DELIVERED").length,
  };

  return (
    <DashboardLayout role="WAREHOUSE_MANAGER">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shipments Management
          </h1>
          <p className="text-gray-600">Create and track shipments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Shipments</p>
                <p className="text-3xl font-bold text-[#AD46FF]">
                  {shipments.length}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statusCounts.CREATED}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Transit</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statusCounts.IN_TRANSIT}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
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
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Create */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-black pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Create Shipment
            </button>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading shipments...</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No shipments found
              </h3>
              <p className="text-gray-600">
                Create a new shipment to get started
              </p>
            </div>
          ) : (
            filteredShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Shipment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {shipment.trackingNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Order: {shipment.order?.orderNumber || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.shipmentStatus)}`}
                      >
                        {shipment.shipmentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-semibold text-gray-600">
                            Current Location
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {shipment.currentLocation || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-semibold text-gray-600">
                            Carrier
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {shipment.carrier?.carrierName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Est. Delivery:</span>
                        <span className="font-semibold text-gray-900">
                          {shipment.estimatedDeliveryDate
                            ? new Date(
                                shipment.estimatedDeliveryDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {shipment.actualDeliveryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-400" />
                          <span className="text-gray-600">Delivered:</span>
                          <span className="font-semibold text-green-700">
                            {new Date(
                              shipment.actualDeliveryDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {shipment.shipmentStatus === "CREATED" && (
                      <button
                        onClick={() => updateStatus(shipment.id, "IN_TRANSIT")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Start Transit
                      </button>
                    )}
                    {shipment.shipmentStatus === "IN_TRANSIT" && (
                      <button
                        onClick={() =>
                          updateStatus(shipment.id, "OUT_FOR_DELIVERY")
                        }
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {shipment.shipmentStatus === "OUT_FOR_DELIVERY" && (
                      <button
                        onClick={() => updateStatus(shipment.id, "DELIVERED")}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(shipment)}
                      className="px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shipment.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Shipment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Shipment
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order *
                    </label>
                    <select
                      required
                      value={formData.orderId}
                      onChange={(e) =>
                        setFormData({ ...formData, orderId: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Order</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {order.customer?.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier *
                    </label>
                    <select
                      required
                      value={formData.carrierId}
                      onChange={(e) =>
                        setFormData({ ...formData, carrierId: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Carrier</option>
                      {carriers.map((carrier) => (
                        <option key={carrier.id} value={carrier.id}>
                          {carrier.carrierName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trackingNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trackingNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., FDX123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentLocation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Warehouse - New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.estimatedDeliveryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDeliveryDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                  >
                    Create Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Shipment Modal */}
        {showEditModal && editingShipment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Shipment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trackingNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trackingNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentLocation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.shipmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipmentStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CREATED">Created</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingShipment(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                  >
                    Update Shipment
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

export default ShipmentsManagement;
