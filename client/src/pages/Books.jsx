import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError("");

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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading books...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Library</h1>
                    <p>
                        Browse books available for borrowing.
                    </p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <nav className="top-nav">
                <Link to="/proposals">Proposals</Link>
                <Link to="/bookings">Bookings</Link>
                <Link to="/noticeboard">Noticeboard</Link>
                <Link to="/books">Library</Link>
            </nav>

            <div className="panel-card">

                <div className="library-header">
                    <h2>Available Books</h2>

                    {token && (
                        <Link
                            to="/books/create"
                            className="create-book-link"
                        >
                            Create book listing
                        </Link>
                    )}
                </div>

                {error && (
                    <p className="form-message">
                        {error}
                    </p>
                )}

                {books.length === 0 ? (
                    <p>No books are currently listed.</p>
                ) : (
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
                )}

            </div>

        </div>
    );
};

export default Books;