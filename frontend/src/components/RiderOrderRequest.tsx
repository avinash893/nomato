import { useEffect, useState } from "react";
import { riderService } from "../config";
import axios from "axios";
import toast from "react-hot-toast";
import { BiCycling, BiTimer } from "react-icons/bi";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order accepted! Ride safely 🎉");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Order already taken");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg border-2 border-emerald-400 space-y-4 animate-bounce-short">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <BiCycling size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600">
              New Delivery Opportunity
            </h4>
            <p className="text-xs text-gray-500 font-bold">
              Order #{orderId.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          <BiTimer size={16} />
          <span>{secondsLeft}s</span>
        </div>
      </div>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
      >
        {accepting ? "Accepting..." : "Accept Delivery"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
