import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../config";
import toast from "react-hot-toast";
import type { IOrder } from "../types";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import {
  BiCycling,
  BiUpload,
  BiCheckCircle,
  BiPowerOff,
  BiIdCard,
  BiPhone,
  BiLoaderAlt,
} from "react-icons/bi";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  // Registration Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentOrder(data.order || null);
    } catch {
      setCurrentOrder(null);
    }
  };

  const fetchPendingOrders = async () => {
    if (!profile?.isAvailble || currentOrder) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(
        `${riderService}/api/rider/order/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderIds = (data.orders || []).map((o: any) => o._id);
      if (orderIds.length > 0) {
        setIncomingOrders((prev) => Array.from(new Set([...prev, ...orderIds])));
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
      fetchCurrentOrder();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Join riders socket room and listen to available orders
  useEffect(() => {
    if (!socket) return;

    socket.emit("join", "riders");

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      if (!orderId) return;
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 20000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket]);

  // Polling fallback to guarantee pending orders are never missed
  useEffect(() => {
    if (!profile?.isAvailble || currentOrder) return;

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 3000);
    return () => clearInterval(interval);
  }, [profile?.isAvailble, currentOrder]);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      toast.error("Location permission is required to go online");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = localStorage.getItem("token");
          await axios.patch(
            `${riderService}/api/rider/toggle`,
            {
              isAvailble: !profile?.isAvailble,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          toast.success(
            profile?.isAvailble
              ? "You are now OFFLINE"
              : "You are now ONLINE and ready for orders! 🛵"
          );
          fetchProfile();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
          setToggling(false);
        }
      },
      () => {
        // Fallback with default coordinates if browser denies permission
        const token = localStorage.getItem("token");
        axios
          .patch(
            `${riderService}/api/rider/toggle`,
            {
              isAvailble: !profile?.isAvailble,
              latitude: 28.6139,
              longitude: 77.209,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            toast.success(
              profile?.isAvailble
                ? "You are now OFFLINE"
                : "You are now ONLINE and ready for orders! 🛵"
            );
            fetchProfile();
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Status toggle failed");
          })
          .finally(() => {
            setToggling(false);
          });
      }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber) {
      toast.error("Please fill all required KYC fields");
      return;
    }

    if (!image) {
      toast.error("Please upload your profile photo / ID proof");
      return;
    }

    setSubmitting(true);

    const submitFormData = (lat: number, lng: number) => {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", lat.toString());
      formData.append("longitude", lng.toString());
      formData.append("file", image);

      const token = localStorage.getItem("token");
      axios
        .post(`${riderService}/api/rider/new`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then(({ data }) => {
          toast.success(data.message || "Rider profile registered!");
          fetchProfile();
        })
        .catch((error: any) => {
          toast.error(error.response?.data?.message || "Registration failed");
        })
        .finally(() => {
          setSubmitting(false);
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submitFormData(pos.coords.latitude, pos.coords.longitude),
        () => submitFormData(28.6139, 77.209)
      );
    } else {
      submitFormData(28.6139, 77.209);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="animate-spin text-red-500" size={28} />
        <p className="text-sm font-medium text-gray-500">Loading delivery partner portal...</p>
      </div>
    );
  }

  // Registration Form
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-20 pt-8 px-4 sm:px-6">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <BiCycling size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Rider KYC Registration</h1>
            <p className="text-xs text-gray-500">
              Register as a verified Nomato delivery partner and start earning today.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Contact Number</label>
              <div className="relative">
                <BiPhone className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Aadhaar Card Number</label>
              <div className="relative">
                <BiIdCard className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="12-digit Aadhaar Number"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Driving License Number</label>
              <div className="relative">
                <BiIdCard className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="DL Number (e.g. DL-1420110012345)"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Profile Photo / ID Proof</label>
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:bg-gray-50 cursor-pointer transition">
                <BiUpload className="text-red-500" size={24} />
                <span className="text-xs font-bold text-gray-600">
                  {image ? image.name : "Select photo from device"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? "Registering..." : "Submit KYC & Register"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Registered Rider Dashboard
  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-center gap-4">
          <img
            src={profile.picture || user?.image}
            alt="Rider"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-900">{user?.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <BiCheckCircle size={14} />
                <span>Verified Partner</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">{profile.phoneNumber}</p>
          </div>
        </div>

        {/* Online / Offline Switch */}
        {!currentOrder && (
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-lg transition cursor-pointer ${
                profile.isAvailble
                  ? "bg-gray-800 hover:bg-black shadow-gray-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              }`}
            >
              <BiPowerOff size={18} />
              <span>
                {toggling
                  ? "Updating GPS Status..."
                  : profile.isAvailble
                  ? "Go Offline (End Shift)"
                  : "Go Online (Start Receiving Orders)"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Incoming Orders Popups */}
      {profile.isAvailble && incomingOrders.length > 0 && !currentOrder && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Available Delivery Requests ({incomingOrders.length})</span>
          </h3>
          {incomingOrders.map((orderId) => (
            <RiderOrderRequest
              key={orderId}
              orderId={orderId}
              onAccepted={() => {
                setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
                fetchProfile();
                fetchCurrentOrder();
              }}
            />
          ))}
        </div>
      )}

      {/* Active Order In Progress */}
      {currentOrder && (
        <div className="space-y-4">
          <RiderCurrentOrder
            order={currentOrder}
            onStatusUpdate={fetchCurrentOrder}
          />
          <RiderOrderMap order={currentOrder} />
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
