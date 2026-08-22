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

import AddRestaurant from "./components/AddRestaurant";

const App = () => {
  const { user } = useAppData();

  if (user && user.role === "seller") {
    return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Restaurant />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
        </Routes>
        <Toaster />
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
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
