import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE;

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
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
    if (role === "project") navigate("/project/project-tasks"); // ✅ fixed path
  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (isLogin) {
        // ✅ Login
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: form.email,
          password: form.password,
          dashboardType: form.role,
        });

        login(res.data.token, res.data.user);
        navigateToDashboard(res.data.user.role); // ✅ redirect immediately
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
        alert("✅ Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Authentication Error:", err);
      alert(err.response?.data?.message || "Authentication Failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 rounded w-full"
            />
          )}

          <select
            className="border p-2 rounded w-full"
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
            className="border p-2 rounded w-full"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full py-2 rounded-md"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-3">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <button
            className="ml-2 text-blue-600 font-bold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
