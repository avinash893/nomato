import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import AddressPage from "./pages/Address";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import AddRestaurant from "./components/AddRestaurant";
import RiderDashboard from "./pages/RiderDashboard";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-500">Loading Nomato...</span>
      </div>
    );
  }

  if (user && user.role === "seller") {
    return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Restaurant />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    );
  }

  if (user && user.role === "rider") {
    return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RiderDashboard />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/ordersuccess" element={<OrderSuccess />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
          <Route path="/rider" element={<RiderDashboard />} />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
};

export default App;
