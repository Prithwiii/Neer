import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook } from "../services/bookService";


const CreateBook = ({ token }) => {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createBook(
                {
                    title,
                    author,
                    description
                },
                token
            );

            // Return to the books page after successful creation
            navigate("/books", {
                state: {
                    message: "Book successfully put up for borrowing!"
                }
            });

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="dashboard-page nx library-page create-book-page">

            <div className="dashboard-header library-header">
                <div>
                    <p className="dash-section-kicker">Neighbourhood library</p>
                    <h1>Share a book</h1>
                    <p>Add a title to the community borrowing shelf.</p>
                </div>
            </div>

            {error && (
                <p className="form-message error-message">{error}</p>
            )}

            <form className="panel-card book-form" onSubmit={handleSubmit}>

                <div className="book-form-heading">
                    <h2>Book details</h2>
                    <p>Give neighbours enough information to recognise and choose the book.</p>
                </div>

                <div>
                    <label htmlFor="book-title">Title</label>

                    <input
                        id="book-title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />
                </div>


                <div>
                    <label htmlFor="book-author">Author</label>

                    <input
                        id="book-author"
                        type="text"
                        value={author}
                        onChange={(event) =>
                            setAuthor(event.target.value)
                        }
                        required
                    />
                </div>


                <div>
                    <label htmlFor="book-description">Description</label>

                    <textarea
                        id="book-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>


                <div className="book-form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Putting up book..." : "Share book"}
                    </button>
                </div>

            </form>

        </div>
    );
};


export default CreateBook;