import { useState } from "react";

// Renders one camera's feed. Most IP/CCTV cameras expose an MJPEG snapshot
// or stream over plain HTTP, so an <img> tag is enough once a real
// camera's streamUrl is set. Until then (or if the stream fails to load)
// this falls back to a placeholder so the layout still makes sense.
function CameraFeed({ camera, onToggleStatus, onDelete, canManage }) {
  const [streamFailed, setStreamFailed] = useState(false);

  const isOffline = camera.status === "offline";
  const showPlaceholder = isOffline || !camera.streamUrl || streamFailed;

  return (
    <div className={`camera-tile ${isOffline ? "camera-offline" : ""}`}>
      <div className="camera-feed-visual">
        {showPlaceholder ? (
          <div className="camera-feed-placeholder">
            {isOffline ? (
              <span className="camera-feed-icon">⦰</span>
            ) : (
              <span className="camera-feed-icon">▣</span>
            )}
            <span>{isOffline ? "Camera offline" : "No live preview"}</span>
          </div>
        ) : (
          <img
            src={camera.streamUrl}
            alt={`${camera.name} live feed`}
            onError={() => setStreamFailed(true)}
          />
        )}

        <span
          className={`camera-status-pill ${isOffline ? "offline" : "live"}`}
        >
          {isOffline ? "OFFLINE" : "● LIVE"}
        </span>
      </div>

      <div className="camera-feed-info">
        <h4>{camera.name}</h4>
        {camera.location && <p>{camera.location}</p>}
      </div>

      {canManage && (
        <div className="camera-feed-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => onToggleStatus(camera)}
          >
            Mark {isOffline ? "Online" : "Offline"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => onDelete(camera)}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraFeed;
