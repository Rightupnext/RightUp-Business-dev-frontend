import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Welcome, {user?.name || user?.email}!</h1>
      <p className="mt-4">This is your user dashboard.</p>
      <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
