import API_URL from "../config/api";

// const API_URL = "http://localhost:5000/api/books";

//GET all books
export const getBooks = async() => {
    const response = await fetch(`${API_URL}/api/books`);

    if(!response.ok) {
        throw new Error("Failed to fetch books");
    }
    
    return response.json();
}

//GET one book
export const getBook = async(id) => {
    const response = await fetch(`${API_URL}/api/books/${id}`);

    if(!response.ok) {
        throw new Error("Failed to fetch book");
    }
    
    return response.json();
};

//POST/create a book
export const createBook = async(bookData, token) => {
    const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
    });

    if (!response.ok) {
        throw new Error("Failed to create book");
    }
    return response.json();
};

//POST/borrow a book
export const borrowBook = async (bookId, token) => {
    const response = await fetch(
        `${API_URL}/api/books/${bookId}/borrow`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to borrow book");
    }

    return data;
};

//PUT/return book
export const returnBook = async (bookId, token) => {
    const response = await fetch(
        `${API_URL}/api/books/${bookId}/return`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to return book");
    }

    return data;
};

//DELETE book
export const deleteBook = async (bookId, token) => {
    const response = await fetch(
        `${API_URL}/api/books/${bookId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
    }

    return data; 
};