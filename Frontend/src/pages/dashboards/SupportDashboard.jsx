import { useState, useEffect } from "react";
import { Package, RotateCcw, Users, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, returnService, userService } from "../../services/api";
import { toast } from "react-toastify";

function SupportDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    returnRequests: 0,
    customers: 0,
    urgentIssues: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, returnsRes, usersRes] = await Promise.all([
        orderService.getAll(),
        returnService.getAll(),
        userService.getAll(),
      ]);

      const orders = ordersRes.data.data || [];
      const returns = returnsRes.data.data || [];
      const users = usersRes.data.data || [];

      const today = new Date().toISOString().split("T")[0];
      const ordersToday = orders.filter((order) => {
        const orderDate = new Date(order.orderDate).toISOString().split("T")[0];
        return orderDate === today;
      }).length;

      const pendingReturns = returns.filter(
        (r) => r.returnStatus === "REQUESTED",
      );

      const customers = users.filter((u) => u.role === "CUSTOMER");

      const urgentIssues = pendingReturns.length;

      setStats({
        ordersToday: ordersToday,
        returnRequests: pendingReturns.length,
        customers: customers.length,
        urgentIssues: urgentIssues,
      });

      const recent = orders
        .filter(
          (o) => o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED",
        )
        .slice(0, 3);
      setRecentOrders(recent);

      setReturnRequests(pendingReturns.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (returnId) => {
    try {
      const returnItem = returnRequests.find((r) => r.id === returnId);
      await returnService.update(returnId, {
        ...returnItem,
        returnStatus: "APPROVED",
      });
      toast.success("Return approved successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving return:", error);
      toast.error("Failed to approve return");
    }
  };

  const handleRejectReturn = async (returnId) => {
    try {
      const returnItem = returnRequests.find((r) => r.id === returnId);
      await returnService.update(returnId, {
        ...returnItem,
        returnStatus: "REJECTED",
      });
      toast.success("Return rejected successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting return:", error);
      toast.error("Failed to reject return");
    }
  };

  const statsConfig = [
    {
      title: "Orders Today",
      value: stats.ordersToday,
      icon: Package,
      textColor: "text-[#2B7FFF]",
      color: "bg-blue-500",
    },
    {
      title: "Return Requests",
      value: stats.returnRequests,
      icon: RotateCcw,
      textColor: "text-[#FF6900]",
      color: "bg-orange-500",
    },
    {
      title: "Customers",
      value: stats.customers,
      icon: Users,
      textColor: "text-[#00C950]",
      color: "bg-green-500",
    },
    {
      title: "Urgent Issues",
      value: stats.urgentIssues,
      icon: AlertCircle,
      textColor: "text-[#FB2C36]",
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER_SUPPORT">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="CUSTOMER_SUPPORT">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-gray-600">Manage customer orders and returns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Support Tickets & Return Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Support Tickets (Recent Orders) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl text-black font-bold mb-4">
            Recent Support Tickets
          </h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-black text-sm text-center py-4">
                No recent tickets
              </p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-black">
                      {order.orderNumber}
                    </p>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Customer: {order.customer?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Amount: ${parseFloat(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => (window.location.href = "/support/orders")}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Contact
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Return Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl text-black font-bold mb-4">Return Requests</h2>
          <div className="space-y-3">
            {returnRequests.length === 0 ? (
              <p className="text-black text-sm text-center py-4">
                No pending return requests
              </p>
            ) : (
              returnRequests.map((returnItem) => (
                <div key={returnItem.id} className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-black">
                      {returnItem.returnNumber}
                    </p>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {returnItem.returnStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Order: {returnItem.order?.orderNumber || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Reason: {returnItem.reason?.substring(0, 50)}...
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReturn(returnItem.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectReturn(returnItem.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SupportDashboard;
