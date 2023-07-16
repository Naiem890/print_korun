import { Route, Routes } from "react-router-dom";
import Login from "./components/Pages/Login/Login";
import Home from "./components/Pages/Home/Home";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}
