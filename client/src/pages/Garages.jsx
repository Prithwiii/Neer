import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";

const GARAGE_API = `${API_URL}/api/garages`;

function Garages({ token }) {
  const [garages, setGarages] = useState([]);
  const [message, setMessage] = useState("");

  const loadGarages = useCallback(async () => {
    try {
      const response = await fetch(`${GARAGE_API}?status=available`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load garages");
      setGarages(data);
    } catch (error) {
      setMessage(error.message || "Could not connect to server");
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const request = setTimeout(loadGarages, 0);
    return () => clearTimeout(request);
  }, [token, loadGarages]);

  return (
    <div className="dashboard-page nx garages-page">
      <div className="dashboard-header"><div><h1>Available Garages</h1><p>Choose an available garage to book.</p></div></div>
      <nav className="top-nav"><Link to="/garages">Available Garages</Link><Link to="/garages/my-bookings">My Garage Bookings</Link></nav>
      <div className="feature-stat-grid" aria-label="Garage summary">
        <div className="feature-stat-card"><span>Available now</span><strong>{garages.length}</strong></div>
        <div className="feature-stat-card"><span>Booking mode</span><strong>Open</strong></div>
        <div className="feature-stat-card"><span>Access</span><strong>Resident</strong></div>
      </div>
      <div className="dashboard-panel"><div className="panel-card garage-panel">
        <h2>Available Garages</h2>
        {message && <p className="form-message">{message}</p>}
        {garages.length === 0 ? <div className="feature-empty-state"><span className="feature-empty-icon">▤</span><strong>No garages are currently available</strong><span>Check back later for newly released spaces.</span></div> : garages.map((garage) => (
          <div key={garage._id} className="proposal-card garage-card">
            <div className="garage-card-top">
              <div>
                <p className="garage-card-kicker">Garage space</p>
                <h3>{garage.name} {garage.slotNumber ? `- ${garage.slotNumber}` : ""}</h3>
              </div>
              <span className="garage-status-badge">Available</span>
            </div>
            <p className="garage-description">{garage.description || "Garage space"}</p>
            <div className="garage-details">
              <span><small>Owner</small><strong>{garage.owner || "Unassigned"}</strong></span>
              <span><small>Contact</small><strong>{garage.contactNo || "01383838383"}</strong></span>
            </div>
            <div className="garage-card-actions">
              <Link className="create-book-link" to={`/garages/book/${garage._id}`}>Book this garage</Link>
            </div>
          </div>
        ))}
      </div></div>
    </div>
  );
}

export default Garages;
