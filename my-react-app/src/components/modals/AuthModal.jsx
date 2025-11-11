import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE;

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "business",
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Navigate user to their correct dashboard path
  const navigateToDashboard = (role) => {
    if (role === "business") navigate("/business/main-dashboard");
    if (role === "project") navigate("/project/project-tasks");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      toast.error("⚠️ Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // ✅ Login
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: form.email,
          password: form.password,
          dashboardType: form.role,
        });

        login(res.data.token, res.data.user);
        toast.success("✅ Login successful!");
        navigateToDashboard(res.data.user.role);
      } else {
        // ✅ Register
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          dashboardType: form.role,
        };

        await axios.post(`${API_BASE}/auth/register`, payload);
        toast.success("🎉 Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Authentication Error:", err);
      const message =
        err.response?.data?.message ||
        (isLogin ? "Login failed ❌" : "Registration failed ❌");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? "Login" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-blue-200"
            />
          )}

          <select
            className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-blue-200"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="business">Business Development</option>
            <option value="project">Project Development</option>
          </select>

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-blue-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold w-full py-2 rounded-md transition`}
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <button
            className="ml-2 text-blue-600 font-semibold hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
