import { useState } from "react";
import { Settings, Save, Mail, DollarSign, Shield, Bell } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { toast } from "react-toastify";
function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: "LogiChain",
      currency: "USD",
      timezone: "America/New_York",
      language: "en",
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUser: "noreply@logichain.com",
      fromName: "LogiChain",
    },
    notifications: {
      orderConfirmation: true,
      shipmentUpdates: true,
      lowStockAlerts: true,
      systemAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordExpiry: "90",
    },
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      localStorage.setItem("systemSettings", JSON.stringify(settings));

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Settings },
    { id: "email", name: "Email", icon: Mail },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure system preferences and integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-white hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    General Settings
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              siteName: e.target.value,
                            },
                          })
                        }
                        className="w-full text-black px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              currency: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              timezone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/New_York">EST (New York)</option>
                        <option value="America/Chicago">CST (Chicago)</option>
                        <option value="America/Los_Angeles">
                          PST (Los Angeles)
                        </option>
                        <option value="Asia/Kolkata">IST (India)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              language: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Email Configuration
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            email: {
                              ...settings.email,
                              smtpHost: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpPort}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              email: {
                                ...settings.email,
                                smtpPort: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP User
                        </label>
                        <input
                          type="email"
                          value={settings.email.smtpUser}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              email: {
                                ...settings.email,
                                smtpUser: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            email: {
                              ...settings.email,
                              fromName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 text-black bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-white/50 rounded-xl"
                        >
                          <span className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notifications: {
                                    ...settings.notifications,
                                    [key]: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900">
                          Two-Factor Authentication
                        </span>
                        <p className="text-sm text-gray-600">
                          Require 2FA for all admin users
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              security: {
                                ...settings.security,
                                twoFactorAuth: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              sessionTimeout: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordExpiry: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 text-black py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SystemSettings;
