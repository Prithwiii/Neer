import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const GARAGE_API = "http://localhost:5000/api/garages";
const GARAGE_BOOKING_API = "http://localhost:5000/api/garage-bookings";

function Garages({ token, onLogout, role }) {
  const [garages, setGarages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("available");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requestText, setRequestText] = useState("");

  const [myBookings, setMyBookings] = useState([]);

  const loadGarages = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${GARAGE_API}${query}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setGarages(data);
  }, [token, statusFilter]);

  const loadMyBookings = useCallback(async () => {
    const res = await fetch(`${GARAGE_BOOKING_API}/mine`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setMyBookings(data);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const request = setTimeout(() => {
      loadGarages();
      loadMyBookings();
    }, 0);

    return () => clearTimeout(request);
  }, [token, loadGarages, loadMyBookings]);

  const openBooking = (g) => {
    setSelected(g);
    setMessage(g.isFree ? "" : "This garage is currently unavailable.");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setRequestText("");
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selected) return setMessage("Select a garage first");
    if (!selected.isFree) return setMessage("This garage is currently unavailable.");

    const start = `${startDate}T${startTime}:00`;
    const end = `${endDate}T${endTime}:00`;

    const res = await fetch(GARAGE_BOOKING_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ garageId: selected._id, startDate: start, endDate: end, purpose: requestText }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Could not create booking");
      return;
    }

    setMessage("Booking request sent successfully");
    setSelected(null);
    loadGarages();
    loadMyBookings();
  };

  const cancelBooking = async (id) => {
    setMessage("");
    const res = await fetch(`${GARAGE_BOOKING_API}/${id}/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Could not cancel");
      return;
    }
    loadGarages();
    loadMyBookings();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Garage Availability & Booking</h1>
          <p>Role: {role}</p>
        </div>
        <button className="secondary" onClick={onLogout}>Logout</button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/garages">Garages</Link>
        <Link to="/noticeboard">Noticeboard</Link>
        <Link to="/books">Library</Link>
      </nav>

      <div className="dashboard-menu">
        {[
          { key: "available", label: "Available" },
        ].map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={statusFilter === filter.key ? "active" : ""}
            onClick={() => setStatusFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="dashboard-panel">
        <div className="panel-card">
          <h2>Garage List</h2>
          {garages.length === 0 ? (
            <p>No garages match this filter.</p>
          ) : (
            garages.map((g) => (
              <div key={g._id} className="proposal-card">
                <h3>{g.name} {g.slotNumber ? `— ${g.slotNumber}` : ""}</h3>
                <p>{g.description || "Garage space"}</p>
                <p>Owner: {g.owner || "Unassigned"}</p>
                <p>Contact No: {g.contactNo || "01383838383"}</p>
                <p>
                  Status: <strong>{g.isFree ? "Available" : "Unavailable"}</strong>
                  {!g.isFree && g.nextRelease ? ` until ${new Date(g.nextRelease).toLocaleString()}` : ""}
                </p>
                <button className="secondary" onClick={() => openBooking(g)} disabled={!g.isFree}>
                  {g.isFree ? "Request booking" : "Unavailable"}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="panel-card">
          <h2>Book Selected Garage</h2>
          {selected ? (
            <form className="booking-form" onSubmit={submitBooking}>
              <h3>{selected.name}</h3>
              <p>Owner: {selected.owner || "Unassigned"}</p>
              <p>Contact: {selected.contactNo || "01383838383"}</p>
              <p>Status: {selected.isFree ? "Available" : "Unavailable"}</p>

              <label>Start</label>
              <div className="time-row">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>

              <label>End</label>
              <div className="time-row">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>

              <input
                placeholder="Booking duration, e.g. 2 weeks or 1 month"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
              />

              <button className="primary" type="submit" disabled={!selected.isFree}>Confirm Booking</button>
            </form>
          ) : (
            <p>Select an available garage to request a booking.</p>
          )}
        </div>

        <div className="panel-card">
          <h2>My Garage Bookings</h2>
          {myBookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            myBookings.map((b) => (
              <div key={b._id} className="proposal-card">
                <h3>{b.garage ? b.garage.name : "Garage removed"}</h3>
                <p>{new Date(b.startDate).toLocaleString()} — {new Date(b.endDate).toLocaleString()}</p>
                <p>Status: {b.status}</p>
                {b.status === "confirmed" && <button className="secondary" onClick={() => cancelBooking(b._id)}>Cancel</button>}
              </div>
            ))
          )}
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default Garages;
