import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { authService } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const responseGoogle = async (authResult: { code: string }) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google Login failed"),
    flow: "auth-code",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-3xl font bold text-[#333]">Nomato</h1>
        <p className="text-center text-gray-500">
          login or sign up with google to continue
        </p>
        <button
          onClick={googleLogin}
          disabled={loading}
          className="w-full rounded bg-[#4285F4] px-4 py-2 text-white hover:bg-[#357ae8]"
        >
          <FcGoogle size={20} />
          {loading ? "Loading..." : "Continue with Google"}
        </button>
        <p className="text-center text-gray-500 text-sm">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
