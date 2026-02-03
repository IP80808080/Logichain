import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Package,
  Users,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { warehouseService, inventoryService } from "../../services/api";
import { toast } from "react-toastify";

function WarehouseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
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
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      await warehouseService.create(data);
      toast.success("Warehouse created successfully!");
      setFormData({
        code: "",
        name: "",
        location: "",
        capacity: "",
      });
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating warehouse:", error);
      toast.error(
        error.response?.data?.message || "Failed to create warehouse",
      );
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity.toString(),
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      await warehouseService.update(editingWarehouse.id, data);
      toast.success("Warehouse updated successfully!");
      setEditingWarehouse(null);
      setFormData({
        code: "",
        name: "",
        location: "",
        capacity: "",
      });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating warehouse:", error);
      toast.error(
        error.response?.data?.message || "Failed to update warehouse",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      await warehouseService.delete(id);
      toast.success("Warehouse deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse");
    }
  };

  const getWarehouseStock = (warehouseId) => {
    return inventory
      .filter((item) => item.warehouseId === warehouseId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredWarehouses = warehouses.filter((wh) => {
    const search = searchTerm.toLowerCase();
    return (
      wh.name?.toLowerCase().includes(search) ||
      wh.code?.toLowerCase().includes(search) ||
      wh.location?.toLowerCase().includes(search)
    );
  });

  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const utilizationRate =
    totalCapacity > 0 ? ((totalStock / totalCapacity) * 100).toFixed(1) : 0;

  return (
    <DashboardLayout role="WAREHOUSE_MANAGER">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Warehouse Management
          </h1>
          <p className="text-gray-600">
            View and manage all warehouse locations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Warehouses</p>
                <p className="text-3xl font-bold text-[#2B7FFF]">
                  {warehouses.length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                <p className="text-3xl font-bold text-[#00C950]">
                  {totalCapacity.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                <p className="text-3xl font-bold text-[#AD46FF]">
                  {totalStock.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilization</p>
                <p className="text-3xl font-bold text-[#FF6900]">
                  {utilizationRate}%
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search warehouses by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 text-black py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Add Warehouse
            </button>
          </div>
        </div>

        {/* Warehouse Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600">Loading warehouses...</p>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="col-span-2 backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No warehouses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or add a new warehouse
              </p>
            </div>
          ) : (
            filteredWarehouses.map((warehouse) => {
              const currentStock = getWarehouseStock(warehouse.id);
              const utilizationPercent = (
                (currentStock / warehouse.capacity) *
                100
              ).toFixed(1);
              return (
                <div
                  key={warehouse.id}
                  className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {warehouse.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Code: {warehouse.code}
                        </p>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <MapPin className="h-4 w-4" />
                          {warehouse.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          Capacity Utilization
                        </span>
                        <span className="font-semibold text-gray-900">
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
                        <span>{currentStock.toLocaleString()} units</span>
                        <span>{warehouse.capacity.toLocaleString()} max</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="font-semibold text-gray-900">
                        {warehouse.createdAt
                          ? new Date(warehouse.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Warehouse Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Warehouse
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., WH-NY-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., New York Main Warehouse"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 123 Industrial Blvd, New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                  >
                    Add Warehouse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Warehouse Modal */}
        {showEditModal && editingWarehouse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Warehouse
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingWarehouse(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                  >
                    Update Warehouse
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

export default WarehouseList;
