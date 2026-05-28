import axios from "axios";
import { setAuthFromOutside } from "../utils/authContext";
import { clearAuthToken, getAuthToken } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API || "https://m-mart-ad2q.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: get current user role from localStorage
function getUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role || null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
        const token = getAuthToken();
        const pathname = window.location?.pathname || '';
        const protectedRoutes = ['/MyAccount', '/cart', '/wishlist', '/orders'];
        const shouldRedirect = token && protectedRoutes.some((route) => pathname.startsWith(route));

      // Only attempt /admin/token if user is admin
      const role = getUserRole();
      if (role === "admin" || role === "webappAdmin") {
        try {
          const { data } = await api.post("/admin/token");
          if (data?.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
          }
          setAuthFromOutside(true);
          return api(original);
        } catch {
          clearAuthToken();
          setAuthFromOutside(false);
          window.location.href = "/login";
        }
      } else {
          // For normal users, clear auth and only redirect if on protected routes
          clearAuthToken();
          setAuthFromOutside(false);
          if (shouldRedirect) window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
