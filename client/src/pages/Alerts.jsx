import { useEffect, useState } from "react";
import { getAlerts, createAlert, deactivateAlert } from "../services/alertService";
import { getSocket } from "../services/socket";

const CAN_SEND = ["committee", "staff"];

function Alerts({ token, role, onLogout }) {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", severity: "info" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSend = CAN_SEND.includes(role);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        setError("Failed to load alerts.");
      }
    }
    load();

    const socket = getSocket();
    function handleNewAlert(alert) {
      setAlerts((prev) => [alert, ...prev]);
    }
    function handleDeactivated(alertId) {
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, active: false } : a))
      );
    }
    socket.on("newAlert", handleNewAlert);
    socket.on("alertDeactivated", handleDeactivated);
    return () => {
      socket.off("newAlert", handleNewAlert);
      socket.off("alertDeactivated", handleDeactivated);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createAlert(form);
      setForm({ title: "", message: "", severity: "info" });
    } catch (err) {
      setError("Failed to send alert.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id) {
    try {
      await deactivateAlert(id);
    } catch (err) {
      setError("Failed to deactivate alert.");
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Alerts</h1>

      {canSend && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <h2>Send Manual Alert</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ width: "100%", padding: 8 }}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              style={{ padding: 8 }}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Alert"}
          </button>
        </form>
      )}

      <h2>Alert History</h2>
      {alerts.length === 0 && <p>No alerts yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {alerts.map((alert) => (
          <li
            key={alert._id}
            style={{
              padding: 12,
              marginBottom: 8,
              border: "1px solid #ddd",
              borderRadius: 6,
              opacity: alert.active ? 1 : 0.5,
            }}
          >
            <strong>{alert.title}</strong> —{" "}
            <span style={{ textTransform: "uppercase", fontSize: 12 }}>
              {alert.severity}
            </span>{" "}
            <span style={{ fontSize: 12, color: "#888" }}>({alert.type})</span>
            <p style={{ margin: "4px 0" }}>{alert.message}</p>
            {canSend && alert.active && (
              <button onClick={() => handleDeactivate(alert._id)}>
                Deactivate
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Alerts;