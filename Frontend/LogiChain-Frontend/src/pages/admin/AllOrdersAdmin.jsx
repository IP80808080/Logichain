import { useState, useEffect } from "react";
import { ShoppingCart, Search, Filter, Download, Calendar } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, warehouseService } from "../../services/api";
import { toast } from "react-toastify";

function AllOrdersAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterWarehouse, setFilterWarehouse] = useState("All");
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, warehousesRes] = await Promise.all([
        orderService.getAll(),
        warehouseService.getAll(),
      ]);

      setOrders(ordersRes.data.data || []);
      setWarehouses(warehousesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === "All" || order.orderStatus === filterStatus;
    const matchesWarehouse = filterWarehouse === "All";
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const exportToCSV = () => {
    const csv = [
      [
        "Order Number",
        "Order ID",
        "Customer ID",
        "Status",
        "Payment Status",
        "Total",
        "Date",
      ],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.id,
        o.customerId,
        o.orderStatus,
        o.paymentStatus,
        o.totalAmount,
        new Date(o.orderDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusCounts = {
    PENDING: orders.filter((o) => o.orderStatus === "PENDING").length,
    PROCESSING: orders.filter((o) => o.orderStatus === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.orderStatus === "CANCELLED").length,
  };

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Orders</h1>
          <p className="text-gray-600">
            System-wide order management and analytics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.PENDING}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Processing</p>
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts.PROCESSING}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Shipped</p>
            <p className="text-2xl font-bold text-purple-600">
              {statusCounts.SHIPPED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.DELIVERED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Revenue</p>
            <p className="text-lg font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="px-4 py-3 bg-white/50 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700"
            >
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Order Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Customer ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{order.customerId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AllOrdersAdmin;
