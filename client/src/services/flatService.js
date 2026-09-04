import API_URL from "../config/api";

const FLAT_API = `${API_URL}/api/flats`;

export const getFlats = async() => {
    const response = await fetch(`${FLAT_API}`);

    if (!response.ok) {
        throw new Error("failed to fetch flats");
    }
    return response.json();
};

export const updateFlatState = async (id, state, token) => {
    const response = await fetch(` ${FLAT_API}/${id}/state`, 
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({state})
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update flat state");
    }
    return response.json();
};