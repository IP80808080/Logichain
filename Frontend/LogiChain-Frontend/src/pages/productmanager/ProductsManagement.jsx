import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Weight,
  Barcode,
  Image as ImageIcon,
  Filter,
  X,
  Upload,
  TrendingUp,
  Minus,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { productService, inventoryService } from "../../services/api";
import { toast } from "react-toastify";

function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showQuickStockModal, setShowQuickStockModal] = useState(false);
  const [quickStockProduct, setQuickStockProduct] = useState(null);
  const [quickStockValue, setQuickStockValue] = useState("");
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    weight: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchInventory();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts();
      console.log("Products response:", response.data);

      const productsData = response.data.data || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all inventory (simplified - since you may not have getByProduct endpoint)
  const fetchInventory = async () => {
    try {
      const response = await inventoryService.getAll();
      setInventory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      // If 403 error, just set empty array
      if (error.response?.status === 403) {
        setInventory([]);
      }
    }
  };

  // Get stock data from product DTO (backend should provide this)
  const getProductStock = (product) => {
    // Get from product DTO if available
    return product.totalStock || 0;
  };

  const getProductReservedStock = (product) => {
    return product.reservedStock || 0;
  };

  const getProductAvailableStock = (product) => {
    return product.availableStock || 0;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Add stock information to products
  const productsWithStock = filteredProducts.map((product) => ({
    ...product,
    totalStock: getProductStock(product),
    reservedStock: getProductReservedStock(product),
    availableStock: getProductAvailableStock(product),
  }));

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      sku: "",
      name: "",
      description: "",
      price: "",
      weight: "",
      category: "",
      imageUrl: "",
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      price: product.price,
      weight: product.weight,
      category: product.category || "",
      imageUrl: product.imageUrl || "",
    });
    setImagePreview(product.imageUrl || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productService.delete(id);
      toast.success("Product deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchProducts();
      fetchCategories();
      fetchInventory();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // STOCK MANAGEMENT FUNCTIONS - SIMPLIFIED VERSION
  const updateStock = async (product, change) => {
    if (change === 0) {
      // Open modal for precise input
      setQuickStockProduct(product);
      setQuickStockValue(getProductStock(product).toString());
      setShowQuickStockModal(true);
      return;
    }

    try {
      // Get current stock from product DTO
      const currentStock = getProductStock(product);
      const currentReserved = getProductReservedStock(product);
      const newStock = Math.max(0, currentStock + change);

      // Ensure reserved doesn't exceed new stock
      const adjustedReserved = Math.min(currentReserved, newStock);

      // Find inventory for this product
      const productInventory = inventory.filter(
        (inv) => Number(inv.productId) === Number(product.id),
      );

      if (productInventory.length === 0) {
        // No inventory exists yet, create new one
        await inventoryService.create({
          productId: product.id,
          warehouseId: 1, // Default warehouse ID
          quantity: newStock,
          reservedQuantity: adjustedReserved,
        });

        toast.success("Stock created", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        // Update existing inventory
        const inv = productInventory[0];
        await inventoryService.update(inv.id, {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
          quantity: newStock,
          reservedQuantity: adjustedReserved,
        });

        toast.success(`Stock ${change > 0 ? "increased" : "decreased"}`, {
          position: "top-right",
          autoClose: 2000,
        });
      }

      // Refresh data
      await Promise.all([fetchInventory(), fetchProducts()]);
    } catch (error) {
      console.error("Error updating stock:", error);

      // Check if it's a permission error (403)
      if (error.response?.status === 403) {
        toast.error(
          "You don't have permission to update inventory. Contact warehouse manager.",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to update stock", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  };

  // Update reserved stock - SIMPLIFIED
  const updateReservedStock = async (product, change) => {
    try {
      const currentStock = getProductStock(product);
      const currentReserved = getProductReservedStock(product);
      const newReservedQuantity = currentReserved + change;

      // Validation
      if (newReservedQuantity < 0) {
        toast.error("Reserved stock cannot be negative", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (newReservedQuantity > currentStock) {
        toast.error("Cannot reserve more than total stock", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Find inventory for this product
      const productInventory = inventory.filter(
        (inv) => Number(inv.productId) === Number(product.id),
      );

      if (productInventory.length === 0) {
        // Create new inventory with reserved stock
        await inventoryService.create({
          productId: product.id,
          warehouseId: 1,
          quantity: currentStock,
          reservedQuantity: newReservedQuantity,
        });
      } else {
        // Update existing inventory
        const inv = productInventory[0];
        await inventoryService.update(inv.id, {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
          quantity: currentStock,
          reservedQuantity: newReservedQuantity,
        });
      }

      toast.success(
        `Reserved stock ${change > 0 ? "increased" : "decreased"}`,
        {
          position: "top-right",
          autoClose: 2000,
        },
      );

      // Refresh data
      await Promise.all([fetchInventory(), fetchProducts()]);
    } catch (error) {
      console.error("Error updating reserved stock:", error);

      // Check if it's a permission error (403)
      if (error.response?.status === 403) {
        toast.error(
          "You don't have permission to update inventory. Contact warehouse manager.",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update reserved stock",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      }
    }
  };

  const handleQuickStockUpdate = async () => {
    if (!quickStockProduct || !quickStockValue || isNaN(quickStockValue)) {
      toast.error("Enter a valid stock number", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const stockValue = parseInt(quickStockValue);
    if (stockValue < 0) {
      toast.error("Stock cannot be negative", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const currentReserved = getProductReservedStock(quickStockProduct);
      const adjustedReserved = Math.min(currentReserved, stockValue);

      // Find inventory for this product
      const productInventory = inventory.filter(
        (inv) => Number(inv.productId) === Number(quickStockProduct.id),
      );

      if (productInventory.length === 0) {
        await inventoryService.create({
          productId: quickStockProduct.id,
          warehouseId: 1,
          quantity: stockValue,
          reservedQuantity: adjustedReserved,
        });
      } else {
        const inv = productInventory[0];
        await inventoryService.update(inv.id, {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
          quantity: stockValue,
          reservedQuantity: adjustedReserved,
        });
      }

      toast.success(`Stock set to ${stockValue}`, {
        position: "top-right",
        autoClose: 2000,
      });

      setShowQuickStockModal(false);
      await Promise.all([fetchInventory(), fetchProducts()]);
    } catch (error) {
      console.error("Error setting stock:", error);

      // Check if it's a permission error (403)
      if (error.response?.status === 403) {
        toast.error(
          "You don't have permission to update inventory. Contact warehouse manager.",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to update stock", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          imageUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      imageUrl: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.sku ||
      !formData.name ||
      !formData.price ||
      !formData.weight ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (parseFloat(formData.weight) <= 0) {
      toast.error("Weight must be greater than 0", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const productData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        category: formData.category.trim(),
        imageUrl: formData.imageUrl || null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
        toast.success("Product updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await productService.create(productData);
        toast.success("Product created successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setShowModal(false);
      await Promise.all([fetchProducts(), fetchCategories(), fetchInventory()]);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const COMMON_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Footwear",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Fitness",
    "Books",
    "Toys",
    "Groceries",
    "Furniture",
    "Accessories",
  ];

  // Calculate stats
  const totalStock = productsWithStock.reduce(
    (sum, p) => sum + p.totalStock,
    0,
  );

  const totalAvailableStock = productsWithStock.reduce(
    (sum, p) => sum + p.availableStock,
    0,
  );

  const totalReservedStock = productsWithStock.reduce(
    (sum, p) => sum + p.reservedStock,
    0,
  );

  const totalValue = productsWithStock.reduce(
    (sum, p) => sum + parseFloat(p.price || 0) * p.availableStock,
    0,
  );

  const reservedValue = productsWithStock.reduce(
    (sum, p) => sum + parseFloat(p.price || 0) * p.reservedStock,
    0,
  );

  const lowStockCount = productsWithStock.filter(
    (p) => p.availableStock < 50,
  ).length;

  if (loading) {
    return (
      <DashboardLayout role="PRODUCT_MANAGER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="PRODUCT_MANAGER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {products.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">All units</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Stock</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {totalAvailableStock.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  $
                  {totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Unlock className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reserved Stock</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {totalReservedStock.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  $
                  {reservedValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Alert</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {lowStockCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Items &lt; 50</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Categories:
              </span>
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {productsWithStock.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedCategory
                  ? "No products found"
                  : "No products yet"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters"
                  : "Click 'Add Product' to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {productsWithStock.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {product.category}
                        </span>
                      </div>
                    )}
                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-white text-xs font-bold rounded-full ${
                          product.availableStock < 10
                            ? "bg-red-600"
                            : product.availableStock < 50
                              ? "bg-yellow-600"
                              : "bg-green-600"
                        }`}
                      >
                        Available: {product.availableStock}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Barcode className="h-3 w-3" />
                        {product.sku}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {parseFloat(product.price).toFixed(2)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Weight className="h-4 w-4 mr-1" />
                        {product.weight} kg
                      </div>
                    </div>

                    {/* Stock Information with Controls */}
                    <div className="text-xs space-y-2 pt-2 border-t">
                      {/* Total Stock */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Total Stock:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStock(product, -1)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-200 text-white rounded hover:bg-gray-300 transition"
                          >
                            <Minus />
                          </button>
                          <span
                            onClick={() => updateStock(product, 0)}
                            className="font-bold text-sm min-w-[40px] text-center cursor-pointer text-gray-900 hover:text-blue-600 px-2 py-1 rounded hover:bg-gray-100"
                          >
                            {product.totalStock}
                          </span>
                          <button
                            onClick={() => updateStock(product, 1)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-200 text-white rounded hover:bg-gray-300 transition"
                          >
                            <Plus />
                          </button>
                        </div>
                      </div>

                      {/* Available Stock */}
                      <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                        <span className="text-green-700 font-medium flex items-center gap-1">
                          <Unlock className="h-3 w-3" />
                          Available:
                        </span>
                        <span className="text-green-600 font-bold">
                          {product.availableStock}
                        </span>
                      </div>

                      {/* Reserved Stock */}
                      <div className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                        <span className="text-yellow-700 font-medium flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Reserved:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateReservedStock(product, -1)}
                            className="w-10 h-10 flex items-center justify-center bg-yellow-200 text-white rounded hover:bg-yellow-300 transition"
                            disabled={product.reservedStock === 0}
                          >
                            <Minus />
                          </button>
                          <span className="text-yellow-600 font-bold min-w-[30px] text-center">
                            {product.reservedStock}
                          </span>
                          <button
                            onClick={() => updateReservedStock(product, 1)}
                            className="w-10 h-10 flex items-center justify-center bg-yellow-200 text-white rounded hover:bg-yellow-300 transition"
                            disabled={
                              product.reservedStock >= product.totalStock
                            }
                          >
                            <Plus />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>Recommended: 800x800px</p>
                    <p>Max size: 5MB</p>
                    <p>Format: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PROD-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {categories
                      .filter((cat) => !COMMON_CATEGORIES.includes(cat))
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Gaming Laptop"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 999.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>

              {/* Stock Management Section */}
              {editingProduct && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Information
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Total Stock
                      </label>
                      <div className="text-lg font-bold text-center bg-gray-50 text-black p-2 rounded">
                        {getProductStock(editingProduct)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Available
                      </label>
                      <div className="text-lg font-bold text-center bg-green-50 text-green-600 p-2 rounded">
                        {getProductAvailableStock(editingProduct)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Reserved
                      </label>
                      <div className="text-lg font-bold text-center bg-yellow-50 text-yellow-600 p-2 rounded">
                        {getProductReservedStock(editingProduct)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Update Modal */}
      {showQuickStockModal && quickStockProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
              <button
                onClick={() => setShowQuickStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Product:</p>
              <p className="font-semibold text-gray-900">
                {quickStockProduct.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Total Stock Quantity
                </label>
                <input
                  type="number"
                  value={quickStockValue}
                  onChange={(e) => setQuickStockValue(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter stock quantity"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {quickStockProduct.totalStock || 0} | Reserved:{" "}
                  {quickStockProduct.reservedStock || 0}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleQuickStockUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowQuickStockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ProductsManagement;
