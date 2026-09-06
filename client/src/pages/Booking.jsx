import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

// const RESOURCE_API = "http://localhost:5000/api/resources";
// const BOOKING_API = "http://localhost:5000/api/bookings";
const RESOURCE_API = `${API_URL}/api/resources`;
const BOOKING_API = `${API_URL}/api/bookings`;

function Booking({ token, onLogout, role }) {
  const [resources, setResources] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("book");
  const [message, setMessage] = useState("");

  const [category, setCategory] = useState("space");
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("space");
  const [newDescription, setNewDescription] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [deleteResourceId, setDeleteResourceId] = useState(null);

  const loadResources = useCallback(async () => {
    const response = await fetch(RESOURCE_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) setResources(data);
  }, [token]);

  const loadMyBookings = useCallback(async () => {
    const response = await fetch(`${BOOKING_API}/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) setMyBookings(data);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      await loadResources();
      await loadMyBookings();
    })();
  }, [token, loadResources, loadMyBookings]);

  const loadAvailability = useCallback(async () => {
    if (!resourceId || !date) {
      setExistingBookings([]);
      return;
    }

    const response = await fetch(
      `${BOOKING_API}?resourceId=${resourceId}&date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (response.ok) setExistingBookings(data);
  }, [resourceId, date, token]);

  useEffect(() => {
    (async () => {
      await loadAvailability();
    })();
  }, [loadAvailability]);

  const filteredResources = resources.filter((r) => r.category === category);
  const todayStr = new Date().toISOString().slice(0, 10);

  const submitBooking = async (event) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch(BOOKING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resourceId, date, startTime, endTime, purpose }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not create booking");
      return;
    }

    setMessage("Booking confirmed!");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    loadMyBookings();
    loadAvailability();
  };

  const cancelBooking = async (id) => {
    setMessage("");

    const response = await fetch(`${BOOKING_API}/${id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not cancel booking");
      return;
    }

    loadMyBookings();
    loadAvailability();
  };

  const submitResource = async (event) => {
    event.preventDefault();
    setMessage("");

    const url = editingResourceId
      ? `${RESOURCE_API}/${editingResourceId}`
      : RESOURCE_API;
    const methodType = editingResourceId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newName,
        category: newCategory,
        description: newDescription,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not save space or facility");
      return;
    }

    setMessage(editingResourceId ? `${data.name} updated` : `${data.name} added`);
    setEditingResourceId(null);
    setNewName("");
    setNewCategory("space");
    setNewDescription("");
    loadResources();
  };

  const startEditResource = (resource) => {
    setMessage("");
    setEditingResourceId(resource._id);
    setNewName(resource.name);
    setNewCategory(resource.category);
    setNewDescription(resource.description || "");
  };

  const cancelEditResource = () => {
    setEditingResourceId(null);
    setNewName("");
    setNewCategory("space");
    setNewDescription("");
  };

  const deleteResource = async (id) => {
    setMessage("");

    const response = await fetch(`${RESOURCE_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not delete space or facility");
      return;
    }

    setDeleteResourceId(null);
    loadResources();
    loadMyBookings();
    loadAvailability();
  };

  const now = new Date();
  const isPastBooking = (b) => new Date(`${b.date}T${b.endTime}:00`) < now;
  const upcomingBookings = myBookings.filter(
    (b) => b.status === "confirmed" && !isPastBooking(b)
  );
  const previousBookings = myBookings.filter(
    (b) => b.status !== "confirmed" || isPastBooking(b)
  );

  return (
    <div className="dashboard-page nx">
      <div className="dashboard-header">
        <div>
          <h1>Common Space &amp; Facility Booking</h1>
          <p>
            Reserve a shared space or facility · signed in as {role}
          </p>
        </div>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/bills">Bill Payments</Link>
        <Link to="/books">Library</Link>
      </nav>

      <div className="dashboard-menu">
        <button
          type="button"
          className={activeTab === "book" ? "active" : ""}
          onClick={() => setActiveTab("book")}
        >
          Book
        </button>
        <button
          type="button"
          className={activeTab === "mine" ? "active" : ""}
          onClick={() => setActiveTab("mine")}
        >
          My Bookings
        </button>
        {role === "committee" && (
          <button
            type="button"
            className={activeTab === "manage" ? "active" : ""}
            onClick={() => setActiveTab("manage")}
          >
            Manage Spaces
          </button>
        )}
      </div>

      <div className="dashboard-panel">
        {activeTab === "book" && (
          <div className="panel-card">
            <h2>Book a Space or Facility</h2>

            <div className="dashboard-menu">
              <button
                type="button"
                className={category === "space" ? "active" : ""}
                onClick={() => {
                  setCategory("space");
                  setResourceId("");
                }}
              >
                Common Spaces
              </button>
              <button
                type="button"
                className={category === "facility" ? "active" : ""}
                onClick={() => {
                  setCategory("facility");
                  setResourceId("");
                }}
              >
                Facilities
              </button>
            </div>

            {filteredResources.length === 0 ? (
              <p>
                No {category === "space" ? "common spaces" : "facilities"}{" "}
                available yet.
              </p>
            ) : (
              <form onSubmit={submitBooking} className="booking-form">
                <div>
                  <span className="field-label">
                    Choose {category === "space" ? "a common space" : "a facility"}
                  </span>

                  <div className="facility-grid">
                    {filteredResources.map((r) => (
                      <button
                        key={r._id}
                        type="button"
                        className={`facility-card ${
                          resourceId === r._id ? "selected" : ""
                        }`}
                        aria-pressed={resourceId === r._id}
                        onClick={() => setResourceId(r._id)}
                      >
                        <span className="facility-card-top">
                          <span className="facility-card-name">{r.name}</span>
                          <span className="status-badge">
                            {r.category === "space" ? "Common Space" : "Facility"}
                          </span>
                        </span>

                        {r.description && (
                          <span className="facility-card-desc">
                            {r.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-row">
                  <div>
                    <span className="field-label">Date</span>
                    <input
                      type="date"
                      value={date}
                      min={todayStr}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <span className="field-label">Start and end time</span>
                    <div className="time-row">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {category === "space" && (
                  <div>
                    <span className="field-label">Purpose / Event name</span>
                    <input
                      type="text"
                      placeholder="e.g. Birthday gathering"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                )}

                {resourceId && date && (
                  <div className="availability-box">
                    <strong>Already booked on this date</strong>
                    {existingBookings.length === 0 ? (
                      <p>No bookings yet — fully available.</p>
                    ) : (
                      <ul>
                        {existingBookings.map((b, i) => (
                          <li key={i}>
                            {b.startTime} – {b.endTime}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!resourceId && (
                  <p className="dash-empty">
                    Select {category === "space" ? "a space" : "a facility"} above
                    to continue.
                  </p>
                )}

                <div className="bill-actions">
                  <button className="primary" type="submit" disabled={!resourceId}>
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "mine" && (
          <div className="panel-card">
            <h2>My Bookings</h2>

            <h3 className="booking-group-title">Upcoming</h3>
            {upcomingBookings.length === 0 ? (
              <p className="dash-empty">No upcoming bookings.</p>
            ) : (
              upcomingBookings.map((b) => (
                <div key={b._id} className="proposal-card booking-item">
                  <div className="booking-item-top">
                    <div>
                      <h3>{b.resource ? b.resource.name : "Resource removed"}</h3>
                      <p className="booking-item-meta">
                        {b.date} &middot; {b.startTime} – {b.endTime}
                      </p>
                    </div>

                    <span className="status-badge upcoming">Upcoming</span>
                  </div>

                  {b.purpose && (
                    <p className="booking-item-purpose">
                      <strong>Purpose:</strong> {b.purpose}
                    </p>
                  )}

                  <div className="booking-item-actions">
                    <button
                      className="secondary"
                      onClick={() => cancelBooking(b._id)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))
            )}

            <h3 className="booking-group-title">Previous</h3>
            {previousBookings.length === 0 ? (
              <p className="dash-empty">No previous bookings.</p>
            ) : (
              previousBookings.map((b) => (
                <div key={b._id} className="proposal-card booking-item">
                  <div className="booking-item-top">
                    <div>
                      <h3>{b.resource ? b.resource.name : "Resource removed"}</h3>
                      <p className="booking-item-meta">
                        {b.date} &middot; {b.startTime} – {b.endTime}
                      </p>
                    </div>

                    <span
                      className={`status-badge ${
                        b.status === "cancelled" ? "cancelled" : "completed"
                      }`}
                    >
                      {b.status === "cancelled" ? "Cancelled" : "Completed"}
                    </span>
                  </div>

                  {b.purpose && (
                    <p className="booking-item-purpose">
                      <strong>Purpose:</strong> {b.purpose}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "manage" && role === "committee" && (
          <div className="panel-card">
            <h2>{editingResourceId ? "Edit Space or Facility" : "Add a Space or Facility"}</h2>
            <form onSubmit={submitResource} className="booking-form">
              <div className="field-row">
                <div>
                  <span className="field-label">Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Rooftop Terrace"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <span className="field-label">Type</span>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="space">Common Space</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="field-label">Description (optional)</span>
                <input
                  type="text"
                  placeholder="What is this space used for?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="bill-actions">
                <button className="primary" type="submit">
                  {editingResourceId ? "Save Changes" : "Add"}
                </button>
                {editingResourceId && (
                  <button type="button" className="secondary" onClick={cancelEditResource}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2>Existing Spaces &amp; Facilities</h2>
            {resources.length === 0 ? (
              <p>No spaces or facilities yet.</p>
            ) : (
              <div className="resources-grid">
                {resources.map((r) => (
                  <div key={r._id} className="resource-card">
                    <div className="facility-card-top">
                      <h3>{r.name}</h3>
                      <span className="status-badge">
                        {r.category === "space" ? "Common Space" : "Facility"}
                      </span>
                    </div>
                    {r.description && <p>{r.description}</p>}

                    <div className="resource-actions">
                      <button type="button" onClick={() => startEditResource(r)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setDeleteResourceId(r._id)}
                      >
                        Delete
                      </button>
                    </div>

                    {deleteResourceId === r._id && (
                      <div className="confirm-box">
                        <p>
                          Delete "{r.name}"? Any active bookings for it will
                          be cancelled. This cannot be undone.
                        </p>
                        <button type="button" onClick={() => deleteResource(r._id)}>
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setDeleteResourceId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default Booking;
