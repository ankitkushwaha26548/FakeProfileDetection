import axios from "axios";

const axiosInstance = axios.create({
  // Backend runs on port 3000 (frontend may run on 5001 due to port conflicts)
  baseURL: 'http://localhost:3000/api',
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
