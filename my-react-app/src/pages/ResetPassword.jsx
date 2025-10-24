import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      alert("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button text="Reset Password" type="submit" />
        </form>
      </div>
    </div>
  );
}
