import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";
import { getAlerts } from "../services/alertService";

const BANNER_SEVERITIES = ["info", "warning", "critical"];

export default function AlertBanner() {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    async function loadActiveAlerts() {
      try {
        const alerts = await getAlerts();
        const active = alerts.filter(
          (a) => a.active && BANNER_SEVERITIES.includes(a.severity)
        );
        setVisibleAlerts(active);
      } catch (err) {
        console.error("Failed to load active alerts:", err);
      }
    }
    loadActiveAlerts();

    const socket = getSocket();

    function handleNewAlert(alert) {
      if (!BANNER_SEVERITIES.includes(alert.severity)) return;
      setVisibleAlerts((prev) => [...prev, alert]);
    }

    function handleDeactivated(alertId) {
      setVisibleAlerts((prev) => prev.filter((a) => a._id !== alertId));
    }

    socket.on("newAlert", handleNewAlert);
    socket.on("alertDeactivated", handleDeactivated);

    return () => {
      socket.off("newAlert", handleNewAlert);
      socket.off("alertDeactivated", handleDeactivated);
    };
  }, []);

  function dismiss(id) {
    setVisibleAlerts((prev) => prev.filter((a) => a._id !== id));
  }

  if (visibleAlerts.length === 0) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {visibleAlerts.map((alert) => (
        <div
          key={alert._id}
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              alert.severity === "critical"
                ? "#b91c1c" // red
                : alert.severity === "warning"
                ? "#b45309" // orange
                : "#15803d", // green (info)
            color: "#fff",
            fontWeight: 600,
          }}
        >
          <span>
            {alert.title}: {alert.message}
          </span>
          <button
            onClick={() => dismiss(alert._id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
            }}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}