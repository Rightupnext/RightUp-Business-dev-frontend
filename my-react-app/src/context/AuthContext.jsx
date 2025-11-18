import React, { createContext, useEffect, useState } from "react";
import { API } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || "");


  useEffect(() => {
    if (!token) return;

    const localUser = JSON.parse(localStorage.getItem("user")) || {};

    API.get("/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const backendUser = res.data;

        // ⭐ Merge backend data + locally stored profilePic
        const finalUser = {
          ...backendUser,
          profilePic: localUser.profilePic || backendUser.profileImage || "",
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
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
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
