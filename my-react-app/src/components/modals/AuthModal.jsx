import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE;

export default function AuthModal() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // login/register form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "business",
  });

  // password toggle
  const [showPassword, setShowPassword] = useState(false);

  // forgot password states
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // reset form
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // navigate dashboard
  const navigateToDashboard = (role) => {
    if (role === "business") navigate("/business/main-dashboard");
    if (role === "project") navigate("/project/project-tasks");
  };

  // LOGIN / REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (!isLogin && !form.name)) {
      return toast.error("⚠️ Please fill all required fields");
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: form.email,
          password: form.password,
          dashboardType: form.role,
        });

        login(res.data.token, res.data.user);
        navigateToDashboard(res.data.user.role);
      } else {
        await axios.post(`${API_BASE}/auth/register`, {
          ...form,
          dashboardType: form.role,
        });

        toast.success("🎉 Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Auth error");
    } finally {
      setLoading(false);
    }
  };

  // verify email
  const handleForgotPassword = async () => {
    if (!resetEmail) return toast.error("Enter your email");

    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: resetEmail });
      toast.success("Email verified");
      setShowForgotPopup(false);
      setShowResetPopup(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // reset password
  const handleResetPassword = async () => {
    if (!resetForm.newPassword || !resetForm.confirmPassword)
      return toast.error("Fill all fields");

    if (resetForm.newPassword !== resetForm.confirmPassword)
      return toast.error("Passwords do not match");

    try {
      await axios.put(`${API_BASE}/auth/reset-password`, {
        email: resetEmail,
        newPassword: resetForm.newPassword,
      });

      toast.success("Password updated 🎉 Please login");
      setShowResetPopup(false);
      setIsLogin(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <Toaster position="top-center" />

      {/* MAIN CARD */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2  rounded w-full"
            />
          )}

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="business ">Business Development</option>
            <option value="project">Project Development</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border p-2 rounded w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* FORGOT PASSWORD */}
          <p
            onClick={() => setShowForgotPopup(true)}
            className="text-right text-sm text-blue-600 cursor-pointer"
          >
            Forgot Password?
          </p>

          <button
            type="submit"
            className="bg-blue-600 cursor-pointer  text-white w-full py-2 rounded"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 ml-2 cursor-pointer"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>

      {/* EMAIL POPUP */}
      {showForgotPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[350px]">
            <h3 className="text-xl mb-4">Verify Email</h3>
            <input
              type="email"
              placeholder="Enter email"
              value={resetEmail}
              onChange={(e)=>setResetEmail(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowForgotPopup(false)}>Cancel</button>
              <button onClick={handleForgotPassword} className="bg-blue-600 text-white px-4 py-1 rounded">
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET POPUP */}
      {showResetPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[350px]">
            <h3 className="text-xl mb-4">Reset Password</h3>

            <div className="relative mb-3">
              <input
                type={showNewPass ? "text":"password"}
                placeholder="New Password"
                value={resetForm.newPassword}
                onChange={(e)=>setResetForm({...resetForm,newPassword:e.target.value})}
                className="border p-2 w-full rounded pr-10"
              />
              <button onClick={()=>setShowNewPass(!showNewPass)} className="absolute right-2 top-2">
                {showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPass ? "text":"password"}
                placeholder="Confirm Password"
                value={resetForm.confirmPassword}
                onChange={(e)=>setResetForm({...resetForm,confirmPassword:e.target.value})}
                className="border p-2 w-full rounded pr-10"
              />
              <button onClick={()=>setShowConfirmPass(!showConfirmPass)} className="absolute right-2 top-2">
                {showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowResetPopup(false)}>Cancel</button>
              <button onClick={handleResetPassword} className="bg-green-600 text-white px-4 py-1 rounded">
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
