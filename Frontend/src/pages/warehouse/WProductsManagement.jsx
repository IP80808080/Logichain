import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Package,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Tag,
  AlertCircle,
  Send,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  productService,
  inventoryService,
  userService,
} from "../../services/api";

function WProductsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterProductManager, setFilterProductManager] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [productManagers, setProductManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    weight: "",
  });

  const [restockData, setRestockData] = useState({
    quantity: "",
    message: "",
  });

  const categories = [
    "All",
    "Electronics",
    "Clothing",
    "Food",
    "Furniture",
    "Other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🚀 [WProductsManagement] Starting data fetch...");

      // Check if user is authenticated
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("🔑 Token exists:", !!token);
      console.log("👤 User data:", user ? JSON.parse(user) : null);

      // Fetch products
      console.log("📦 Fetching products via productService.getAll()...");
      const productsRes = await productService.getAll();
      console.log("✅ Products response:", productsRes);
      console.log("📊 Products data:", productsRes.data);

      // Fetch inventory
      console.log("📋 Fetching inventory via inventoryService.getAll()...");
      const inventoryRes = await inventoryService.getAll();
      console.log("✅ Inventory response:", inventoryRes);
      console.log("📊 Inventory data:", inventoryRes.data);

      // Fetch users
      console.log("👥 Fetching users via userService.getAll()...");
      const usersRes = await userService.getAll();
      console.log("✅ Users response:", usersRes);
      console.log("📊 Users data:", usersRes.data);

      const productData = productsRes.data.data || [];
      const inventoryData = inventoryRes.data.data || [];
      const userData = usersRes.data.data || [];

      console.log("📦 Total products:", productData.length);
      console.log("📋 Total inventory items:", inventoryData.length);
      console.log("👥 Total users:", userData.length);

      setProducts(productData);
      setInventory(inventoryData);

      const managers = userData.filter(
        (user) => user.role === "PRODUCT_MANAGER",
      );
      console.log("👔 Product Managers found:", managers.length);
      setProductManagers(managers);

      console.log("✅ Data fetch completed successfully!");
    } catch (error) {
      console.error("❌ [WProductsManagement] Error in fetchData:");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);

      toast.error(
        `Failed to load products: ${error.response?.data?.message || error.message}`,
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setLoading(false);
      console.log("🏁 fetchData completed (loading set to false)");
    }
  };

  const getProductStock = (product) => {
    if (!product || !inventory.length) return 0;
    const total = inventory
      .filter((inv) => Number(inv.productId) === Number(product.id))
      .reduce((sum, inv) => sum + (Number(inv.quantity) || 0), 0);
    return total;
  };

  const getProductReservedStock = (product) => {
    if (!product || !inventory.length) return 0;
    const totalReserved = inventory
      .filter((inv) => Number(inv.productId) === Number(product.id))
      .reduce((sum, inv) => sum + (Number(inv.reservedQuantity) || 0), 0);
    return totalReserved;
  };

  const getProductAvailableStock = (product) => {
    const total = getProductStock(product);
    const reserved = getProductReservedStock(product);
    return total - reserved;
  };

  const getProductManagerName = (createdBy) => {
    if (!createdBy) return "Unknown Manager";
    const manager = productManagers.find(
      (pm) => String(pm.id) === String(createdBy),
    );
    return manager ? manager.username : "Unknown Manager";
  };

  const handleEditSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.sku ||
        !formData.price ||
        !formData.weight
      ) {
        toast.error("Please fill in all required fields", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (parseFloat(formData.price) <= 0 || parseFloat(formData.weight) <= 0) {
        toast.error("Price and weight must be positive numbers", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);
      const response = await productService.update(editingProduct.id, formData);

      if (response.data.success) {
        toast.success(
          response.data.message || "Product updated successfully!",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
      }

      await fetchData();
      setFormData({ name: "", sku: "", price: "", weight: "" });
      setEditingProduct(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update product. Please try again.",
        { position: "top-right", autoClose: 4000 },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      weight: product.weight.toString(),
    });
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        const response = await productService.delete(id);

        if (response.data.success) {
          toast.success(
            response.data.message || "Product deleted successfully!",
            {
              position: "top-right",
              autoClose: 3000,
            },
          );
        }
        await fetchData();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete product. Please try again.",
          { position: "top-right", autoClose: 4000 },
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestockRequest = (product) => {
    setRestockingProduct(product);
    setRestockData({ quantity: "", message: "" });
    setShowRestockModal(true);
  };

  const handleRestockSubmit = async () => {
    try {
      if (!restockData.quantity || parseInt(restockData.quantity) <= 0) {
        toast.error("Please enter a valid quantity", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);
      toast.success(
        `Restock request sent to ${getProductManagerName(restockingProduct.createdBy)} for ${restockData.quantity} units of ${restockingProduct.name}`,
        { position: "top-right", autoClose: 4000 },
      );

      setRestockingProduct(null);
      setShowRestockModal(false);
      setRestockData({ quantity: "", message: "" });
    } catch (error) {
      console.error("Error sending restock request:", error);
      toast.error("Failed to send restock request. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;

    const matchesProductManager =
      filterProductManager === "All" ||
      String(product.createdBy) === String(filterProductManager);

    return matchesSearch && matchesCategory && matchesProductManager;
  });

  const productsWithStock = filteredProducts.map((product) => ({
    ...product,
    stock: getProductStock(product),
    reservedStock: getProductReservedStock(product),
    availableStock: getProductAvailableStock(product),
  }));

  const totalValue = productsWithStock.reduce(
    (sum, p) => sum + parseFloat(p.price) * p.stock,
    0,
  );
  const totalStock = productsWithStock.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = productsWithStock.filter(
    (p) => p.availableStock < 50,
  ).length;

  if (loading && products.length === 0) {
    return (
      <DashboardLayout role="WAREHOUSE_MANAGER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
            <p className="text-xs text-gray-400 mt-2">
              Check browser console for detailed logs
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="WAREHOUSE_MANAGER">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Management (Warehouse Manager)
          </h1>
          <p className="text-gray-600">
            View, edit, and manage products from Product Managers
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Note: Only Product Managers can create new products
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Debug: {products.length} products, {inventory.length} inventory
            items loaded
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-blue-600">
                  {productsWithStock.length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Stock</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Available:{" "}
                  {productsWithStock
                    .reduce((sum, p) => sum + p.availableStock, 0)
                    .toLocaleString()}
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
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">
                  {lowStockCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">{"<"} 50 available</p>
              </div>
              <div className="bg-red-500 p-3 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 text-black pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 text-black py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterProductManager}
                onChange={(e) => setFilterProductManager(e.target.value)}
                className="pl-10 pr-8 text-black py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Managers</option>
                {productManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {productsWithStock.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  productsWithStock.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 ? "..." : ""}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                          {product.category || "Other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {getProductManagerName(product.createdBy)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.weight} kg
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                              product.availableStock < 10
                                ? "bg-red-100 text-red-700"
                                : product.availableStock < 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.stock}
                          </div>
                          {product.reservedStock > 0 && (
                            <div className="text-xs text-gray-500">
                              Reserved: {product.reservedStock}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 font-medium">
                            Available: {product.availableStock}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            disabled={loading}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRestockRequest(product)}
                            className={`p-2 text-white rounded-lg transition ${
                              product.availableStock < 50
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-gray-400 hover:bg-gray-500"
                            }`}
                            disabled={loading}
                            title="Request Restock"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            disabled={loading}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal - Same as before */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Product
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Wireless Headphones"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., SKU001"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restock Request Modal - Same as before */}
        {showRestockModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Request Restock
              </h2>
              <p className="text-gray-600 mb-6">
                Send restock request to{" "}
                {getProductManagerName(restockingProduct?.createdBy)}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <input
                    type="text"
                    value={restockingProduct?.name || ""}
                    disabled
                    className="w-full px-4 py-2 text-black bg-gray-100 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Stock
                    </label>
                    <input
                      type="text"
                      value={
                        restockingProduct
                          ? getProductStock(restockingProduct)
                          : 0
                      }
                      disabled
                      className="w-full px-4 py-2 text-black bg-gray-100 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available
                    </label>
                    <input
                      type="text"
                      value={
                        restockingProduct
                          ? getProductAvailableStock(restockingProduct)
                          : 0
                      }
                      disabled
                      className="w-full px-4 py-2 text-black bg-gray-100 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Quantity *
                  </label>
                  <input
                    type="number"
                    value={restockData.quantity}
                    onChange={(e) =>
                      setRestockData({
                        ...restockData,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={restockData.message}
                    onChange={(e) =>
                      setRestockData({
                        ...restockData,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add any notes for the product manager..."
                    rows="3"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowRestockModal(false);
                      setRestockingProduct(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestockSubmit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition"
                    disabled={loading}
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Sending..." : "Send Request"}
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

export default WProductsManagement;
