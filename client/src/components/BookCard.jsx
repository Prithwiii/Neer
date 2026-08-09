const BookCard = ({
    book,
    isAuthenticated,
    onBorrow,
    onReturn,
    onDelete
}) => {

    const userId = localStorage.getItem("userId");

    const isOwner =
        userId &&
        book.owner?._id === userId;

    const isBorrower =
        userId &&
        book.borrowedBy?._id === userId;

    return (
        <div className="book-card">

            <h3>{book.title}</h3>

            <p>
                <strong>Author:</strong>{" "}
                {book.author}
            </p>

            <p>
                <strong>Owner:</strong>{" "}
                {book.owner?.username || "Unknown"}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {book.available
                    ? "Available"
                    : "Borrowed"}
            </p>

            {!book.available && book.borrowedBy && (
                <p>
                    <strong>Borrowed by:</strong>{" "}
                    {book.borrowedBy.username}
                </p>
            )}

            {!book.available && book.returnDate && (
                <p>
                    <strong>Return date:</strong>{" "}
                    {new Date(book.returnDate).toLocaleDateString()}
                </p>
            )}

            <div className="book-actions">

                {isAuthenticated && book.available && (
                    <button
                        onClick={() => onBorrow(book._id)}
                    >
                        Borrow
                    </button>
                )}

                {isAuthenticated && !book.available && isBorrower && (
                    <button
                        className="secondary"
                        onClick={() => onReturn(book._id)}
                    >
                        Return
                    </button>
                )}

                {isAuthenticated && isOwner && book.available && (
                    <button
                        className="secondary"
                        onClick={() => onDelete(book._id)}
                    >
                        Delete
                    </button>
                )}

            </div>

        </div>
    );
};

export default BookCard;