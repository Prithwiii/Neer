import axios from "axios";
import API_URL from "../config/api";

const BASE = `${API_URL}/api/alerts`;

const client = axios.create();

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAlerts = async () => {
  const res = await client.get(BASE);
  return res.data;
};

export const sendAlert = async (data) => {
  const res = await client.post(BASE, data);
  return res.data;
};
