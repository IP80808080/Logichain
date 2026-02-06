import { useState, useEffect } from "react";
import { Truck, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { carrierService } from "../../services/api";
import { toast } from "react-toastify";

function CarriersManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState(null);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    carrierName: "",
    carrierCode: "",
    contactEmail: "",
  });

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const response = await carrierService.getAll();
      // Extract data from ApiResponse wrapper
      const carriersData = response.data.data || [];
      setCarriers(carriersData);
    } catch (error) {
      console.error("Error fetching carriers:", error);
      toast.error("Failed to load carriers. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.carrierName ||
        !formData.carrierCode ||
        !formData.contactEmail
      ) {
        toast.error("Please fill in all required fields", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        toast.error("Please enter a valid email address", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      if (editingCarrier) {
        const response = await carrierService.update(
          editingCarrier.id,
          formData,
        );

        if (response.data.success) {
          toast.success(
            response.data.message || "Carrier updated successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
      } else {
        const response = await carrierService.create(formData);

        if (response.data.success) {
          toast.success(
            response.data.message || "Carrier created successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
      }

      await fetchCarriers();

      setFormData({
        carrierName: "",
        carrierCode: "",
        contactEmail: "",
      });
      setEditingCarrier(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving carrier:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save carrier. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this carrier? This action cannot be undone.",
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        const response = await carrierService.delete(id);

        if (response.data.success) {
          toast.success(
            response.data.message || "Carrier deleted successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }

        await fetchCarriers();
      } catch (error) {
        console.error("Error deleting carrier:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete carrier. Please try again.",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (carrier) => {
    setFormData({
      carrierName: carrier.carrierName,
      carrierCode: carrier.carrierCode,
      contactEmail: carrier.contactEmail,
    });
    setEditingCarrier(carrier);
    setShowModal(true);
  };

  const totalShipments = carriers.length * 100;
  const avgOnTimeRate = carriers.length > 0 ? 93.5 : 0;
  const avgCost = carriers.length > 0 ? 11.25 : 0;

  if (loading && carriers.length === 0) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Carriers Management
          </h1>
          <p className="text-gray-600">
            Manage shipping carriers and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Carriers</p>
                <p className="text-3xl font-bold text-blue-600">
                  {carriers.length}
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
                <p className="text-sm text-gray-600 mb-1">Total Shipments</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalShipments}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Cost</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${avgCost.toFixed(2)}
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
                <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {avgOnTimeRate}%
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <button
            onClick={() => {
              setEditingCarrier(null);
              setFormData({
                carrierName: "",
                carrierCode: "",
                contactEmail: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-5 w-5" />
            Add Carrier
          </button>
        </div>

        {carriers.length === 0 ? (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No carriers found</p>
            <p className="text-gray-500 text-sm">
              Add your first carrier to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {carrier.carrierName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: {carrier.carrierCode}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Contact Email</p>
                  <p className="text-sm font-medium text-blue-700">
                    {carrier.contactEmail}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                  <p className="text-xs text-gray-600 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(carrier.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(carrier)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(carrier.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCarrier ? "Edit Carrier" : "Add New Carrier"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.carrierName}
                    onChange={(e) =>
                      setFormData({ ...formData, carrierName: e.target.value })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., FedEx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier Code *
                  </label>
                  <input
                    type="text"
                    value={formData.carrierCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carrierCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., FEDEX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@carrier.com"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCarrier(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingCarrier
                        ? "Update"
                        : "Create"}
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

export default CarriersManagement;
