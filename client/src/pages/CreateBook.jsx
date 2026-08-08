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
        <div>

            <h1>Put a Book Up for Borrowing</h1>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>
                        Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />
                </div>


                <div>
                    <label>
                        Author
                    </label>

                    <input
                        type="text"
                        value={author}
                        onChange={(event) =>
                            setAuthor(event.target.value)
                        }
                        required
                    />
                </div>


                <div>
                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>


                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Putting up book..."
                        : "Put Book Up for Borrowing"
                    }
                </button>

            </form>

        </div>
    );
};


export default CreateBook;