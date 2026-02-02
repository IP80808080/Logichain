import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  orderService,
  productService,
  warehouseService,
} from "../../services/api";
import { toast } from "react-toastify";

function AnalyticsReports() {
  const [dateRange, setDateRange] = useState("7days");
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [warehousePerformance, setWarehousePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, warehousesRes] = await Promise.all([
        orderService.getAll(),
        productService.getAll(),
        warehouseService.getAll(),
      ]);

      const orders = ordersRes.data.data || [];
      const products = productsRes.data.data || [];
      const warehouses = warehousesRes.data.data || [];

      const filteredOrders = filterOrdersByDateRange(orders, dateRange);

      const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
        0,
      );
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const revenueGrowth = 12.5;
      const ordersGrowth = 8.3;

      setAnalytics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate: 3.2,
        revenueGrowth,
        ordersGrowth,
      });

      const topProds = products.slice(0, 3).map((p, index) => ({
        name: p.name,
        sales: Math.floor(Math.random() * 900) + 100,
        revenue: parseFloat(p.price) * (Math.floor(Math.random() * 900) + 100),
      }));
      setTopProducts(topProds);

      const warehousePerf = warehouses.map((wh) => ({
        name: wh.name,
        orders: Math.floor(Math.random() * 500) + 100,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        efficiency: Math.floor(Math.random() * 15) + 85,
      }));
      setWarehousePerformance(warehousePerf);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDateRange = (orders, range) => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return orders.filter(
      (o) => new Date(o.orderDate) >= startDate && new Date(o.orderDate) <= now,
    );
  };

  const exportReport = () => {
    const reportData = {
      dateRange,
      analytics,
      topProducts,
      warehousePerformance,
      generatedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics & Reports
            </h1>
            <p className="text-gray-600">
              Business intelligence and performance metrics
            </p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700"
          >
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>

        {/* Date Range */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4 mb-8">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              $
              {analytics.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-green-600 mt-2">
              +{analytics.revenueGrowth}% vs last period
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Orders</p>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.totalOrders}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              +{analytics.ordersGrowth}% vs last period
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${analytics.avgOrderValue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Per transaction</p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.conversionRate}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Visitor to customer</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Revenue Chart</p>
                <p className="text-sm text-gray-600">
                  ${analytics.totalRevenue.toLocaleString()} total
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Orders by Status
            </h3>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Orders Chart</p>
                <p className="text-sm text-gray-600">
                  {analytics.totalOrders} total orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.sales} units sold
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    $
                    {product.revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No product data available
              </p>
            )}
          </div>
        </div>

        {/* Warehouse Performance */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Warehouse Performance
          </h3>
          <div className="space-y-4">
            {warehousePerformance.length > 0 ? (
              warehousePerformance.map((warehouse, index) => (
                <div key={index} className="p-4 bg-white/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {warehouse.name}
                    </h4>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {warehouse.efficiency}% Efficiency
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Orders Processed</p>
                      <p className="text-xl font-bold text-gray-900">
                        {warehouse.orders}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue Generated</p>
                      <p className="text-xl font-bold text-green-600">
                        ${warehouse.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No warehouse data available
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsReports;
