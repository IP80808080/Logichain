import { useState, useEffect } from "react";
import { Bell, Send, Mail, MessageSquare, Users, Plus } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { orderService, userService } from "../../services/api";
import { toast } from "react-toastify";

function Notifications() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    message: "",
    recipients: "",
    channel: "Email",
  });

  useEffect(() => {
    fetchNotifications();
    fetchCustomers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();

      const notificationData = response.data.map((order) => ({
        id: order.id,
        type: getNotificationType(order.status),
        title: `Order ${order.status} - ${order.orderNumber}`,
        message: generateNotificationMessage(order),
        recipients: order.customerName || "Customer",
        channel: "Email",
        status: "Sent",
        sentDate: new Date(order.updatedAt).toLocaleString(),
      }));

      setNotifications(notificationData);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await userService.getAll();
      setCustomers(response.data.filter((user) => user.role === "CUSTOMER"));
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const getNotificationType = (orderStatus) => {
    switch (orderStatus) {
      case "SHIPPED":
        return "Order Update";
      case "DELIVERED":
        return "Delivery";
      case "RETURN_APPROVED":
        return "Return Approved";
      default:
        return "Order Update";
    }
  };

  const generateNotificationMessage = (order) => {
    switch (order.status) {
      case "SHIPPED":
        return "Your order has been shipped and is on its way!";
      case "DELIVERED":
        return "Your order has been successfully delivered.";
      case "RETURN_APPROVED":
        return "Your return request has been approved. Please ship the item back.";
      case "PROCESSING":
        return "Your order is being processed and will ship soon.";
      default:
        return `Your order status has been updated to ${order.status}.`;
    }
  };

  const getMockNotifications = () => [
    {
      id: 1,
      type: "Order Update",
      title: "Order Shipped - ORD-1001",
      message: "Your order has been shipped and is on its way!",
      recipients: "Alice Williams",
      channel: "Email",
      status: "Sent",
      sentDate: "2026-01-24 10:30 AM",
    },
    {
      id: 2,
      type: "Delivery",
      title: "Order Delivered - ORD-1002",
      message: "Your order has been successfully delivered.",
      recipients: "Bob Johnson",
      channel: "SMS",
      status: "Sent",
      sentDate: "2026-01-24 02:45 PM",
    },
    {
      id: 3,
      type: "Return Approved",
      title: "Return Request Approved",
      message:
        "Your return request has been approved. Please ship the item back.",
      recipients: "Carol Smith",
      channel: "Email",
      status: "Sent",
      sentDate: "2026-01-23 11:20 AM",
    },
    {
      id: 4,
      type: "Promotional",
      title: "Special Offer - 20% Off",
      message: "Enjoy 20% off on your next purchase!",
      recipients: "All Customers",
      channel: "Email",
      status: "Scheduled",
      sentDate: "2026-01-26 09:00 AM",
    },
  ];

  const handleCreate = async () => {
    try {
      if (
        !formData.type ||
        !formData.title ||
        !formData.message ||
        !formData.recipients
      ) {
        toast.warn("Please fill in all required fields");
        return;
      }

      const newNotification = {
        id: notifications.length + 1,
        ...formData,
        status: "Sent",
        sentDate: new Date().toLocaleString(),
      };

      setNotifications([newNotification, ...notifications]);

      // Reset form
      setFormData({
        type: "",
        title: "",
        message: "",
        recipients: "",
        channel: "Email",
      });
      setShowCreateModal(false);

      // Show success message
      toast.success("Notification sent successfully!");
    } catch (err) {
      console.error("Error creating notification:", err);
      toast.error("Failed to send notification. Please try again.");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Order Update":
        return "bg-blue-100 text-blue-700";
      case "Delivery":
        return "bg-green-100 text-green-700";
      case "Return Approved":
        return "bg-purple-100 text-purple-700";
      case "Promotional":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Sent":
        return "bg-green-100 text-green-700";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "Email":
        return <Mail className="h-4 w-4" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const sentCount = notifications.filter((n) => n.status === "Sent").length;
  const scheduledCount = notifications.filter(
    (n) => n.status === "Scheduled",
  ).length;

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER_SUPPORT">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            Send updates and notifications to customers
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sent Today</p>
                <p className="text-3xl font-bold text-green-600">{sentCount}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <Send className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {scheduledCount}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-xl">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recipients</p>
                <p className="text-3xl font-bold text-blue-600">
                  {customers.length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Create Notification
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Send className="h-5 w-5" />
              Send Bulk Email
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
              <MessageSquare className="h-5 w-5" />
              SMS Campaign
            </button>
          </div>
        </div>

        {/* Notification Templates */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFormData({
                  type: "Order Update",
                  title: "Order Shipped",
                  message: "Your order has been shipped and is on its way!",
                  recipients: "",
                  channel: "Email",
                });
                setShowCreateModal(true);
              }}
              className="bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-blue-900 mb-2">Order Shipped</h3>
              <p className="text-sm text-blue-700">
                Notify customer their order is on the way
              </p>
            </div>
            <div
              onClick={() => {
                setFormData({
                  type: "Delivery",
                  title: "Order Delivered",
                  message: "Your order has been successfully delivered.",
                  recipients: "",
                  channel: "Email",
                });
                setShowCreateModal(true);
              }}
              className="bg-green-50 p-4 rounded-xl hover:bg-green-100 transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-green-900 mb-2">Order Delivered</h3>
              <p className="text-sm text-green-700">
                Confirm successful delivery to customer
              </p>
            </div>
            <div
              onClick={() => {
                setFormData({
                  type: "Return Approved",
                  title: "Return Request Approved",
                  message:
                    "Your return request has been approved. Please ship the item back.",
                  recipients: "",
                  channel: "Email",
                });
                setShowCreateModal(true);
              }}
              className="bg-purple-50 p-4 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-purple-900 mb-2">
                Return Approved
              </h3>
              <p className="text-sm text-purple-700">
                Inform customer about return approval
              </p>
            </div>
            <div
              onClick={() => {
                setFormData({
                  type: "Promotional",
                  title: "Special Offer",
                  message: "Enjoy special discounts on your next purchase!",
                  recipients: "All Customers",
                  channel: "Email",
                });
                setShowCreateModal(true);
              }}
              className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <h3 className="font-bold text-pink-900 mb-2">
                Promotional Offer
              </h3>
              <p className="text-sm text-pink-700">
                Share special deals and discounts
              </p>
            </div>
          </div>
        </div>

        {/* Notifications History */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Recent Notifications
          </h2>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found. Create your first notification above.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white/50 rounded-xl p-6 border border-white/20 hover:bg-white/70 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(notification.status)}`}
                          >
                            {notification.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {notification.sentDate}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3 ml-14">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-6 ml-14 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{notification.recipients}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {getChannelIcon(notification.channel)}
                      <span>{notification.channel}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create Notification
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="Order Update">Order Update</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Return Approved">Return Approved</option>
                    <option value="Promotional">Promotional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Order Shipped - ORD-1001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Enter your message here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <input
                      type="text"
                      value={formData.recipients}
                      onChange={(e) =>
                        setFormData({ ...formData, recipients: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Customer name or 'All Customers'"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) =>
                        setFormData({ ...formData, channel: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Push">Push Notification</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700"
                  >
                    Send Notification
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

export default Notifications;
