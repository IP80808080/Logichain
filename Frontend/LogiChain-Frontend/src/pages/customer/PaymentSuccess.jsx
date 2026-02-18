import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { paymentService } from "../../services/api";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [confirming, setConfirming] = useState(true);

  const confirmPayment = async () => {
    try {
      await paymentService.confirmPayment(orderId);
      toast.success("Payment successful!");
      setConfirming(false);
      setTimeout(() => navigate("/my-orders"), 2000);
    } catch (error) {
      toast.error("Payment confirmation failed");
      setConfirming(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      navigate("/my-orders");
      return;
    }
    confirmPayment();
  }, [orderId]);

  if (confirming) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Confirming payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your order #{orderId} has been confirmed.
        </p>
        <button
          onClick={() => navigate("/my-orders")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          View Orders
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
