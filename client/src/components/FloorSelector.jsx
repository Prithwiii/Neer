import { FLOORS } from "../config/buildingLayout";

// A slim elevation of the building. Picking a level swaps the plan shown
// beside it, it does not navigate anywhere.
function FloorSelector({ floor, counts, onSelect }) {
  return (
    <div className="floor-stack">
      <p className="floor-stack-title">Floor</p>

      <div
        className="floor-stack-levels"
        role="group"
        aria-label="Select a floor"
      >
        {FLOORS.map((level) => (
          <button
            key={level.key}
            type="button"
            className={`floor-stack-level ${
              floor === level.key ? "active" : ""
            }`}
            onClick={() => onSelect(level.key)}
            aria-pressed={floor === level.key}
            title={level.label}
          >
            <span className="floor-stack-key">{level.short}</span>
            <span className="floor-stack-count">
              {counts[level.key] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default FloorSelector;
