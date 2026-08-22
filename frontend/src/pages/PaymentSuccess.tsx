import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle, BiShoppingBag, BiReceipt } from "react-icons/bi";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    if (fetchCart) fetchCart();
  }, [fetchCart]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <BiCheckCircle size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">Payment Successful! 🎉</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your payment was processed and the kitchen has received your order. Delivery partner assignment in progress!
          </p>
        </div>

        {paymentId && (
          <div className="rounded-2xl bg-gray-50 p-3.5 border border-gray-100 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Payment Transaction ID
            </span>
            <p className="font-mono text-xs text-gray-700 break-all font-semibold mt-0.5">
              {paymentId}
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 transition cursor-pointer"
          >
            <BiReceipt size={16} />
            <span>Track & View Orders</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          >
            <BiShoppingBag size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
