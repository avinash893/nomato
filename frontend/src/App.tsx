import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Account from "./pages/Account";

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path="select-role" element={<SelectRole />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </>
  );
};

export default App;
