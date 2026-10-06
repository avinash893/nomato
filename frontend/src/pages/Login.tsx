import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { authService } from "../config";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);

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

      if (result.data.user && result.data.user.role) {
        if (result.data.user.role === "seller") navigate("/restaurant");
        else if (result.data.user.role === "rider") navigate("/rider");
        else if (result.data.user.role === "admin") navigate("/admin");
        else navigate("/");
      } else {
        // Direct to select-role page after Google signup
        navigate("/select-role");
      }
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
        <div className="space-y-4 pt-2">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-3.5 px-4 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
          >
            <FcGoogle size={20} />
            <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
          </button>

          {/* Quick Demo Option for testing without Google account */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                const demoUser = {
                  _id: `guest_${Date.now()}`,
                  name: "Guest Explorer",
                  email: "guest@nomato.com",
                  role: "",
                  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                };
                localStorage.setItem("token", `demo_token_${btoa(JSON.stringify(demoUser))}`);
                localStorage.setItem("demo_user", JSON.stringify(demoUser));
                setIsAuth(true);
                setUser(demoUser);
                navigate("/select-role");
              }}
              className="text-xs font-semibold text-gray-400 hover:text-red-600 transition cursor-pointer underline underline-offset-4"
            >
              Or explore in Guest Demo Mode →
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-400 text-[11px] leading-relaxed pt-4 border-t border-gray-100">
          By continuing, you agree to Nomato's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
