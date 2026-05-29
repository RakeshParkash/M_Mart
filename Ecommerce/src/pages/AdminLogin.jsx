// src/pages/AdminLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Input from "../components/shared/AdminInputs";
import Button from "../components/shared/AdminButton";
import { useCookies } from "react-cookie";

export default function AdminLogin() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["token"]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trim() });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    setErrorMsg("");

    try {
      const { data } = await api.post("/admin/login", form);

      if (!data?.accessToken) {
        throw new Error("Invalid response from server");
      }

      // Store accessToken in localStorage for API calls
      localStorage.setItem("accessToken", data.accessToken);
      
      // Store admin user data in localStorage (needed for role checking)
      if (data?.admin) {
        localStorage.setItem("user", JSON.stringify({ ...data.admin, role: 'admin' }));
      }
      
      // Set token cookie for routing (matches normal login pattern)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      setCookie("token", data.accessToken, {
        path: "/",
        expires: expirationDate,
        secure: true,
        sameSite: 'lax'  // Changed from 'strict' to 'lax' for better mobile support
      });
      
      navigate("/admin/main");
    } catch (err) {
      setErrorMsg(err.response?.data?.err || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        {errorMsg && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-center rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <Input
            label="Phone"
            name="phone"
            type="tel"
            required
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            onChange={handleChange}
          />

          <Button disabled={loading} type="submit" className="w-full mt-4">
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          No account?{" "}
          <Link className="text-indigo-600" to="/admin/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
