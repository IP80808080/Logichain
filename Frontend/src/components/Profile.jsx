import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Phone,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { toast } from "react-toastify";
import { profileService } from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      setInitializing(true);

      // Try to fetch profile from backend
      const response = await profileService.getCurrentProfile();
      const profileData = response.data.data;

      // Update localStorage with fresh data
      const updatedUser = {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
        createdAt: profileData.createdAt,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setFormData({
        username: profileData.username || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        role: profileData.role || "CUSTOMER",
      });
    } catch (error) {
      console.error("Error fetching profile from backend:", error);

      // Fallback to localStorage if backend fails
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "CUSTOMER",
        });

        toast.warning(
          "Using cached profile data. Some features may be limited.",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
      } else {
        toast.error("Session expired. Please login again.", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setInitializing(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.username || !formData.username.trim()) {
        toast.error("Username is required", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!formData.email || !formData.email.trim()) {
        toast.error("Email is required", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Phone validation (if provided)
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error("Please enter a valid phone number", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
      }

      setLoading(true);

      // Call backend API to update profile
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : "",
      };

      const response = await profileService.updateProfile(updateData);
      const updatedProfile = response.data.data;

      // Update localStorage with response data
      const updatedUser = {
        ...user,
        username: updatedProfile.username,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile. Please try again.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      // Validation
      if (
        !passwordData.currentPassword ||
        !passwordData.currentPassword.trim()
      ) {
        toast.error("Current password is required", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
        toast.error("New password is required", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (
        !passwordData.confirmPassword ||
        !passwordData.confirmPassword.trim()
      ) {
        toast.error("Please confirm your new password", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New passwords do not match", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        toast.error("New password must be different from current password", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      // Call backend API to change password
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form and close modal
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Error changing password:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to change password. Please check your current password.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    // Reset form to original user data
    setFormData({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "CUSTOMER",
    });
    setEditing(false);

    toast.info("Changes cancelled", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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

  const getRoleName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "WAREHOUSE_MANAGER":
        return "Warehouse Manager";
      case "CUSTOMER_SUPPORT":
        return "Customer Support";
      case "CUSTOMER":
        return "Customer";
      default:
        return role || "User";
    }
  };

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return new Date().toLocaleDateString();

    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading state while initializing
  if (initializing) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if user data is missing
  if (!user || !user.email) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Profile Not Found
              </h2>
              <p className="text-red-700 mb-4">
                Unable to load your profile data.
              </p>
              <a
                href="/login"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={formData.role || "CUSTOMER"}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {(formData.username || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">
                  {formData.username || "User"}
                </h1>
                <p className="text-blue-100 mt-1">{formData.email}</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getRoleColor(formData.role)}`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  {getRoleName(formData.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 text-black bg-gray-50 rounded-lg">
                    {formData.username || "Not set"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 text-black bg-gray-50 rounded-lg">
                    {formData.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 text-black bg-gray-50 rounded-lg">
                    {formData.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* Role - Non-editable */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Role
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(formData.role)}`}
                  >
                    {getRoleName(formData.role)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Role cannot be changed. Contact an administrator if you need a
                  role change.
                </p>
              </div>

              {/* Member Since - Non-editable */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member Since
                </label>
                <p className="px-4 py-2 text-black bg-gray-50 rounded-lg">
                  {formatMemberSince(user.createdAt)}
                </p>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
          <p className="text-gray-600 mb-4">
            Manage your password and security settings
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </button>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>
                <button
                  onClick={closePasswordModal}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-4 py-2 pr-10 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-4 py-2 pr-10 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-4 py-2 pr-10 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Changing...
                      </div>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                  <button
                    onClick={closePasswordModal}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
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

export default Profile;
