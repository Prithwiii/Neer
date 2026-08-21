import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GARAGE_API = "http://localhost:5000/api/garages";

function Garages({ token, onLogout }) {
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
    <div className="dashboard-page">
      <div className="dashboard-header"><div><h1>Available Garages</h1><p>Choose an available garage to book.</p></div><button className="secondary" onClick={onLogout}>Logout</button></div>
      <nav className="top-nav"><Link to="/dashboard">Dashboard</Link><Link to="/garages">Available Garages</Link><Link to="/garages/my-bookings">My Garage Bookings</Link></nav>
      <div className="dashboard-panel"><div className="panel-card">
        <h2>Available Garages</h2>
        {message && <p className="form-message">{message}</p>}
        {garages.length === 0 ? <p>No garages are currently available.</p> : garages.map((garage) => (
          <div key={garage._id} className="proposal-card">
            <h3>{garage.name} {garage.slotNumber ? `— ${garage.slotNumber}` : ""}</h3>
            <p>{garage.description || "Garage space"}</p><p>Owner: {garage.owner || "Unassigned"}</p><p>Contact No: {garage.contactNo || "01383838383"}</p><p>Status: <strong>Available</strong></p>
            <Link className="create-book-link" to={`/garages/book/${garage._id}`}>Book this garage</Link>
          </div>
        ))}
      </div></div>
    </div>
  );
}

export default Garages;
