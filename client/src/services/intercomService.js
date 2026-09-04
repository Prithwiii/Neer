import API_URL from "../config/api";

const INTERCOM_API = `${API_URL}/api/intercom`;

export const updateIntercomAccess = async ({
    email,
    intercomEnabled,
    intercomAccess,
}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${INTERCOM_API}/access`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            email,
            intercomEnabled,
            intercomAccess,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update intercom access");
    }
    return data;
};

export const getIntercomUser = async (email) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${INTERCOM_API}/user?email=${encodeURIComponent(email)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to find user");
    }

    return data;
};

export const startIntercomCall = async (residentEmail) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/intercom/call`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({residentEmail}),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to start intercom call");
    }

    return data;
};