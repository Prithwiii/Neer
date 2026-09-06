import API_URL from "../config/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function getAlerts() {
  const res = await fetch(`${API_URL}/api/alerts`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function createAlert({ title, message, severity }) {
  const res = await fetch(`${API_URL}/api/alerts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, message, severity }),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}

export async function deactivateAlert(id) {
  const res = await fetch(`${API_URL}/api/alerts/${id}/deactivate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to deactivate alert");
  return res.json();
}