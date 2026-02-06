import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/api";
import { toast } from "react-toastify";

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [approvingUser, setApprovingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    phone: "",
    password: "",
  });

  const [approvalData, setApprovalData] = useState({
    approvalStatus: "",
    rejectionReason: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();

      let usersData = [];

      if (response.data.data) {
        usersData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      }

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch users. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.username || !formData.email || !formData.role) {
        toast.error("Please fill in all required fields", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      if (editingUser) {
        const updatePayload = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || null,
        };

        if (formData.password && formData.password.trim()) {
          updatePayload.password = formData.password;
        }

        const response = await userService.update(
          editingUser.id,
          updatePayload,
        );

        if (response.data.success) {
          toast.success(response.data.message || "User updated successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        if (!formData.password || !formData.password.trim()) {
          toast.error("Password is required for new users", {
            position: "top-right",
            autoClose: 3000,
          });
          setLoading(false);
          return;
        }

        const createPayload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || null,
        };

        const response = await userService.create(createPayload);

        if (response.data.success) {
          toast.success(response.data.message || "User created successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }

      await fetchUsers();

      setFormData({
        username: "",
        email: "",
        role: "",
        phone: "",
        password: "",
      });
      setEditingUser(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save user. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      password: "",
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        const response = await userService.delete(id);

        if (response.data.success) {
          toast.success(response.data.message || "User deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }

        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete user. Please try again.",
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApprovalClick = (user) => {
    setApprovingUser(user);
    setApprovalData({
      approvalStatus: user.approvalStatus || "PENDING",
      rejectionReason: user.rejectionReason || "",
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      if (!approvalData.approvalStatus) {
        toast.error("Please select an approval status", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (
        approvalData.approvalStatus === "REJECTED" &&
        !approvalData.rejectionReason.trim()
      ) {
        toast.error("Please provide a rejection reason", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      setLoading(true);

      const updatePayload = {
        approvalStatus: approvalData.approvalStatus,
        rejectionReason:
          approvalData.approvalStatus === "REJECTED"
            ? approvalData.rejectionReason
            : null,
      };

      const response = await userService.update(
        approvingUser.id,
        updatePayload,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "User approval status updated successfully!",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
      }

      await fetchUsers();

      setApprovalData({
        approvalStatus: "",
        rejectionReason: "",
      });
      setApprovingUser(null);
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update approval status. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700";
      case "WAREHOUSE_MANAGER":
        return "bg-blue-100 text-blue-700";
      case "CUSTOMER_SUPPORT":
        return "bg-purple-100 text-purple-700";
      case "CUSTOMER":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterRole === "All" || user.role === filterRole;
        return matchesSearch && matchesFilter;
      })
    : [];

  const roleCounts = {
    ADMIN: Array.isArray(users)
      ? users.filter((u) => u.role === "ADMIN").length
      : 0,
    WAREHOUSE_MANAGER: Array.isArray(users)
      ? users.filter((u) => u.role === "WAREHOUSE_MANAGER").length
      : 0,
    CUSTOMER_SUPPORT: Array.isArray(users)
      ? users.filter((u) => u.role === "CUSTOMER_SUPPORT").length
      : 0,
    CUSTOMER: Array.isArray(users)
      ? users.filter((u) => u.role === "CUSTOMER").length
      : 0,
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Create, edit, and manage user accounts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.isArray(users) ? users.length : 0}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <p className="text-xs text-gray-600 mb-1">Admins</p>
            <p className="text-2xl font-bold text-red-600">
              {roleCounts.ADMIN}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <p className="text-xs text-gray-600 mb-1">Managers</p>
            <p className="text-2xl font-bold text-blue-600">
              {roleCounts.WAREHOUSE_MANAGER}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <p className="text-xs text-gray-600 mb-1">Support</p>
            <p className="text-2xl font-bold text-purple-600">
              {roleCounts.CUSTOMER_SUPPORT}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <p className="text-xs text-gray-600 mb-1">Customers</p>
            <p className="text-2xl font-bold text-green-600">
              {roleCounts.CUSTOMER}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 text-black pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-3 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                <option value="CUSTOMER_SUPPORT">Customer Support</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  username: "",
                  email: "",
                  role: "",
                  phone: "",
                  password: "",
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Approval Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-white/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.username?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {user.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}
                          >
                            {user.role?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(user.approvalStatus)}`}
                          >
                            {getApprovalStatusIcon(user.approvalStatus)}
                            {user.approvalStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprovalClick(user)}
                              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                              title="Manage Approval"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Delete User"
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
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="WAREHOUSE_MANAGER">
                        Warehouse Manager
                      </option>
                      <option value="CUSTOMER_SUPPORT">Customer Support</option>
                      <option value="CUSTOMER">Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 234-567-8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser
                      ? "New Password (leave blank to keep current)"
                      : "Password *"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required={!editingUser}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingUser
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Status Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-lg w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Manage Approval Status
                  </h2>
                  <p className="text-sm text-gray-600">
                    {approvingUser?.username} ({approvingUser?.email})
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Status *
                  </label>
                  <select
                    value={approvalData.approvalStatus}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        approvalStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {approvalData.approvalStatus === "REJECTED" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={approvalData.rejectionReason}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          rejectionReason: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                      placeholder="Please provide a reason for rejection..."
                      rows="4"
                      required
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Current Status:</strong>{" "}
                    {approvingUser?.approvalStatus}
                  </p>
                  {approvingUser?.rejectionReason && (
                    <p className="text-sm text-blue-800 mt-2">
                      <strong>Previous Reason:</strong>{" "}
                      {approvingUser.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setApprovingUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprovalSubmit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Status"}
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

export default UserManagement;
