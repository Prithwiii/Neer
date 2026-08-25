import { useState } from "react";

import { categoryClass } from "../config/buildingLayout";

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

const round1 = (value) => Math.round(value * 10) / 10;
const clamp = (value) => Math.min(100, Math.max(0, value));

// Draws one floor of the building. Markers are placed using the percentage
// position stored on each location, so the plan looks the same at any size.
function FloorPlan({
  locations,
  floorName,
  selectedId,
  onSelectLocation,
  onPlanClick,
  planMode,
  preview,
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  const placing = !!planMode;

  const handlePlanClick = (event) => {
    if (!placing || !onPlanClick) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    onPlanClick({ x: round1(clamp(x)), y: round1(clamp(y)) });
  };

  const handleMarkerClick = (event, location) => {
    // while placing, a click anywhere on the plan sets the position instead
    if (placing) return;

    event.stopPropagation();
    onSelectLocation(location._id === selectedId ? null : location._id);
  };

  const usedCategories = [...new Set(locations.map((item) => item.category))];

  return (
    <div className="floor-plan">
      <div className="floor-plan-bar">
        <h3>{floorName}</h3>

        <div className="floor-plan-zoom">
          <button
            type="button"
            className="secondary"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            &minus;
          </button>

          <span className="floor-plan-zoom-value">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            className="secondary"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => setZoom(MIN_ZOOM)}
            disabled={zoom === MIN_ZOOM}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="floor-plan-viewport">
        <div
          className={`floor-plan-surface ${placing ? "placing" : ""}`}
          style={{ width: `${zoom * 100}%` }}
          onClick={handlePlanClick}
        >
          <div className="floor-plan-slab" />

          {locations.length === 0 && (
            <p className="floor-plan-empty">
              No locations have been added to this floor yet.
            </p>
          )}

          {locations.map((location) => (
            <button
              key={location._id}
              type="button"
              className={`plan-marker cat-${categoryClass(location.category)} ${
                location._id === selectedId ? "selected" : ""
              }`}
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                width: `${location.width}%`,
                height: `${location.height}%`,
              }}
              onClick={(event) => handleMarkerClick(event, location)}
              title={`${location.name} (${location.category})`}
            >
              <span className="plan-marker-name">{location.name}</span>
            </button>
          ))}

          {preview && (
            <div
              className={`plan-marker preview cat-${categoryClass(
                preview.category
              )}`}
              style={{
                left: `${preview.x}%`,
                top: `${preview.y}%`,
                width: `${preview.width}%`,
                height: `${preview.height}%`,
              }}
            >
              <span className="plan-marker-name">
                {preview.name || "New location"}
              </span>
            </div>
          )}
        </div>
      </div>

      {usedCategories.length > 0 && (
        <div className="floor-plan-legend">
          {usedCategories.map((category) => (
            <span key={category} className="floor-plan-legend-item">
              <span className={`legend-swatch cat-${categoryClass(category)}`} />
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FloorPlan;
