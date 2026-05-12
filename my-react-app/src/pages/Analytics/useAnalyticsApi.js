// src/api/analyticsApi.js

import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE;

// ✅ 1. Get All Users
export const getUsersApi = async (token) => {
  const res = await axios.get(
    `${API_BASE}/analytics/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// ✅ 2. Get Projects By User
export const getProjectsByUserApi = async (
  userId,
  token
) => {
  const res = await axios.get(
    `${API_BASE}/analytics/projects/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// ✅ 3. Get Project Report
export const getProjectReportApi = async (
  projectId,
  token
) => {
  const res = await axios.get(
    `${API_BASE}/analytics/report/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};