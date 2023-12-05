import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./components/Admin/AdminDashboard";
import { AdminPrinterIoTs } from "./components/Admin/AdminPrinterIoTs";
import AdminLogin from "./components/Auth/AdminLogin";
import ChangePassword from "./components/Auth/ChangePassword";
import Login from "./components/Auth/Login";
import RequiredAdminAuth from "./components/Auth/RequiredAdminAuth";
import RequiredUserAuth from "./components/Auth/RequiredUserAuth";
import Navbar from "./components/Common/Navbar";
import Dashboard from "./components/User/Dashboard";
import Profile from "./components/User/Profile";
import SignUp from "./components/Auth/SignUp";
import OTPVerification from "./components/Auth/OTPVerification";
import Orders from "./components/User/Orders";
import PrinterIoTs from "./components/User/PrinterIoTs";
import AdminOrders from "./components/Admin/AdminOrders";
import PlaceOrder from "./components/User/PlaceOrder";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-phone" element={<OTPVerification />} />
        <Route
          path="/dashboard/"
          element={
            <RequiredUserAuth>
              <Dashboard />
            </RequiredUserAuth>
          }
        >
          <Route index element={<PrinterIoTs />} />
          <Route path="place-order/:printerIoTId" element={<PlaceOrder />} />

          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
        {/* <Route
          path="/change-password"
          element={
            <RequiredUserAuth>
              <ChangePassword />
            </RequiredUserAuth>
          }
        /> */}

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard/"
          element={
            <RequiredAdminAuth>
              <AdminDashboard />
            </RequiredAdminAuth>
          }
        >
          <Route index element={<AdminPrinterIoTs />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
