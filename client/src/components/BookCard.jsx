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
        <article className="book-card">

            <div className="book-card-heading">
                <h3>{book.title}</h3>
                <span className={`status-badge ${book.available ? "book-available" : "book-borrowed"}`}>
                    {book.available ? "Available" : "Borrowed"}
                </span>
            </div>

            <p>
                <span className="book-detail-label">Author</span>
                {book.author}
            </p>

            <p>
                <span className="book-detail-label">Shared by</span>
                {book.owner?.username || "Unknown"}
            </p>

            {!book.available && book.borrowedBy && (
                <p>
                    <span className="book-detail-label">Borrowed by</span>
                    {book.borrowedBy.username}
                </p>
            )}

            {!book.available && book.returnDate && (
                <p>
                    <span className="book-detail-label">Return date</span>
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

        </article>
    );
};

export default BookCard;