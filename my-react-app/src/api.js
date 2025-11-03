import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_BASE,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
