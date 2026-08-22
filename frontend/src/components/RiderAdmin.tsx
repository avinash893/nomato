import { useState } from "react";
import axios from "axios";
import { adminService } from "../config";
import toast from "react-hot-toast";
import { BiPhone, BiIdCard, BiCheckCircle, BiCycling } from "react-icons/bi";

interface RiderAdminProps {
  rider: any;
  onVerify: () => void;
}

const RiderAdmin: React.FC<RiderAdminProps> = ({ rider, onVerify }) => {
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    try {
      setVerifying(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Delivery partner verified successfully!");
      onVerify();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify rider");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={rider.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
          alt="Rider KYC Photo"
          className="h-20 w-20 rounded-2xl object-cover border border-gray-100 shrink-0"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BiCycling size={14} />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">
              Partner #{rider._id.slice(-6).toUpperCase()}
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-bold flex items-center gap-1.5">
            <BiPhone size={14} className="text-gray-400" />
            <span>{rider.phoneNumber}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50/70 p-3.5 border border-gray-100 space-y-1.5 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <BiIdCard size={14} />
            Aadhaar Number
          </span>
          <span className="font-mono font-bold text-gray-800">{rider.aadharNumber}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <BiIdCard size={14} />
            Driving License
          </span>
          <span className="font-mono font-bold text-gray-800">{rider.drivingLicenseNumber}</span>
        </div>
      </div>

      <button
        disabled={verifying}
        onClick={verify}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
      >
        <BiCheckCircle size={18} />
        <span>{verifying ? "Approving..." : "Approve & Activate Partner"}</span>
      </button>
    </div>
  );
};

export default RiderAdmin;
