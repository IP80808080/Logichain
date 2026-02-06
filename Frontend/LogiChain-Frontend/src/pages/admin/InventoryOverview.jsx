import { useState, useEffect } from "react";
import { Package, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  inventoryService,
  warehouseService,
  productService,
} from "../../services/api";
import { toast } from "react-toastify";

function InventoryOverview() {
  const [inventoryData, setInventoryData] = useState({
    warehouses: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      const [inventoryRes, warehousesRes, productsRes] = await Promise.all([
        inventoryService.getAll(),
        warehouseService.getAll(),
        productService.getAll(),
      ]);

      const inventory = inventoryRes.data.data || [];
      const warehouses = warehousesRes.data.data || [];
      const products = productsRes.data.data || [];

      const warehouseInventory = warehouses.map((wh) => {
        const whInventory = inventory.filter(
          (inv) => inv.warehouseId === wh.id,
        );
        const totalItems = whInventory.reduce(
          (sum, inv) => sum + inv.quantity,
          0,
        );

        const totalValue = whInventory.reduce((sum, inv) => {
          const product = products.find((p) => p.id === inv.productId);
          return sum + inv.quantity * (product?.price || 0);
        }, 0);

        const lowStockItems = whInventory.filter(
          (inv) => inv.quantity < 20,
        ).length;

        const utilization =
          wh.capacity > 0 ? ((totalItems / wh.capacity) * 100).toFixed(1) : 0;

        return {
          name: wh.name,
          totalItems,
          totalValue,
          lowStockItems,
          utilization: parseFloat(utilization),
        };
      });

      const lowStockProducts = inventory
        .filter((inv) => inv.quantity < 20)
        .map((inv) => {
          const product = products.find((p) => p.id === inv.productId);
          const warehouse = warehouses.find((w) => w.id === inv.warehouseId);
          return {
            name: product?.name || `Product #${inv.productId}`,
            warehouse: warehouse?.name || `Warehouse #${inv.warehouseId}`,
            stock: inv.quantity,
            reorderPoint: 20,
            inventoryId: inv.id,
            productId: inv.productId,
          };
        })
        .slice(0, 10);

      setInventoryData({
        warehouses: warehouseInventory,
        lowStockProducts,
      });
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (productId) => {
    toast.success(`Reorder initiated for product #${productId}`);
  };

  const totalItems = inventoryData.warehouses.reduce(
    (sum, w) => sum + w.totalItems,
    0,
  );
  const totalValue = inventoryData.warehouses.reduce(
    (sum, w) => sum + w.totalValue,
    0,
  );
  const totalLowStock = inventoryData.warehouses.reduce(
    (sum, w) => sum + w.lowStockItems,
    0,
  );

  if (loading) {
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
            Inventory Overview
          </h1>
          <p className="text-gray-600">
            System-wide inventory monitoring and analytics
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  $
                  {totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
                <p className="text-sm text-gray-600 mb-1">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-red-600">
                  {totalLowStock}
                </p>
              </div>
              <div className="bg-red-500 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Warehouses</p>
                <p className="text-3xl font-bold text-purple-600">
                  {inventoryData.warehouses.length}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Breakdown */}
        {inventoryData.warehouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {inventoryData.warehouses.map((warehouse, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {warehouse.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold text-gray-900">
                      {warehouse.totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value</span>
                    <span className="font-semibold text-green-600">
                      $
                      {warehouse.totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-semibold text-red-600">
                      {warehouse.lowStockItems}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-semibold text-black">
                        {warehouse.utilization}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(warehouse.utilization, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center mb-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No warehouse data available</p>
          </div>
        )}

        {/* Low Stock Alert */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alerts
          </h3>
          {inventoryData.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {inventoryData.lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">{product.warehouse}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {product.stock} units
                    </p>
                    <p className="text-xs text-gray-500">
                      Reorder: {product.reorderPoint}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReorder(product.productId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No low stock items found
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default InventoryOverview;
