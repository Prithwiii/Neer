import API_URL from "../config/api";

const HH_URL = `${API_URL}/api/househelp`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const getHousehelpPostings = async () => {
    const response = await fetch(HH_URL, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch postings");
    }

    return data;
};

export const createHousehelpPosting = async (postingData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(postingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create posting");
  }

  return data;
};

export const closeHousehelpPosting = async (postingId) => {
  const response = await fetch(`${API_URL}/${postingId}/close`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to close posting");
  }

  return data;
};