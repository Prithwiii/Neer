import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API_URL from "../config/api";

const COMPLAINT_API = `${API_URL}/api/complaints`;

function ComplaintSubmit({ token, onLogout }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [message, setMessage] = useState("");

  const submitComplaint = async (event) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch(COMPLAINT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, flatNumber }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Failed to submit complaint");
    navigate("/complaints");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header"><div><h1>Submit Complaint</h1><p>Your complaint will be reviewed before publication.</p></div><button className="secondary" onClick={onLogout}>Logout</button></div>
      <nav className="top-nav"><Link to="/dashboard">Dashboard</Link><Link to="/complaints">All Complaints</Link><Link to="/complaints/submit">Submit Complaint</Link></nav>
      <div className="dashboard-panel"><div className="panel-card"><form className="proposal-form" onSubmit={submitComplaint}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Complaint title" required /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Complaint description" required /><input value={flatNumber} onChange={(event) => setFlatNumber(event.target.value)} placeholder="Flat number the complaint is against" required /><button className="primary" type="submit">Submit for Verification</button>{message && <p className="form-message">{message}</p>}</form></div></div>
    </div>
  );
}

export default ComplaintSubmit;
