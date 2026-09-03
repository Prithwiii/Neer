import API_URL from "../config/api";

const FAMILY_API = `${API_URL}/api/family-expenses`;

const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

const jsonHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
});

//GET the sheets the signed in user owns or has access to
export const getFamilySheets = async (token) => {
    const response = await fetch(`${FAMILY_API}/sheets`, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load your family sheets");
    }

    return data;
};

//POST/create a family expense sheet
export const createFamilySheet = async (sheetData, token) => {
    const response = await fetch(`${FAMILY_API}/sheets`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(sheetData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create the family sheet");
    }

    return data;
};

//GET one family expense sheet
export const getFamilySheet = async (sheetId, token) => {
    const response = await fetch(`${FAMILY_API}/sheets/${sheetId}`, {
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the family sheet");
    }

    return data;
};

//PUT/rename a family expense sheet
export const updateFamilySheet = async (sheetId, sheetData, token) => {
    const response = await fetch(`${FAMILY_API}/sheets/${sheetId}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(sheetData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save the family sheet");
    }

    return data;
};

//DELETE a family expense sheet and everything on it
export const deleteFamilySheet = async (sheetId, token) => {
    const response = await fetch(`${FAMILY_API}/sheets/${sheetId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete the family sheet");
    }

    return data;
};

//GET the residents the owner can still add to the sheet
export const getAvailableMembers = async (sheetId, search, token) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";

    const response = await fetch(
        `${FAMILY_API}/sheets/${sheetId}/members/available${query}`,
        {
            headers: authHeaders(token)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the resident list");
    }

    return data;
};

//POST/give a resident access to the sheet
export const addFamilyMember = async (sheetId, userId, token) => {
    const response = await fetch(`${FAMILY_API}/sheets/${sheetId}/members`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ userId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add the family member");
    }

    return data;
};

//DELETE a member's access to the sheet
export const removeFamilyMember = async (sheetId, userId, token) => {
    const response = await fetch(
        `${FAMILY_API}/sheets/${sheetId}/members/${userId}`,
        {
            method: "DELETE",
            headers: authHeaders(token)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to remove the family member");
    }

    return data;
};

//GET the expenses for one month, together with the summary figures
export const getFamilyExpenses = async (sheetId, month, token) => {
    const query = month ? `?month=${month}` : "";

    const response = await fetch(
        `${FAMILY_API}/sheets/${sheetId}/expenses${query}`,
        {
            headers: authHeaders(token)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to load the expenses");
    }

    return data;
};

//POST/add an expense to the sheet
export const createFamilyExpense = async (sheetId, expenseData, token) => {
    const response = await fetch(
        `${FAMILY_API}/sheets/${sheetId}/expenses`,
        {
            method: "POST",
            headers: jsonHeaders(token),
            body: JSON.stringify(expenseData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add the expense");
    }

    return data;
};

//PUT/edit an expense
export const updateFamilyExpense = async (expenseId, expenseData, token) => {
    const response = await fetch(`${FAMILY_API}/expenses/${expenseId}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(expenseData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save the expense");
    }

    return data;
};

//DELETE an expense
export const deleteFamilyExpense = async (expenseId, token) => {
    const response = await fetch(`${FAMILY_API}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete the expense");
    }

    return data;
};
