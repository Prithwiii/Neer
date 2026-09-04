import API_URL from "../config/api";

const GUEST_URL = `${API_URL}/api/guests`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

export const registerGuest = async (guestData) => {
    const response = await fetch(
        `${GUEST_URL}/register`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(guestData)
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Erro(data.message || "Failed to register guest.");
    }

    return data;
};

export const validateGuest = async (guestData) => {
    const response = await fetch(
        `${GUEST_URL}/validate`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(guestData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Guest validation failed.");
    }

    return data;
};

export const confirmGuestVisit = async (guestId) => {
    const response = await fetch(
        `${GUEST_URL}/${guestId}/confirm`,
        {
            method: "PATCH",
            headers: getAuthHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to confirm guest visit."
        );
    }

    return data;
};