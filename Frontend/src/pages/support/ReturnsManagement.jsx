import { useState, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  DollarSign,
  Package,
  User,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { returnService } from "../../services/api";
import { toast } from "react-toastify";

function ReturnsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await returnService.getAll();
      setReturns(response.data.data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (returnId, newStatus) => {
    try {
      const returnItem = returns.find((r) => r.id === returnId);
      await returnService.update(returnId, {
        ...returnItem,
        returnStatus: newStatus,
      });
      toast.success(`Return status updated to ${newStatus}`);
      setSelectedReturn(null);
      fetchReturns();
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error("Failed to update return status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "RECEIVED":
        return "bg-blue-100 text-blue-700";
      case "REFUNDED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.order?.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ret.order?.customer?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || ret.returnStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    All: returns.length,
    REQUESTED: returns.filter((r) => r.returnStatus === "REQUESTED").length,
    APPROVED: returns.filter((r) => r.returnStatus === "APPROVED").length,
    REJECTED: returns.filter((r) => r.returnStatus === "REJECTED").length,
    RECEIVED: returns.filter((r) => r.returnStatus === "RECEIVED").length,
    REFUNDED: returns.filter((r) => r.returnStatus === "REFUNDED").length,
  };

  if (loading) {
    return (
      <DashboardLayout role="CUSTOMER_SUPPORT">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading returns...</p>
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
            Returns Management
          </h1>
          <p className="text-gray-600">
            Approve or reject customer return requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Total Returns</p>
            <p className="text-2xl font-bold text-gray-900">
              {statusCounts.All}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Requested</p>
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.REQUESTED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.APPROVED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {statusCounts.REJECTED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Received</p>
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts.RECEIVED}
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4">
            <p className="text-xs text-gray-600 mb-1">Refunded</p>
            <p className="text-2xl font-bold text-purple-600">
              {statusCounts.REFUNDED}
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
                placeholder="Search by return number, order number, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 text-black pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/50 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Returns</option>
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="RECEIVED">Received</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Returns List */}
        <div className="space-y-4">
          {filteredReturns.length === 0 ? (
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <RotateCcw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No returns found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredReturns.map((returnItem) => (
              <div
                key={returnItem.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Return Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                        <RotateCcw className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {returnItem.returnNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnItem.returnStatus)}`}
                          >
                            {returnItem.returnStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Order: {returnItem.order?.orderNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-blue-600" />
                          <p className="text-xs text-gray-600">Customer</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {returnItem.order?.customer?.username || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {returnItem.order?.customer?.email || ""}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <p className="text-xs text-gray-600">Refund Amount</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(returnItem.refundAmount || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <p className="text-xs text-gray-600">Requested</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {returnItem.requestedAt
                            ? new Date(
                                returnItem.requestedAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-orange-600" />
                          <p className="text-xs text-gray-600">Created</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {returnItem.createdAt
                            ? new Date(
                                returnItem.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">
                        Return Reason:
                      </p>
                      <p className="text-sm text-gray-700">
                        {returnItem.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                      onClick={() => setSelectedReturn(returnItem)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Review Details
                    </button>

                    {returnItem.returnStatus === "REQUESTED" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(returnItem.id, "APPROVED")
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve Return
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(returnItem.id, "REJECTED")
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Return
                        </button>
                      </>
                    )}
                    {returnItem.returnStatus === "APPROVED" && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-center font-semibold">
                        ✓ Approved
                      </div>
                    )}
                    {returnItem.returnStatus === "REJECTED" && (
                      <div className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-center font-semibold">
                        ✗ Rejected
                      </div>
                    )}
                    {returnItem.returnStatus === "RECEIVED" && (
                      <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-center font-semibold">
                        ✓ Received
                      </div>
                    )}
                    {returnItem.returnStatus === "REFUNDED" && (
                      <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-center font-semibold">
                        ✓ Refunded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedReturn && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Return Request Details
              </h2>

              <div className="space-y-6">
                {/* Return Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Return Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Return Number
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.returnNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Number</p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.order?.orderNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReturn.returnStatus)}`}
                      >
                        {selectedReturn.returnStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Refund Amount
                      </p>
                      <p className="font-semibold text-gray-900 text-xl text-green-600">
                        $
                        {parseFloat(selectedReturn.refundAmount || 0).toFixed(
                          2,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Customer Name
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.order?.customer?.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.order?.customer?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.order?.customer?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Requested At</p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.requestedAt
                          ? new Date(
                              selectedReturn.requestedAt,
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created At</p>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.createdAt
                          ? new Date(selectedReturn.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Reason */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Return Reason
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedReturn.reason}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-white rounded-xl hover:bg-gray-300"
                  >
                    Close
                  </button>
                  {selectedReturn.returnStatus === "REQUESTED" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(selectedReturn.id, "APPROVED")
                        }
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Return
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(selectedReturn.id, "REJECTED")
                        }
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Return
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ReturnsManagement;
