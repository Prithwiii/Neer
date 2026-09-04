import API_URL from "../config/api";

const CAMERA_API = `${API_URL}/api/cameras`;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// GET every camera in the building
export const getCameras = async (token) => {
  const response = await fetch(CAMERA_API, {
    headers: authHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load cameras");
  }

  return data;
};

// POST/add a camera (committee only)
export const addCamera = async (cameraData, token) => {
  const response = await fetch(CAMERA_API, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(cameraData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add the camera");
  }

  return data;
};

// PUT/toggle a camera's online/offline status (committee only)
export const setCameraStatus = async (cameraId, status, token) => {
  const response = await fetch(`${CAMERA_API}/${cameraId}/status`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update the camera");
  }

  return data;
};

// DELETE a camera (committee only)
export const deleteCamera = async (cameraId, token) => {
  const response = await fetch(`${CAMERA_API}/${cameraId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete the camera");
  }

  return data;
};
