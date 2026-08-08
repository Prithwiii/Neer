import React from "react";
import { Link } from "react-router-dom";

function StaffDashboard({ token, onLogout }) {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const user = await res.json();
      setProfile(user);
    })();
  }, [token]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>{profile ? `${profile.username} — ${profile.role}` : "Staff tools"}</p>
        </div>
        <button className="secondary" onClick={onLogout}>Logout</button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
      </nav>

      <div className="dashboard-panel">
        <div className="panel-card">
          <h2>Staff Tools</h2>
          <p>Staff functionality is not implemented yet. This is a placeholder.</p>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
