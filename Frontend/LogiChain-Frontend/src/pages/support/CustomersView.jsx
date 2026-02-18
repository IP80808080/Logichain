import { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  Search,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { userService, orderService } from "../../services/api";
import { toast } from "react-toastify";

function CustomersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes] = await Promise.all([
        userService.getAll(),
        orderService.getAll(),
      ]);

      const allUsers = usersRes.data.data || [];
      const allOrders = ordersRes.data.data || [];

      const customersOnly = allUsers.filter((u) => u.role === "CUSTOMER");

      const customersWithStats = customersOnly.map((customer) => {
        const customerOrders = allOrders.filter(
          (o) => o.customerId === customer.id,
        );
        const totalSpent = customerOrders.reduce(
          (sum, o) => sum + parseFloat(o.totalAmount || 0),
          0,
        );
        const lastOrder =
          customerOrders.length > 0
            ? customerOrders.sort(
                (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
              )[0]
            : null;

        const shippingAddress = lastOrder?.shippingAddress || null;

        return {
          ...customer,
          orders: customerOrders.length,
          totalSpent: totalSpent,
          lastOrder: lastOrder?.orderDate
            ? new Date(lastOrder.orderDate).toISOString().split("T")[0]
            : "N/A",
          lastOrderFull: lastOrder,
          shippingAddress: shippingAddress,
          status: customerOrders.length > 0 ? "Active" : "Inactive",
        };
      });

      setCustomers(customersWithStats);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER_SUPPORT">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER_SUPPORT">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">
            View customer details and order history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalCustomers}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {activeCustomers}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${avgOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-2 backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {customer.username}
                        </h3>
                        <span
                          className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {customer.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">
                      {customer.shippingAddress}
                      {console.log(customer)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Orders</p>
                    <p className="text-xl font-bold text-blue-700">
                      {customer.orders}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Spent</p>
                    <p className="text-lg font-bold text-purple-700">
                      ${customer.totalSpent.toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Joined</p>
                    <p className="text-xs font-bold text-green-700">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Full Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customer Details
              </h2>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer ID</p>
                      <p className="font-semibold text-gray-900">
                        CUST-{String(selectedCustomer.id).padStart(4, "0")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Email Address
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.phone || "N/A"}
                      </p>
                    </div>
                    {selectedCustomer.shippingAddress && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">
                          Shipping Address
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedCustomer.shippingAddress}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Account Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedCustomer.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.createdAt
                          ? new Date(
                              selectedCustomer.createdAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Order Statistics
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedCustomer.orders}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-700">
                        ${selectedCustomer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        $
                        {selectedCustomer.orders > 0
                          ? (
                              selectedCustomer.totalSpent /
                              selectedCustomer.orders
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Last Order</p>
                      <p className="text-sm font-bold text-orange-700">
                        {selectedCustomer.lastOrder}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Order Details */}
                {selectedCustomer.lastOrderFull && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Last Order Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Order Number</p>
                          <p className="font-semibold text-gray-900">
                            {selectedCustomer.lastOrderFull.orderNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Status</p>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {selectedCustomer.lastOrderFull.orderStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-gray-900">
                            $
                            {parseFloat(
                              selectedCustomer.lastOrderFull.totalAmount,
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Contact Customer
                  </button>
                  <button
                    onClick={() => (window.location.href = `/support/orders`)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    <ShoppingCart className="h-4 w-4 inline mr-2" />
                    View All Orders
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

export default CustomersView;
