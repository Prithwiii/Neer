import { Link } from "react-router-dom";

function StaffDashboard({ onLogout }) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Staff tools</p>
        </div>
        <button className="secondary" onClick={onLogout}>Logout</button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/bills">Bill Payments</Link>
        <Link to="/books">Library</Link>
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
