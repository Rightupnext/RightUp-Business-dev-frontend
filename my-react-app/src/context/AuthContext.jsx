import React, { createContext, useEffect, useState } from "react";
import { API } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")) || null);
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");

  // Validate token on app load
  useEffect(() => {
    if (token) {
      API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setUser(res.data.user);
          setToken(token);
          sessionStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
          setUser(null);
          setToken("");
        });
    }
  }, [token]);

  const login = (authToken, userData) => {
    sessionStorage.setItem("token", authToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
