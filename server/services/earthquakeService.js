import Alert from "../models/Alert.js";

// Placeholder building location — swap in real coordinates later.
const BUILDING_LAT = 23.8103;
const BUILDING_LON = 90.4125;

const SEARCH_RADIUS_KM = 300;
const MIN_MAGNITUDE = 4.5;
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

function buildQueryUrl() {
  const params = new URLSearchParams({
    format: "geojson",
    latitude: BUILDING_LAT,
    longitude: BUILDING_LON,
    maxradiuskm: SEARCH_RADIUS_KM,
    minmagnitude: MIN_MAGNITUDE,
    orderby: "time",
    starttime: new Date(Date.now() - POLL_INTERVAL_MS * 3).toISOString(),
  });
  return `${USGS_URL}?${params.toString()}`;
}

async function checkForEarthquakes(io) {
  try {
    const res = await fetch(buildQueryUrl());
    if (!res.ok) {
      console.error("USGS request failed:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    const quakes = data.features || [];

    for (const quake of quakes) {
      const usgsId = quake.id;
      const { mag, place, time } = quake.properties;

      const existing = await Alert.findOne({ externalId: usgsId });
      if (existing) {
        continue; // already alerted on this event
      }

      const severity = mag >= 6 ? "critical" : "warning";

      const alert = await Alert.create({
        title: `Earthquake detected: M${mag.toFixed(1)}`,
        message: `A magnitude ${mag.toFixed(1)} earthquake was detected ${place}.`,
        severity,
        type: "automated",
        source: "usgs",
        externalId: usgsId,
        active: true,
      });

      console.log(
        `New earthquake alert created (USGS id ${usgsId}, M${mag}, ${new Date(time).toISOString()})`
      );

      io.emit("newAlert", alert);
    }
  } catch (err) {
    console.error("Error checking earthquakes:", err);
  }
}

export function startEarthquakeMonitoring(io) {
  checkForEarthquakes(io);
  setInterval(() => checkForEarthquakes(io), POLL_INTERVAL_MS);
  console.log(
    `Earthquake monitoring started (polling every ${POLL_INTERVAL_MS / 60000} min)`
  );
}