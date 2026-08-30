import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import API_URL from "../config/api";

const GARAGE_API = `${API_URL}/api/garages`;
const GARAGE_BOOKING_API = `${API_URL}/api/garage-bookings`;

function GarageBookingPage({ token, onLogout }) {
  const { garageId } = useParams();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  const loadGarage = useCallback(async () => {
    const response = await fetch(`${GARAGE_API}?status=available`, { headers: { Authorization: `Bearer ${token}` } });
    const garages = await response.json();
    if (!response.ok) return setMessage(garages.message || "Failed to load garage");
    const selectedGarage = garages.find((item) => item._id === garageId);
    if (selectedGarage) setGarage(selectedGarage);
    else setMessage("This garage is no longer available.");
  }, [garageId, token]);

  useEffect(() => {
    if (!token) return undefined;
    const request = setTimeout(loadGarage, 0);
    return () => clearTimeout(request);
  }, [token, loadGarage]);

  const submitBooking = async (event) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch(GARAGE_BOOKING_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ garageId, startDate: `${startDate}T${startTime}:00`, endDate: `${endDate}T${endTime}:00`, purpose }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not create booking");
    navigate("/garages/my-bookings");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header"><div><h1>Book Garage</h1><p>Choose the booking period for this garage.</p></div><button className="secondary" onClick={onLogout}>Logout</button></div>
      <nav className="top-nav"><Link to="/dashboard">Dashboard</Link><Link to="/garages">Available Garages</Link><Link to="/garages/my-bookings">My Garage Bookings</Link></nav>
      <div className="dashboard-panel"><div className="panel-card">
        {garage ? <form className="booking-form" onSubmit={submitBooking}><h2>{garage.name} {garage.slotNumber ? `— ${garage.slotNumber}` : ""}</h2><p>{garage.description || "Garage space"}</p><label>Start</label><div className="time-row"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></div><label>End</label><div className="time-row"><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required /><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required /></div><input placeholder="Booking purpose or duration" value={purpose} onChange={(event) => setPurpose(event.target.value)} /><button className="primary" type="submit">Confirm Booking</button>{message && <p className="form-message">{message}</p>}</form> : <p>{message || "Loading garage..."}</p>}
      </div></div>
    </div>
  );
}

export default GarageBookingPage;
