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


    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString();
    };


    return (
        <div className="book-card">

            <h2>{book.title}</h2>

            <p>
                <strong>Author:</strong> {book.author}
            </p>

            {book.description && (
                <p>{book.description}</p>
            )}

            <p>
                <strong>Owner:</strong>{" "}
                {book.owner?.username || "Unknown"}
            </p>


            {book.available ? (

                <>
                    <p>Available</p>

                    {isAuthenticated ? (

                        isOwner ? (
                            <>
                                <p>You own this book</p>

                                <button
                                    onClick={() => onDelete(book._id)}
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onBorrow(book._id)}
                            >
                                Borrow
                            </button>
                        )

                    ) : (

                        <p>Log in to borrow</p>

                    )}
                </>

            ) : (

                <>
                    <p>Currently borrowed</p>

                    {book.returnDate && (
                        <p>
                            <strong>Return date:</strong>{" "}
                            {formatDate(book.returnDate)}
                        </p>
                    )}


                    {isBorrower && (
                        <p>You are borrowing this book.</p>
                    )}


                    {isAuthenticated &&
                        (isOwner || isBorrower) && (
                            <button
                                onClick={() => onReturn(book._id)}
                            >
                                Returned
                            </button>
                        )
                    }

                </>

            )}

        </div>
    );
};


export default BookCard;