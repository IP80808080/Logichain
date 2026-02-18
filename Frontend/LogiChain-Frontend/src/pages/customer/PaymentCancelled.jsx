import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

function PaymentCancelled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Payment was cancelled. Order #{orderId} is pending payment.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate("/new-order")}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Shop More
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelled;
