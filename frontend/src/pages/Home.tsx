import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const Home = () => {
  const navigate = useNavigate();
  const { setIsAuth, setUser } = useAppData();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    navigate("/login");
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-md text-center">
          <h1 className="text-4xl font-bold text-[#333]">Welcome to Nomato!</h1>
          <p className="text-gray-600">You have successfully logged in.</p>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
