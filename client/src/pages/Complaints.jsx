import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";

const COMPLAINT_API = `${API_URL}/api/complaints`;

function Complaints({ token, role, view = "all" }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [userFlatNumber, setUserFlatNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadComplaints = useCallback(async () => {
    try {
      const response = await fetch(COMPLAINT_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load complaints");
      setComplaints(data);
    } catch (requestError) {
      setError(requestError.message || "Could not connect to server");
    }
  }, [token]);

  const loadProfile = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const profile = await response.json();
      setUserFlatNumber(profile.flatNumber || "");
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    const request = setTimeout(() => {
      loadComplaints();
      loadProfile();
    }, 0);
    return () => clearTimeout(request);
  }, [token, loadComplaints, loadProfile]);

  const updateStatus = async (id, action) => {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${COMPLAINT_API}/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update complaint");

      setComplaints((current) => current.map((complaint) => (
        complaint._id === data._id ? data : complaint
      )));
      setMessage(`Complaint ${action === "verify" ? "verified" : "rejected"}.`);
    } catch (requestError) {
      setError(requestError.message || "Could not connect to server");
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint permanently?")) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${COMPLAINT_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete complaint");

      setComplaints((current) => current.filter((complaint) => complaint._id !== id));
      setMessage("Complaint deleted.");
    } catch (requestError) {
      setError(requestError.message || "Could not connect to server");
    }
  };

  const visibleComplaints = role === "staff" && filter !== "all"
    ? complaints.filter((complaint) => complaint.status === filter)
    : complaints;

  const normalizedFlat = userFlatNumber.trim().toUpperCase();
  const complaintsAgainstMyFlat = role !== "staff" && normalizedFlat
    ? visibleComplaints.filter((complaint) => (complaint.flatNumber || "").toUpperCase() === normalizedFlat)
    : [];
  const complaintsToDisplay = view === "my-flat" ? complaintsAgainstMyFlat : visibleComplaints;
  const pendingCount = complaints.filter((complaint) => complaint.status === "pending").length;
  const verifiedCount = complaints.filter((complaint) => complaint.status === "verified").length;
  const rejectedCount = complaints.filter((complaint) => complaint.status === "rejected").length;

  const renderComplaint = (complaint) => (
    <div key={complaint._id} className="proposal-card complaint-card">
      <div className="complaint-card-top">
        <span className={`complaint-status-badge complaint-status-${complaint.status}`}>{complaint.status === "pending" ? "Pending review" : complaint.status[0].toUpperCase() + complaint.status.slice(1)}</span>
        <span className="complaint-date">{new Date(complaint.createdAt).toLocaleDateString()}</span>
      </div>
      <h3>{complaint.title}</h3>
      <p className="complaint-description">{complaint.description}</p>
      <div className="complaint-details">
        <span><small>Flat against</small><strong>{complaint.flatNumber}</strong></span>
        <span><small>Submitted by</small><strong>{complaint.complainant?.username || "Unknown"}</strong></span>
      </div>
      {role === "staff" && complaint.complainant?.email && <p className="complaint-email">{complaint.complainant.email}</p>}
      {complaint.verifiedAt && <p className="complaint-history">Verified {new Date(complaint.verifiedAt).toLocaleString()}</p>}
      {complaint.rejectedAt && <p className="complaint-history">Rejected {new Date(complaint.rejectedAt).toLocaleString()}</p>}
      {role === "staff" && complaint.status === "pending" && (
        <div className="proposal-actions">
          <button className="primary" onClick={() => updateStatus(complaint._id, "verify")}>Accept Complaint</button>
          <button className="secondary" onClick={() => updateStatus(complaint._id, "reject")}>Reject Complaint</button>
        </div>
      )}
      {role === "staff" && (
        <div className="complaint-delete-row">
          <button className="complaint-delete-button" onClick={() => deleteComplaint(complaint._id)}>Delete complaint</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-page nx complaints-page">
      <div className="dashboard-header">
        <div>
            <h1>{view === "my-flat" ? "Complaints Against My Flat" : "All Complaints"}</h1>
            <p>{role === "staff" ? "Review all submitted complaints." : "View officially verified complaints."}</p>
        </div>
      </div>

      <div className="feature-stat-grid" aria-label="Complaint summary">
        <div className="feature-stat-card"><span>Total records</span><strong>{complaints.length}</strong></div>
        <div className="feature-stat-card"><span>{role === "staff" ? "Pending review" : "Verified"}</span><strong>{role === "staff" ? pendingCount : verifiedCount}</strong></div>
        <div className="feature-stat-card"><span>Rejected</span><strong>{rejectedCount}</strong></div>
      </div>

      <nav className="top-nav">
        {role !== "staff" && <Link to="/complaints/submit">Submit Complaint</Link>}
        <Link to="/complaints">All Complaints</Link>
        {role !== "staff" && <Link to="/complaints/my-flat">Against My Flat</Link>}
      </nav>

      {role === "staff" && (
        <div className="dashboard-menu">
          {["all", "pending", "verified", "rejected"].map((status) => (
            <button
              key={status}
              type="button"
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="dashboard-panel">
        <div className="panel-card">
          <h2>{role === "staff" ? `Complaints (${visibleComplaints.length})` : view === "my-flat" ? `Complaints Against My Flat (${complaintsToDisplay.length})` : "Verified Complaints"}</h2>
          {error && !message && <p className="form-message">{error}</p>}
          {complaintsToDisplay.length === 0 ? (
            <div className="feature-empty-state"><span className="feature-empty-icon">!</span><strong>{view === "my-flat" ? "No complaints found" : "No complaints in this view"}</strong><span>{view === "my-flat" ? `No verified complaints are listed against ${normalizedFlat || "your flat"}.` : role === "staff" ? "There are no complaints in this category." : "No verified complaints have been published."}</span></div>
          ) : (
            complaintsToDisplay.map(renderComplaint)
          )}
        </div>
      </div>
    </div>
  );
}

export default Complaints;
