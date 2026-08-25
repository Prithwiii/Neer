import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import FloorSelector from "../components/FloorSelector";
import FloorPlan from "../components/FloorPlan";
import { floorLabel, categoryClass } from "../config/buildingLayout";
import { getLocations } from "../services/buildingLayoutService";

function BuildingLayout({ token, role }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [floor, setFloor] = useState("G");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadLayout = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getLocations(token);

        setLocations(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [token]);

  const selectFloor = (nextFloor) => {
    setFloor(nextFloor);
    setSelectedId(null);
  };

  const floorLocations = locations.filter((item) => item.floor === floor);
  const selected = floorLocations.find((item) => item._id === selectedId);

  const counts = locations.reduce((totals, item) => {
    totals[item.floor] = (totals[item.floor] || 0) + 1;
    return totals;
  }, {});

  const flatCount = floorLocations.filter(
    (item) => item.category === "Flat"
  ).length;

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
        <h2>Building Layout</h2>

        {role === "committee" && (
          <Link to="/building-layout/manage" className="create-book-link">
            Manage Building Layout
          </Link>
        )}
      </div>

      <p>
        Pick a floor from the building selector, then select a room to see what
        it is.
      </p>

      {error && <p className="form-message">{error}</p>}

      {locations.length === 0 && !error ? (
        <div className="panel-card">
          <p>
            The building layout has not been set up yet. A committee member
            needs to add locations before it can be viewed.
          </p>
        </div>
      ) : (
        <div className="layout-workspace">
          <FloorSelector
            floor={floor}
            counts={counts}
            onSelect={selectFloor}
          />

          <div className="layout-main">
            <FloorPlan
              locations={floorLocations}
              floorName={floorLabel(floor)}
              selectedId={selectedId}
              onSelectLocation={setSelectedId}
            />

            <p className="floor-plan-summary">
              {floorLabel(floor)} &middot; {floorLocations.length} location
              {floorLocations.length === 1 ? "" : "s"}
              {flatCount > 0 && ` · ${flatCount} flats`}
            </p>
          </div>

          <div className="layout-side panel-card">
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

                {selected.category === "Flat" && selected.flatNumber && (
                  <p>
                    <strong>Flat number:</strong> {selected.flatNumber}
                  </p>
                )}

                {selected.category === "Flat" && (
                  <p>
                    <strong>Residents:</strong>{" "}
                    {selected.residents && selected.residents.length > 0
                      ? selected.residents
                          .map((resident) => resident.username)
                          .join(", ")
                      : "Nobody yet"}
                  </p>
                )}
              </div>
            ) : (
              <p>Select a room on the plan to see its details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingLayout;
