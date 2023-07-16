import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
  ? "https://print-korun.onrender.com"
  : "http://localhost:5000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
