import { Route, Routes } from "react-router-dom";
import Login from "./components/Pages/Login/Login";
import Home from "./components/Pages/Home/Home";
import CreateShop from "./components/Pages/Shop/CreateShop";
import Navbar from "./components/UI-elements/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        {/* <Route path="/shop/create" element={<CreateShop />} /> */}
      </Routes>
    </>
  );
}
