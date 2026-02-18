import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Warehouse,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Users,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { warehouseService, inventoryService } from "../../services/api";

function WarehouseManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    capacity: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehousesRes, inventoryRes] = await Promise.all([
        warehouseService.getAll(),
        inventoryService.getAll(),
      ]);

      setWarehouses(warehousesRes.data.data || []);
      setInventory(inventoryRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load warehouses. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseStock = (warehouseId) => {
    return inventory
      .filter((inv) => inv.warehouseId === warehouseId)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.code ||
        !formData.location ||
        !formData.capacity
      ) {
        toast.error("Please fill in all required fields", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (isNaN(formData.capacity) || parseFloat(formData.capacity) <= 0) {
        toast.error("Capacity must be a positive number", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      if (editingWarehouse) {
        const response = await warehouseService.update(
          editingWarehouse.id,
          formData,
        );

        if (response.data.success) {
          toast.success(
            response.data.message || "Warehouse updated successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
      } else {
        const response = await warehouseService.create(formData);

        if (response.data.success) {
          toast.success(
            response.data.message || "Warehouse created successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
      }

      await fetchData();

      setFormData({
        name: "",
        code: "",
        location: "",
        capacity: "",
      });
      setEditingWarehouse(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save warehouse. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (warehouse) => {
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      capacity: warehouse.capacity.toString(),
    });
    setEditingWarehouse(warehouse);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this warehouse?")) {
      try {
        setLoading(true);
        const response = await warehouseService.delete(id);

        if (response.data.success) {
          toast.success(
            response.data.message || "Warehouse deleted successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
        await fetchData();
      } catch (error) {
        console.error("Error deleting warehouse:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete warehouse. Please try again.",
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

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const warehousesWithStock = filteredWarehouses.map((wh) => ({
    ...wh,
    currentStock: getWarehouseStock(wh.id),
  }));

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalStock = warehouses.reduce(
    (sum, w) => sum + getWarehouseStock(w.id),
    0,
  );
  const utilizationRate =
    totalCapacity > 0 ? ((totalStock / totalCapacity) * 100).toFixed(1) : 0;
  const activeWarehouses = warehouses.length;

  if (loading && warehouses.length === 0) {
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
            Warehouse Management
          </h1>
          <p className="text-gray-600">
            Manage all warehouse locations and operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Warehouses</p>
                <p className="text-3xl font-bold text-blue-600">
                  {warehouses.length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalCapacity.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilization</p>
                <p className="text-3xl font-bold text-purple-600">
                  {utilizationRate}%
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-orange-600">
                  {activeWarehouses}
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-xl">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                setEditingWarehouse(null);
                setFormData({
                  name: "",
                  code: "",
                  location: "",
                  capacity: "",
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Warehouse
            </button>
          </div>
        </div>

        {warehousesWithStock.length === 0 ? (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No warehouses found</p>
            <p className="text-gray-500 text-sm">
              Add your first warehouse to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {warehousesWithStock.map((warehouse) => {
              const utilizationPercent =
                warehouse.capacity > 0
                  ? (
                      (warehouse.currentStock / warehouse.capacity) *
                      100
                    ).toFixed(1)
                  : 0;
              return (
                <div
                  key={warehouse.id}
                  className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                        <Warehouse className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {warehouse.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <MapPin className="h-4 w-4" />
                          {warehouse.location}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Code: {warehouse.code}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-semibold text-black">
                        {utilizationPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          utilizationPercent > 90
                            ? "bg-red-500"
                            : utilizationPercent > 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(utilizationPercent, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{warehouse.currentStock.toLocaleString()}</span>
                      <span>{warehouse.capacity.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date(warehouse.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">
                        Current Stock
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {warehouse.currentStock}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Warehouse A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., WH-001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingWarehouse(null);
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
                      : editingWarehouse
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

export default WarehouseManagement;
