import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { authService } from "../config";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import {
  BiShoppingBag,
  BiStore,
  BiCycling,
  BiShieldQuarter,
  BiUser,
} from "react-icons/bi";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");

  const navigate = useNavigate();
  const { setIsAuth, setUser } = useAppData();

  const responseGoogle = async (authResult: { code: string }) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);
      setIsAuth(true);
      setUser(result.data.user);
      toast.success(result.data.message || "Signed in with Google!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google Login failed"),
    flow: "auth-code",
  });

  const handleQuickLogin = async (role: "customer" | "seller" | "rider" | "admin") => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/demo`, {
        role,
        name: customName.trim() || undefined,
      });

      localStorage.setItem("token", result.data.token);
      setIsAuth(true);
      setUser(result.data.user);
      toast.success(`Welcome to Nomato, ${result.data.user.name}! 🎉`);

      if (role === "seller") navigate("/restaurant");
      else if (role === "rider") navigate("/rider");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-slate-50 to-orange-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-red-600 text-white text-3xl shadow-lg shadow-red-200">
            🍅
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Welcome to Nomato
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Order food from top kitchens, manage restaurants, or deliver orders in real time.
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-3.5 px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
          >
            <FcGoogle size={20} />
            <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 shrink-0">
            Or Quick 1-Click Login
          </span>
          <div className="border-t border-gray-200 w-full" />
        </div>

        {/* 1-Click Role Logins */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            disabled={loading}
            onClick={() => handleQuickLogin("customer")}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/80 hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-[0.98] transition cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-xs group-hover:bg-red-600 group-hover:text-white transition">
              <BiShoppingBag size={18} />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-900 group-hover:text-red-600">Customer</span>
              <span className="text-[10px] text-gray-400 block font-medium">Browse & Order</span>
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => handleQuickLogin("seller")}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/80 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 active:scale-[0.98] transition cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-xs group-hover:bg-amber-600 group-hover:text-white transition">
              <BiStore size={18} />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-900 group-hover:text-amber-700">Restaurant</span>
              <span className="text-[10px] text-gray-400 block font-medium">Partner Portal</span>
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => handleQuickLogin("rider")}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.98] transition cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition">
              <BiCycling size={18} />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-900 group-hover:text-emerald-700">Delivery Rider</span>
              <span className="text-[10px] text-gray-400 block font-medium">Earn on Trips</span>
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => handleQuickLogin("admin")}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/80 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 active:scale-[0.98] transition cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-xs group-hover:bg-purple-600 group-hover:text-white transition">
              <BiShieldQuarter size={18} />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-900 group-hover:text-purple-700">Admin</span>
              <span className="text-[10px] text-gray-400 block font-medium">Governance</span>
            </div>
          </button>
        </div>

        {/* Optional Custom Display Name */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3.5 py-2.5 border border-gray-200">
            <BiUser className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Custom display name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-400 text-[11px] leading-relaxed">
          By continuing, you agree to Nomato's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
