import axios from "axios";
import { store } from "../redux/store/store";

const axiosInstance = axios.create({
  baseURL: "/", // frontend URL automatically used
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token safely
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().user.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
