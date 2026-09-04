import { useEffect, useState } from "react";

import FloorSelector from "../components/FloorSelector";
import CameraFeed from "../components/CameraFeed";
import { floorLabel } from "../config/buildingLayout";
import {
  getCameras,
  addCamera,
  setCameraStatus,
  deleteCamera,
} from "../services/cameraService";

function Surveillance({ token, role }) {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [floor, setFloor] = useState("G");

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = role === "committee";

  const loadCameras = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCameras(token);
      setCameras(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAddCamera = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Camera name is required");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await addCamera({ name, floor, location, streamUrl }, token);

      setName("");
      setLocation("");
      setStreamUrl("");
      setShowAddForm(false);

      await loadCameras();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (camera) => {
    try {
      const nextStatus = camera.status === "online" ? "offline" : "online";
      await setCameraStatus(camera._id, nextStatus, token);
      await loadCameras();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (camera) => {
    if (!window.confirm(`Remove "${camera.name}"?`)) return;

    try {
      await deleteCamera(camera._id, token);
      await loadCameras();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const counts = cameras.reduce((totals, camera) => {
    totals[camera.floor] = (totals[camera.floor] || 0) + 1;
    return totals;
  }, {});

  const floorCameras = cameras.filter((camera) => camera.floor === floor);
  const onlineCount = floorCameras.filter((c) => c.status === "online").length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading cameras...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page layout-page">
      <div className="library-header">
        <h2>Surveillance</h2>

        {canManage && (
          <button
            type="button"
            className="create-book-link"
            onClick={() => setShowAddForm((open) => !open)}
          >
            {showAddForm ? "Cancel" : "Add Camera"}
          </button>
        )}
      </div>

      <p>Pick a floor to see the cameras covering that level.</p>

      {error && <p className="form-message">{error}</p>}
      {message && <p className="form-message">{message}</p>}

      {canManage && showAddForm && (
        <form className="panel-card camera-add-form" onSubmit={handleAddCamera}>
          <h3>Add a camera to {floorLabel(floor)}</h3>

          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Lobby Entrance"
              required
            />
          </label>

          <label>
            Location details (optional)
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Facing the main door"
            />
          </label>

          <label>
            Stream URL (optional)
            <input
              type="text"
              value={streamUrl}
              onChange={(event) => setStreamUrl(event.target.value)}
              placeholder="http://camera-ip/snapshot.mjpg"
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add Camera"}
          </button>
        </form>
      )}

      <div className="layout-workspace camera-workspace">
        <FloorSelector floor={floor} counts={counts} onSelect={setFloor} />

        <div className="layout-main">
          <p className="floor-plan-summary">
            {floorLabel(floor)} &middot; {floorCameras.length} camera
            {floorCameras.length === 1 ? "" : "s"}
            {floorCameras.length > 0 && ` · ${onlineCount} online`}
          </p>

          {floorCameras.length === 0 ? (
            <div className="panel-card">
              <p>No cameras have been added on this floor yet.</p>
            </div>
          ) : (
            <div className="camera-grid">
              {floorCameras.map((camera) => (
                <CameraFeed
                  key={camera._id}
                  camera={camera}
                  canManage={canManage}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Surveillance;
