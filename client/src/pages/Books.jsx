import { useEffect, useState } from "react";

import {
    getBooks,
    borrowBook,
    returnBook,
    deleteBook
} from "../services/bookService";

import BookCard from "../components/BookCard";


const Books = () => {

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const token = localStorage.getItem("token");


    const fetchBooks = async () => {
        try {
            setLoading(true);

            const data = await getBooks();

            setBooks(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBooks();
    }, []);


    const handleBorrow = async (bookId) => {
        if (!token) {
            setError("Please log in to borrow a book.");
            return;
        }

        try {
            await borrowBook(bookId, token);

            await fetchBooks();
        } catch (error) {
            setError(error.message);
        }
    };


    const handleReturn = async (bookId) => {
        if (!token) {
            setError("Please log in to return a book.");
            return;
        }

        try {
            await returnBook(bookId, token);

            await fetchBooks();
        } catch (error) {
            setError(error.message);
        }
    };


    if (loading) {
        return <p>Loading books...</p>;
    }


    const handleDelete = async (bookId) => {
        if (!token) {
            setError("Please log in to delete a book.");
            return;
        }

        try {
            await deleteBook(bookId, token);

            await fetchBooks();
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <div>

            <h1>Available Books</h1>

            {error && (
                <p>{error}</p>
            )}

            <div className="books-grid">

                {books.map((book) => (
                    <BookCard
                        key={book._id}
                        book={book}
                        isAuthenticated={!!token}
                        onBorrow={handleBorrow}
                        onReturn={handleReturn}
                        onDelete={handleDelete}
                    />
                ))}

            </div>

        </div>
    );
};


export default Books;