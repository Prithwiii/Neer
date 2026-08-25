import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import FloorSelector from "../components/FloorSelector";
import FloorPlan from "../components/FloorPlan";
import {
  CATEGORIES,
  floorLabel,
  categoryClass,
} from "../config/buildingLayout";
import {
  getLocations,
  getAllocatableResidents,
  createLocation,
  updateLocation,
  updateLocationPosition,
  allocateResidents,
  deleteLocation,
} from "../services/buildingLayoutService";

// keeps a whole marker inside the floor plate, so nothing hangs over the edge
const clampToPlan = (position, width, height) => {
  const halfWidth = Number(width) / 2;
  const halfHeight = Number(height) / 2;

  return {
    x: Math.min(100 - halfWidth, Math.max(halfWidth, position.x)),
    y: Math.min(100 - halfHeight, Math.max(halfHeight, position.y)),
  };
};

const emptyForm = {
  name: "",
  category: "Facility",
  description: "",
  openingHours: "",
  flatNumber: "",
  x: 50,
  y: 50,
  width: 16,
  height: 10,
};

function ManageBuildingLayout({ token, role }) {
  const [locations, setLocations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [floor, setFloor] = useState("G");
  const [selectedId, setSelectedId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [residentToAdd, setResidentToAdd] = useState("");

  // "place" fills the form's position, "move" repositions the selected marker
  const [planMode, setPlanMode] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // the saved location comes back with its residents populated, so the plan and
  // the list can update straight away instead of waiting for the full reload
  const applySaved = (saved) => {
    setLocations((current) =>
      current.some((item) => item._id === saved._id)
        ? current.map((item) => (item._id === saved._id ? saved : item))
        : [...current, saved]
    );
  };

  const loadLayout = useCallback(async () => {
    try {
      const data = await getLocations(token);
      setLocations(data);
    } catch (error) {
      setMessage(error.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token || role !== "committee") return;

    (async () => {
      setLoading(true);

      await loadLayout();

      try {
        const data = await getAllocatableResidents(token);
        setResidents(data);
      } catch (error) {
        setMessage(error.message);
      }

      setLoading(false);
    })();
  }, [token, role, loadLayout]);

  if (role !== "committee") {
    return <Navigate to="/building-layout" replace />;
  }

  const floorLocations = locations.filter((item) => item.floor === floor);
  const selected = floorLocations.find((item) => item._id === selectedId);

  const counts = locations.reduce((totals, item) => {
    totals[item.floor] = (totals[item.floor] || 0) + 1;
    return totals;
  }, {});

  // anyone not already living in the selected flat can be moved into it
  const availableResidents = selected
    ? residents.filter(
        (resident) => resident.flatNumber !== selected.flatNumber
      )
    : [];

  const selectFloor = (nextFloor) => {
    setFloor(nextFloor);
    setSelectedId(null);
    setDeleteId(null);

    if (planMode === "move") setPlanMode(null);
  };

  const openAddForm = () => {
    setMessage("");
    setEditingId(null);
    setForm(emptyForm);
    setResidentToAdd("");
    setShowForm(true);
    setSelectedId(null);
    setPlanMode("place");
  };

  const openEditForm = (location) => {
    setMessage("");
    setEditingId(location._id);
    setSelectedId(location._id);
    setForm({
      name: location.name,
      category: location.category,
      description: location.description || "",
      openingHours: location.openingHours || "",
      flatNumber: location.flatNumber || "",
      x: location.x,
      y: location.y,
      width: location.width,
      height: location.height,
    });
    setResidentToAdd("");
    setShowForm(true);
    setPlanMode(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setResidentToAdd("");
    setPlanMode(null);
  };

  const handlePlanClick = (position) => {
    if (planMode === "place") {
      setForm((current) => ({
        ...current,
        ...clampToPlan(position, current.width, current.height),
      }));
      return;
    }

    if (planMode === "move" && selected) {
      moveLocation(
        selected,
        clampToPlan(position, selected.width, selected.height)
      );
    }
  };

  const moveLocation = async (location, position) => {
    setMessage("");
    setSaving(true);

    try {
      const saved = await updateLocationPosition(location._id, position, token);

      applySaved(saved);
      setPlanMode(null);
      setMessage(`${location.name} moved`);
      await loadLayout();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // allocating writes the flat's number onto the resident's account, so a
  // person only ever lives in one flat
  const allocateResident = async () => {
    if (!selected || !residentToAdd) return;

    setMessage("");
    setSaving(true);

    try {
      const saved = await allocateResidents(
        selected._id,
        [residentToAdd],
        token
      );

      applySaved(saved);
      setResidentToAdd("");
      setMessage(`Resident allocated to ${saved.name}`);

      const refreshed = await getAllocatableResidents(token);
      setResidents(refreshed);
      await loadLayout();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    const payload = {
      name: form.name,
      floor,
      category: form.category,
      description: form.description,
      openingHours: form.openingHours,
      flatNumber: form.flatNumber,
      x: Number(form.x),
      y: Number(form.y),
      width: Number(form.width),
      height: Number(form.height),
    };

    try {
      const saved = editingId
        ? await updateLocation(editingId, payload, token)
        : await createLocation(payload, token);

      applySaved(saved);
      setMessage(editingId ? `${saved.name} updated` : `${saved.name} added`);
      closeForm();
      setSelectedId(saved._id);
      await loadLayout();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (location) => {
    setMessage("");
    setSaving(true);

    try {
      await deleteLocation(location._id, token);

      setLocations((current) =>
        current.filter((item) => item._id !== location._id)
      );
      setDeleteId(null);
      setSelectedId(null);

      if (editingId === location._id) closeForm();

      setMessage(`${location.name} deleted`);
      await loadLayout();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading the building layout...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page layout-page">
      <div className="library-header">
        <h2>Building Layout Management</h2>

        <Link to="/building-layout" className="create-book-link">
          Resident View
        </Link>
      </div>

      <p>
        Pick a floor, then add, edit, move or delete the locations on it.
        Changes are visible to residents straight away.
      </p>

      {planMode === "place" && (
        <p className="form-message">
          Click on the floor plan to set the position of this location.
        </p>
      )}

      {saving && <p className="form-message">Saving changes...</p>}

      {planMode === "move" && selected && !saving && (
        <p className="form-message">
          Click on the floor plan to move &quot;{selected.name}&quot;.{" "}
          <button
            type="button"
            className="secondary"
            onClick={() => setPlanMode(null)}
          >
            Cancel move
          </button>
        </p>
      )}

      <div className="layout-workspace">
        <FloorSelector floor={floor} counts={counts} onSelect={selectFloor} />

        <div className="layout-main">
          <FloorPlan
            locations={floorLocations}
            floorName={floorLabel(floor)}
            selectedId={selectedId}
            onSelectLocation={setSelectedId}
            onPlanClick={handlePlanClick}
            planMode={planMode}
            preview={
              showForm && !editingId
                ? {
                    name: form.name,
                    category: form.category,
                    x: form.x,
                    y: form.y,
                    width: form.width,
                    height: form.height,
                  }
                : null
            }
          />

          <p className="floor-plan-summary">
            {floorLabel(floor)} &middot; {floorLocations.length} location
            {floorLocations.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="layout-side panel-card">
          <div className="library-header">
            <h3>Selected</h3>

            <button type="button" onClick={openAddForm}>
              + Add Location
            </button>
          </div>

          {selected ? (
            <div className="location-details">
              <h3>{selected.name}</h3>

              <span
                className={`status-badge cat-${categoryClass(
                  selected.category
                )}`}
              >
                {selected.category}
              </span>

              <p>
                <strong>Location:</strong> {floorLabel(selected.floor)}
              </p>

              {selected.description && <p>{selected.description}</p>}

              {selected.openingHours && (
                <p>
                  <strong>Opening Hours:</strong> {selected.openingHours}
                </p>
              )}

              {selected.category === "Flat" && (
                <p>
                  <strong>Flat number:</strong>{" "}
                  {selected.flatNumber || "Not set"}
                </p>
              )}

              {selected.category === "Flat" && (
                <div className="allocation-box">
                  <strong>Residents</strong>

                  {selected.residents && selected.residents.length > 0 ? (
                    <div className="allocation-chips">
                      {selected.residents.map((resident) => (
                        <span key={resident._id} className="allocation-chip">
                          {resident.username}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>Nobody lives in this flat yet.</p>
                  )}

                  {selected.flatNumber ? (
                    <>
                      <div className="time-row">
                        <select
                          value={residentToAdd}
                          onChange={(e) => setResidentToAdd(e.target.value)}
                        >
                          <option value="">Select a resident</option>
                          {availableResidents.map((resident) => (
                            <option key={resident._id} value={resident._id}>
                              {resident.username}
                              {resident.flatNumber
                                ? ` (now in ${resident.flatNumber})`
                                : ""}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={allocateResident}
                          disabled={!residentToAdd || saving}
                        >
                          Allocate
                        </button>
                      </div>

                      <p>
                        Allocating sets the resident&apos;s flat number to{" "}
                        {selected.flatNumber}. To remove somebody, allocate them
                        to a different flat.
                      </p>
                    </>
                  ) : (
                    <p>
                      Give this flat a flat number before allocating residents.
                    </p>
                  )}
                </div>
              )}

              <div className="resource-actions">
                <button type="button" onClick={() => openEditForm(selected)}>
                  Edit
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={() => setPlanMode("move")}
                  disabled={planMode === "move"}
                >
                  Move
                </button>
              </div>
            </div>
          ) : (
            <p>Select a room on the plan to edit or move it.</p>
          )}
        </div>
      </div>

      {showForm && (
        <div className="panel-card">
          <h2>{editingId ? "Edit Location" : "Add Location"}</h2>

          <form onSubmit={submitForm} className="booking-form">
            <input
              type="text"
              placeholder="Name"
              maxLength="60"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Description (optional)"
              maxLength="300"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Opening hours, e.g. 6:00 AM - 10:00 PM (optional)"
              maxLength="60"
              value={form.openingHours}
              onChange={(e) =>
                setForm({ ...form, openingHours: e.target.value })
              }
            />

            {form.category === "Flat" && (
              <input
                type="text"
                placeholder="Flat number, e.g. 10-A"
                maxLength="6"
                value={form.flatNumber}
                onChange={(e) =>
                  setForm({ ...form, flatNumber: e.target.value.toUpperCase() })
                }
                required
              />
            )}

            <p>
              Floor: <strong>{floorLabel(floor)}</strong> (switch floors to add
              somewhere else)
            </p>

            <div className="layout-form-grid">
              <label>
                X position (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.x}
                  onChange={(e) => setForm({ ...form, x: e.target.value })}
                  required
                />
              </label>

              <label>
                Y position (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.y}
                  onChange={(e) => setForm({ ...form, y: e.target.value })}
                  required
                />
              </label>

              <label>
                Width (%)
                <input
                  type="number"
                  min="2"
                  max="100"
                  step="0.1"
                  value={form.width}
                  onChange={(e) => setForm({ ...form, width: e.target.value })}
                  required
                />
              </label>

              <label>
                Height (%)
                <input
                  type="number"
                  min="2"
                  max="100"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  required
                />
              </label>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={() => setPlanMode(planMode === "place" ? null : "place")}
            >
              {planMode === "place"
                ? "Stop picking on plan"
                : "Pick position on plan"}
            </button>

            {form.category === "Flat" && (
              <p>
                Save the flat first, then allocate residents to it from the
                panel above the plan.
              </p>
            )}

            <div className="bill-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "Add Location"}
              </button>

              <button type="button" className="secondary" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <h2>Locations on {floorLabel(floor)}</h2>

        {floorLocations.length === 0 ? (
          <p>No locations on this floor yet. Use "+ Add Location" to add one.</p>
        ) : (
          floorLocations.map((location) => (
            <div key={location._id} className="bill-card">
              <div className="bill-card-row">
                <div className="bill-info">
                  <div>
                    <p className="bill-name">{location.name}</p>
                    <p>
                      {floorLabel(location.floor)} | {location.category}
                      {location.openingHours && ` | ${location.openingHours}`}
                    </p>
                    {location.category === "Flat" && (
                      <p>
                        {location.flatNumber || "No flat number"} | Residents:{" "}
                        {location.residents && location.residents.length > 0
                          ? location.residents
                              .map((resident) => resident.username)
                              .join(", ")
                          : "Nobody yet"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bill-actions">
                  <span
                    className={`status-badge cat-${categoryClass(
                      location.category
                    )}`}
                  >
                    {location.category}
                  </span>

                  <button type="button" onClick={() => openEditForm(location)}>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setDeleteId(location._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {deleteId === location._id && (
                <div className="confirm-box">
                  <p>
                    Are you sure you want to delete this location? "
                    {location.name}" will be removed from{" "}
                    {floorLabel(location.floor)} and this cannot be undone.
                  </p>

                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Yes, Delete"}
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default ManageBuildingLayout;
