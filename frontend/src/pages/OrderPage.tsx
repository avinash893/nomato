import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import UserOrderMap from "../components/UserOrderMap";
import {
  BiArrowBack,
  BiCheckCircle,
  BiTime,
  BiPackage,
  BiCycling,
  BiMapPin,
  BiStore,
  BiRupee,
  BiPhoneCall,
  BiLoaderAlt,
} from "react-icons/bi";

const STEPS = [
  { key: "placed", label: "Placed", icon: BiTime },
  { key: "accepted", label: "Confirmed", icon: BiCheckCircle },
  { key: "preparing", label: "Kitchen Preparing", icon: BiPackage },
  { key: "picked_up", label: "Out for Delivery", icon: BiCycling },
  { key: "delivered", label: "Delivered", icon: BiCheckCircle },
];

const getStepIndex = (status: string) => {
  switch (status) {
    case "placed":
      return 0;
    case "accepted":
      return 1;
    case "preparing":
      return 2;
    case "ready_for_rider":
    case "rider_assigned":
      return 2;
    case "picked_up":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
};

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    const onRiderLocation = ({ latitude, longitude }: any) => {
      if (latitude && longitude) {
        setRiderLocation([latitude, longitude]);
      }
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="animate-spin text-red-500" size={28} />
        <p className="text-sm font-medium text-gray-500">Tracking your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <button
          onClick={() => navigate("/orders")}
          className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const deliveryLat = order.deliveryAddress?.latitude ?? 28.6139;
  const deliveryLng = order.deliveryAddress?.longitude ?? 77.209;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition cursor-pointer shrink-0"
        >
          <BiArrowBack size={20} />
        </button>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
            Order Tracking
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            #{order._id.slice(-6).toUpperCase()}
          </h1>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              {order.status === "delivered"
                ? "Delivered Successfully! 🎉"
                : order.status === "picked_up"
                ? "Your rider is on the way! 🛵"
                : "Kitchen is preparing your meal 🍳"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Estimated delivery: 25-35 minutes
            </p>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center pt-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-red-600 text-white shadow-md shadow-red-200 ring-4 ring-red-100"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold leading-tight ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Map when rider assigned */}
      {(order.status === "rider_assigned" || order.status === "picked_up") && (
        <UserOrderMap
          riderLocation={riderLocation || [deliveryLat + 0.005, deliveryLng + 0.005]}
          deliveryLocation={[deliveryLat, deliveryLng]}
        />
      )}

      {/* Rider contact card if assigned */}
      {order.riderName && (
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
              <BiCycling size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Delivery Partner
              </span>
              <h4 className="text-sm font-bold text-gray-900">{order.riderName}</h4>
            </div>
          </div>

          {order.riderPhone && (
            <a
              href={`tel:${order.riderPhone}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              <BiPhoneCall size={16} />
              <span>Call Partner</span>
            </a>
          )}
        </div>
      )}

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Items */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BiStore size={18} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">{order.restaurantName}</h3>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-gray-700 font-medium">
                  {item.quauntity}x {item.name}
                </span>
                <span className="text-gray-900 font-bold">₹{item.price * item.quauntity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-2">
            <BiMapPin size={16} className="shrink-0 text-red-500 mt-0.5" />
            <p className="line-clamp-2">{order.deliveryAddress?.fromattedAddress}</p>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Payment Breakdown</h3>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Item Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span>₹{order.platfromFee}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <div className="flex items-center text-red-600">
                <BiRupee size={16} />
                <span>{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-block rounded-xl bg-gray-50 border border-gray-200 px-3 py-1 text-[11px] font-bold text-gray-600">
              Paid via {order.paymentMethod?.toUpperCase()} • {order.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
