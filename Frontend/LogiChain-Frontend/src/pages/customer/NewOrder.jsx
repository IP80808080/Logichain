import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, productService } from "../../services/api";

// Common categories
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

// Sort options
const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "weight_asc", label: "Weight (Low to High)" },
  { value: "weight_desc", label: "Weight (High to Low)" },
  { value: "newest", label: "Newest First" },
];

function NewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [orderData, setOrderData] = useState({
    shippingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    billingAddress: "", // Added billing address field
    useShippingAsBilling: true, // Checkbox for using shipping as billing
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, priceRange, sortOption]);

  // When useShippingAsBilling is true, copy shipping address to billing address
  useEffect(() => {
    if (orderData.useShippingAsBilling) {
      const shippingAddress = `${orderData.shippingAddress}, ${orderData.city}, ${orderData.state} ${orderData.zipCode}, ${orderData.country}`;
      setOrderData((prev) => ({ ...prev, billingAddress: shippingAddress }));
    }
  }, [
    orderData.shippingAddress,
    orderData.city,
    orderData.state,
    orderData.zipCode,
    orderData.country,
    orderData.useShippingAsBilling,
  ]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getAll();
      const productsData = response.data.data || response.data || [];
      console.log("Products from API:", productsData);
      setProducts(productsData);
      setFilteredProducts(productsData);

      // Calculate max price for range
      if (productsData.length > 0) {
        const maxPrice = Math.max(...productsData.map((p) => p.price || 0));
        setPriceRange((prev) => ({ ...prev, max: Math.ceil(maxPrice * 1.1) }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max,
    );

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name?.localeCompare(b.name);
        case "name_desc":
          return b.name?.localeCompare(a.name);
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "weight_asc":
          return (a.weight || 0) - (b.weight || 0);
        case "weight_desc":
          return (b.weight || 0) - (a.weight || 0);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addToCart = (product) => {
    // Check stock availability
    const currentStock = product.availableStock || 0;

    // Check stock availability
    if (currentStock === 0) {
      toast.error(`${product.name} is out of stock`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if product already in cart
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Check if adding more than available stock
      if (existingItem.quantity + 1 > (product.stock || 999)) {
        toast.error(`Only ${product.stock} items available in stock`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const updateQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);

            // Check stock limit
            const product = products.find((p) => p.id === productId);
            if (
              product &&
              product.availableStock &&
              newQuantity > product.availableStock
            ) {
              toast.error(
                `Only ${product.availableStock} items available in stock`,
                {
                  position: "top-right",
                  autoClose: 3000,
                },
              );
              return { ...item, quantity: product.availableStock };
            }

            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    toast.info("Item removed from cart", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Generate a unique order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (cart.length === 0) {
      toast.error("Please add items to cart before placing order", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate shipping address
    if (
      !orderData.shippingAddress ||
      !orderData.city ||
      !orderData.state ||
      !orderData.zipCode
    ) {
      toast.error("Please fill in all shipping address fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate billing address if not using shipping address
    if (!orderData.useShippingAsBilling && !orderData.billingAddress) {
      toast.error(
        "Please fill in billing address or check 'Use shipping address'",
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        toast.error("Please login to place an order", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Prepare full shipping address
      const shippingAddress = `${orderData.shippingAddress}, ${orderData.city}, ${orderData.state} ${orderData.zipCode}, ${orderData.country}`;

      // Use either billing address or shipping address
      const billingAddress = orderData.useShippingAsBilling
        ? shippingAddress
        : orderData.billingAddress;

      // Prepare order payload with all required fields
      const orderPayload = {
        customerId: user.id,
        orderStatus: "PENDING",
        totalAmount: calculateTotal(),
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING", // Added payment status
        orderNumber: orderNumber, // Added order number
        orderItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Sending order payload:", orderPayload);

      // Call API to create order
      const response = await orderService.create(orderPayload);

      if (response.data.success || response.data) {
        toast.success("Order placed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Clear cart and form
        setCart([]);
        setOrderData({
          shippingAddress: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
          billingAddress: "",
          useShippingAsBilling: true,
        });

        // Navigate to orders page
        setTimeout(() => {
          navigate("/my-orders");
        }, 1500);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to place order. Please try again.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setPriceRange({ min: 0, max: 10000 });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-600">Select products and place your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, description, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-white rounded-lg hover:bg-gray-200 transition"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        Sort: {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {COMMON_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Clear Filters
                  </button>

                  <div className="ml-auto text-sm text-gray-600">
                    {filteredProducts.length} products found
                  </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Range: ${priceRange.min} - ${priceRange.max}
                        </label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={Math.max(100, priceRange.max)}
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>${priceRange.min}</span>
                            <span>${priceRange.max}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Available Products
                </h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No products found</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                      <div className="mb-3">
                        {product.category && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">SKU:</span>{" "}
                              {product.sku}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Weight:</span>{" "}
                              {product.weight || 0}kg
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-600">
                                Stock:
                              </span>{" "}
                              <span
                                className={
                                  (product.availableStock || 0) > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {(product.availableStock || 0) > 0
                                  ? `${product.availableStock} available (${product.totalStock || 0} total)`
                                  : "Out of stock"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            ${parseFloat(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.availableStock === 0}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                          product.availableStock === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.availableStock === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart & Shipping Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart ({cart.length})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">
                    Add products from the list
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${parseFloat(item.price).toFixed(2)} ×{" "}
                            {item.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-900 font-semibold">
                          Order Total:
                        </span>
                        <span className="text-blue-600 font-bold">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Payment will be collected on delivery
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </label>
                      <input
                        type="text"
                        name="shippingAddress"
                        value={orderData.shippingAddress}
                        onChange={handleChange}
                        placeholder="Street address"
                        required
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="city"
                          value={orderData.city}
                          onChange={handleChange}
                          placeholder="City"
                          required
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="state"
                          value={orderData.state}
                          onChange={handleChange}
                          placeholder="State"
                          required
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="zipCode"
                          value={orderData.zipCode}
                          onChange={handleChange}
                          placeholder="ZIP Code"
                          required
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="country"
                          value={orderData.country}
                          onChange={handleChange}
                          placeholder="Country"
                          required
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Billing Address Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="useShippingAsBilling"
                          name="useShippingAsBilling"
                          checked={orderData.useShippingAsBilling}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="useShippingAsBilling"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Use shipping address as billing address
                        </label>
                      </div>

                      {!orderData.useShippingAsBilling && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Billing Address
                          </label>
                          <textarea
                            name="billingAddress"
                            value={orderData.billingAddress}
                            onChange={handleChange}
                            placeholder="Enter billing address"
                            rows="3"
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={
                        loading ||
                        !orderData.shippingAddress ||
                        !orderData.city ||
                        !orderData.state ||
                        !orderData.zipCode ||
                        (!orderData.useShippingAsBilling &&
                          !orderData.billingAddress)
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Package className="h-5 w-5" />
                          Place Order Now
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default NewOrder;
