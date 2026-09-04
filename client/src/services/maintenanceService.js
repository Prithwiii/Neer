import axios from "axios";
import API_URL from "../config/api";

const BASE = `${API_URL}/api/maintenance`;

const client = axios.create();

// Attach the JWT as a Bearer token, matching authMiddleware.js's expectation.
// Adjust the localStorage key/shape below if your login flow stores it differently
// (e.g. inside a "user" object rather than its own "token" key).
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMaintenanceItems = async () => {
  const res = await client.get(BASE);
  return res.data;
};

export const getReminders = async () => {
  const res = await client.get(`${BASE}/reminders`);
  return res.data;
};

export const createMaintenanceItem = async (data) => {
  const res = await client.post(BASE, data);
  return res.data;
};

export const updateMaintenanceItem = async (id, data) => {
  const res = await client.put(`${BASE}/${id}`, data);
  return res.data;
};

export const deleteMaintenanceItem = async (id) => {
  const res = await client.delete(`${BASE}/${id}`);
  return res.data;
};