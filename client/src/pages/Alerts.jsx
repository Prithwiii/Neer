import { useEffect, useState } from "react";
import { getAlerts, sendAlert } from "../services/alertService";
import { getSocket } from "../services/socket";
import "./Alerts.css";

const SEVERITIES = ["Critical", "Warning", "Info"];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Alerts({ role }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("Critical");
  const [sending, setSending] = useState(false);

  const canSend = role === "staff" || role === "committee";

  useEffect(() => {
    let isMounted = true;

    getAlerts()
      .then((data) => {
        if (isMounted) setAlerts(data);
      })
      .catch(() => {
        if (isMounted) setError("Couldn't load alert history.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const socket = getSocket();
    const handleNewAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    };
    socket.on("newAlert", handleNewAlert);

    return () => {
      isMounted = false;
      socket.off("newAlert", handleNewAlert);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      setError("");
      await sendAlert({ message: message.trim(), severity });
      setMessage("");
      setSeverity("Critical");
      // No need to manually add it to the list — the socket broadcast
      // (which the sender also receives) will do that.
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't send that alert. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>Emergency Alerts</h1>
        <p className="alerts-subtitle">
          {canSend
            ? "Send alerts to all residents and view the alert history below."
            : "You'll see emergency alerts here as soon as staff or committee sends one."}
        </p>
      </div>

      {error && <div className="alerts-error">{error}</div>}

      {canSend && (
        <form className="alert-form" onSubmit={handleSend}>
          <div className="alert-form-row">
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Fire drill at 3 PM, please evacuate via the east stairwell"
              maxLength={500}
            />
            <button type="submit" disabled={sending || !message.trim()}>
              {sending ? "Sending..." : "Send Alert"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <div className="alerts-empty">No alerts have been sent yet.</div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`alert-card severity-${alert.severity.toLowerCase()}`}
            >
              <div className="alert-card-top">
                <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
                  {alert.severity}
                </span>
                <span className="alert-time">{formatTime(alert.createdAt)}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
              <p className="alert-sender">— {alert.senderName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
