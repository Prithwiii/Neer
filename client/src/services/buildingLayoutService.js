import API_URL from "../config/api";

const LAYOUT_API = `${API_URL}/api/building-layout`;

const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

const jsonHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
});

//GET every location in the building layout
export const getLocations = async (token) => {
    const response = await fetch(LAYOUT_API, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the building layout");
    }

    return data;
};

//GET the accounts that can be moved into a flat (committee only)
export const getAllocatableResidents = async (token) => {
    const response = await fetch(`${LAYOUT_API}/residents`, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the resident list");
    }

    return data;
};

//POST/create a location
export const createLocation = async (locationData, token) => {
    const response = await fetch(LAYOUT_API, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(locationData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add the location");
    }

    return data;
};

//PUT/edit a location
export const updateLocation = async (locationId, locationData, token) => {
    const response = await fetch(`${LAYOUT_API}/${locationId}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(locationData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save the location");
    }

    return data;
};

//PUT/move a marker to a new spot on the floor plan
export const updateLocationPosition = async (locationId, position, token) => {
    const response = await fetch(`${LAYOUT_API}/${locationId}/position`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(position)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to move the location");
    }

    return data;
};

//PUT/allocate residents to a flat by updating their flat number
export const allocateResidents = async (locationId, residents, token) => {
    const response = await fetch(`${LAYOUT_API}/${locationId}/residents`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify({ residents })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to allocate residents");
    }

    return data;
};

//DELETE a location
export const deleteLocation = async (locationId, token) => {
    const response = await fetch(`${LAYOUT_API}/${locationId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete the location");
    }

    return data;
};
