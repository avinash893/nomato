import { useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { authService } from "../config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BiShoppingBag,
  BiStore,
  BiCycling,
  BiShieldQuarter,
} from "react-icons/bi";

type Role = "customer" | "seller" | "rider" | "admin" | null;

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, setUser } = useAppData();
  const navigate = useNavigate();

  const roleCards: {
    id: "customer" | "seller" | "rider" | "admin";
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    border: string;
  }[] = [
    {
      id: "customer",
      title: "Customer",
      subtitle: "Browse & Order",
      icon: BiShoppingBag,
      color: "text-red-500",
      border: "border-red-500 bg-red-50/50",
    },
    {
      id: "seller",
      title: "Restaurant",
      subtitle: "Partner Portal",
      icon: BiStore,
      color: "text-amber-600",
      border: "border-amber-500 bg-amber-50/50",
    },
    {
      id: "rider",
      title: "Delivery Rider",
      subtitle: "Earn on Trips",
      icon: BiCycling,
      color: "text-emerald-600",
      border: "border-emerald-500 bg-emerald-50/50",
    },
    {
      id: "admin",
      title: "Admin",
      subtitle: "Governance",
      icon: BiShieldQuarter,
      color: "text-purple-600",
      border: "border-purple-500 bg-purple-50/50",
    },
  ];

  const addRole = async () => {
    if (!role) {
      toast.error("Please select a role to continue");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("demo_user", JSON.stringify(data.user));
      }

      toast.success(`Role selected: ${role.toUpperCase()}`);

      if (role === "seller") navigate("/restaurant", { replace: true });
      else if (role === "rider") navigate("/rider", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err: any) {
      console.warn("Backend update failed, applying role locally:", err);

      // Resilient local update for demo/preview
      const currentUser =
        user ||
        (localStorage.getItem("demo_user")
          ? JSON.parse(localStorage.getItem("demo_user")!)
          : null) || {
          _id: `user_${Date.now()}`,
          name: "Nomato User",
          email: "user@nomato.com",
        };
      const updatedUser = { ...currentUser, role };
      setUser(updatedUser);
      localStorage.setItem("demo_user", JSON.stringify(updatedUser));

      toast.success(`Role set to ${role.toUpperCase()}`);

      if (role === "seller") navigate("/restaurant", { replace: true });
      else if (role === "rider") navigate("/rider", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-slate-50 to-orange-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 space-y-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white text-2xl shadow-md shadow-red-200">
            🍅
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Select Your Role
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Choose how you'd like to use Nomato. You can switch roles anytime from your account settings.
          </p>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {roleCards.map((c) => {
            const Icon = c.icon;
            const isSelected = role === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setRole(c.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition cursor-pointer text-center ${
                  isSelected
                    ? `${c.border} shadow-sm`
                    : "border-gray-200 bg-gray-50/70 hover:border-gray-300 hover:bg-gray-100/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs ${c.color}`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold block text-gray-900">
                    {c.title}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-medium">
                    {c.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={addRole}
          disabled={!role || submitting}
          className="w-full rounded-2xl bg-red-600 py-3.5 px-4 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
        >
          {submitting ? "Saving..." : "Continue to Nomato"}
        </button>
      </div>
    </div>
  );
};

export default SelectRole;

