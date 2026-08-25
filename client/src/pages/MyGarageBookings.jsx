import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GARAGE_BOOKING_API = "http://localhost:5000/api/garage-bookings";

function MyGarageBookings({ token, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const loadBookings = useCallback(async () => {
    const response = await fetch(`${GARAGE_BOOKING_API}/mine`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (response.ok) setBookings(data);
    else setMessage(data.message || "Failed to load bookings");
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const request = setTimeout(loadBookings, 0);
    return () => clearTimeout(request);
  }, [token, loadBookings]);

  const cancelBooking = async (id) => {
    const response = await fetch(`${GARAGE_BOOKING_API}/${id}/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) setMessage(data.message || "Could not cancel booking");
    else loadBookings();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header"><div><h1>My Garage Bookings</h1><p>View and cancel your garage bookings.</p></div><button className="secondary" onClick={onLogout}>Logout</button></div>
      <nav className="top-nav"><Link to="/dashboard">Dashboard</Link><Link to="/garages">Available Garages</Link><Link to="/garages/my-bookings">My Garage Bookings</Link></nav>
      <div className="dashboard-panel"><div className="panel-card">{message && <p className="form-message">{message}</p>}{bookings.length === 0 ? <p>No bookings yet.</p> : bookings.map((booking) => <div key={booking._id} className="proposal-card"><h3>{booking.garage?.name || "Garage removed"}</h3><p>{new Date(booking.startDate).toLocaleString()} — {new Date(booking.endDate).toLocaleString()}</p><p>Status: {booking.status}</p>{booking.status === "confirmed" && <button className="secondary" onClick={() => cancelBooking(booking._id)}>Cancel</button>}</div>)}</div></div>
    </div>
  );
}

export default MyGarageBookings;
