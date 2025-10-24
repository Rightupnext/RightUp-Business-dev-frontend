import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { API } from "../../api";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        login(res.data.token, res.data.user);
      } else {
        await API.post("/auth/register", form);
        alert("Registered successfully! You can now login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden max-w-4xl w-full">
        <div className={`w-full md:w-1/2 p-8 ${isLogin ? "order-last" : ""}`}>
          <h2 className="text-2xl font-bold mb-4">
            {isLogin ? "Login" : "Registration"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                className="border w-full p-2 rounded"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="border w-full p-2 rounded"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="border w-full p-2 rounded"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p className="text-sm mt-4 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
        <div className="hidden md:flex w-1/2 bg-blue-500 text-white flex-col items-center justify-center p-10">
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Welcome Back!" : "Hello, Welcome!"}
          </h1>
          <p>
            {isLogin ? "Glad to see you again" : "Let's get you registered"}
          </p>
        </div>
      </div>
    </div>
  );
}
