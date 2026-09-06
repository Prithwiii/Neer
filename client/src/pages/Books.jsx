import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
        // The fetch helper owns loading and error state for refreshes as well.
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    if (loading) {
        return (
            <div className="dashboard-page nx library-page">
                <div className="dash-loading" role="status">
                    <span className="dash-loading-mark" aria-hidden="true" />
                    <span>Loading books...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page nx library-page">

            <div className="dashboard-header library-header">
                <div>
                    <p className="dash-section-kicker">Neighbourhood library</p>
                    <h1>Books</h1>
                    <p>Browse books shared by residents and borrow something new.</p>
                </div>
            </div>

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
                    <div className="feature-empty-state">
                        <span className="feature-empty-icon" aria-hidden="true">▤</span>
                        <strong>No books are listed yet</strong>
                        <span>Be the first neighbour to share a book with the community.</span>
                    </div>
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