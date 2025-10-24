import React, { useState } from "react";
import { API } from "../api";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/forgot-password", { email });
      alert("Password reset link sent to your email.");
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button text="Send Reset Link" type="submit" />
        </form>
      </div>
    </div>
  );
}
