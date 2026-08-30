import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";

const COMPLAINT_API = `${API_URL}/api/complaints`;

function Complaints({ token, onLogout, role, view = "all" }) {
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

  const visibleComplaints = role === "staff" && filter !== "all"
    ? complaints.filter((complaint) => complaint.status === filter)
    : complaints;

  const normalizedFlat = userFlatNumber.trim().toUpperCase();
  const complaintsAgainstMyFlat = role !== "staff" && normalizedFlat
    ? visibleComplaints.filter((complaint) => (complaint.flatNumber || "").toUpperCase() === normalizedFlat)
    : [];
  const complaintsToDisplay = view === "my-flat" ? complaintsAgainstMyFlat : visibleComplaints;

  const renderComplaint = (complaint) => (
    <div key={complaint._id} className="proposal-card">
      <h3>{complaint.title}</h3>
      <p>{complaint.description}</p>
      <p>Flat against: <strong>{complaint.flatNumber}</strong></p>
      <p>Submitted by: {complaint.complainant?.username || "Unknown"}{role === "staff" && complaint.complainant?.email ? ` (${complaint.complainant.email})` : ""}</p>
      <p>Status: <strong>{complaint.status === "pending" ? "Pending Verification" : complaint.status[0].toUpperCase() + complaint.status.slice(1)}</strong></p>
      <p>Submitted: {new Date(complaint.createdAt).toLocaleString()}</p>
      {complaint.verifiedAt && <p>Verified: {new Date(complaint.verifiedAt).toLocaleString()}</p>}
      {complaint.rejectedAt && <p>Rejected: {new Date(complaint.rejectedAt).toLocaleString()}</p>}
      {role === "staff" && complaint.status === "pending" && (
        <div className="proposal-actions">
          <button className="primary" onClick={() => updateStatus(complaint._id, "verify")}>Accept Complaint</button>
          <button className="secondary" onClick={() => updateStatus(complaint._id, "reject")}>Reject Complaint</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
            <h1>{view === "my-flat" ? "Complaints Against My Flat" : "All Complaints"}</h1>
            <p>{role === "staff" ? "Review all submitted complaints." : "View officially verified complaints."}</p>
        </div>
        <button className="secondary" onClick={onLogout}>Logout</button>
      </div>

      <nav className="top-nav">
        <Link to="/dashboard">Dashboard</Link>
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
            <p>{view === "my-flat" ? `No verified complaints are listed against ${normalizedFlat || "your flat"}.` : role === "staff" ? "No complaints in this category." : "No verified complaints have been published."}</p>
          ) : (
            complaintsToDisplay.map(renderComplaint)
          )}
        </div>
      </div>
    </div>
  );
}

export default Complaints;
