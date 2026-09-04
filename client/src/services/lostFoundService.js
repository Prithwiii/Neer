import API_URL from "../config/api";

const LOST_FOUND_API = `${API_URL}/api/lost-found`;

const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

const jsonHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
});

//GET the board, filters and the search term are all optional
export const getLostFoundPosts = async (filters, token) => {
    const query = new URLSearchParams();

    if (filters.search) query.set("search", filters.search);
    if (filters.type && filters.type !== "All") query.set("type", filters.type);
    if (filters.category && filters.category !== "All") {
        query.set("category", filters.category);
    }
    if (filters.status && filters.status !== "All") {
        query.set("status", filters.status);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";

    const response = await fetch(`${LOST_FOUND_API}${suffix}`, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the lost and found board");
    }

    return data;
};

//GET one post, this is the only response that carries the picture
export const getLostFoundPost = async (postId, token) => {
    const response = await fetch(`${LOST_FOUND_API}/${postId}`, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the post");
    }

    return data;
};

//POST/report a lost or found item
export const createLostFoundPost = async (postData, token) => {
    const response = await fetch(LOST_FOUND_API, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create the post");
    }

    return data;
};

//PUT/edit your own post
export const updateLostFoundPost = async (postId, postData, token) => {
    const response = await fetch(`${LOST_FOUND_API}/${postId}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save the post");
    }

    return data;
};

//PATCH/mark the item as returned
export const resolveLostFoundPost = async (postId, token) => {
    const response = await fetch(`${LOST_FOUND_API}/${postId}/resolve`, {
        method: "PATCH",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to mark the item as returned");
    }

    return data;
};

//PATCH/put the post back on the board as active
export const reopenLostFoundPost = async (postId, token) => {
    const response = await fetch(`${LOST_FOUND_API}/${postId}/reopen`, {
        method: "PATCH",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to reopen the post");
    }

    return data;
};

//DELETE a post
export const deleteLostFoundPost = async (postId, token) => {
    const response = await fetch(`${LOST_FOUND_API}/${postId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete the post");
    }

    return data;
};
