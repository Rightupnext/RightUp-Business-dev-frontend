import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Fetch latest profile if token exists
  useEffect(() => {
    if (!token) return;

    axios.get(`${import.meta.env.VITE_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const backendUser = res.data.user;

        const finalUser = {
          ...backendUser,
          profilePic: backendUser.profileImage || "",
        };

        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(finalUser));
      })
      .catch(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken("");
      });
  }, [token]);

  const login = (authToken, userData) => {
    const finalUser = {
      ...userData,
      profilePic: userData.profileImage || "",
    };
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(finalUser));
    setToken(authToken);
    setUser(finalUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
