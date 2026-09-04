import { useEffect, useState } from "react";
import API_URL from "../config/api";
import App from "../App";

function Noticeboard() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [postError, setPostError] = useState("");

    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    const fetchNotices = async () => {
        try {
            const response = await fetch(
                // "http://localhost:5001/api/notices",
                `${API_URL}/api/notices`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to load notices");
                return;
            }

            setNotices(data);

        } catch (error) {
            setError("Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handlePostNotice = async (event) => {
        event.preventDefault();
        setPostError("");

        try {
            const response = await fetch(
                // "http://localhost:5001/api/notices",
                `${API_URL}/api/notices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, category })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPostError(data.message || "Failed to post notice");
                return;
            }

            setTitle("");
            setDescription("");
            setCategory("General");
            fetchNotices();

        } catch (error) {
            setPostError("Could not connect to server");
        }
    };

    if (loading) {
        return <p>Loading notices...</p>;
    }

    return (
        <div>
            <h1>Building Noticeboard</h1>

            {role === "committee" && (
                <form onSubmit={handlePostNotice}>
                    <h2>Post a Notice</h2>

                    {postError && <p>{postError}</p>}

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Notice title"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Notice description"
                        required
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>General</option>
                        <option>Maintenance</option>
                        <option>Emergency</option>
                        <option>Event</option>
                    </select>

                    <button type="submit">Post Notice</button>
                </form>
            )}

            {error && <p>{error}</p>}

            {notices.length === 0 ? (
                <p>No notices available.</p>
            ) : (
                notices.map((notice) => (
                    <div key={notice._id}>
                        <h2>{notice.title}</h2>

                        <p>{notice.description}</p>

                        <p>
                            Category: {notice.category}
                        </p>

                        <p>
                            Posted by: {notice.postedBy?.username}
                        </p>

                        <p>
                            Posted on:{" "}
                            {new Date(notice.createdAt).toLocaleDateString()}
                        </p>

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default Noticeboard;