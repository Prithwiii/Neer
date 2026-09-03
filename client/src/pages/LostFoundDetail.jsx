import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    LOST_FOUND_TYPES,
    ITEM_CATEGORIES,
    categoryClass,
    formatDate,
    getToday,
    readImageFile
} from "../config/lostFound";

import {
    getLostFoundPost,
    updateLostFoundPost,
    resolveLostFoundPost,
    reopenLostFoundPost,
    deleteLostFoundPost
} from "../services/lostFoundService";

function LostFoundDetail({ token, role }) {
    const { postId } = useParams();
    const navigate = useNavigate();

    const currentUserId = localStorage.getItem("userId");

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);

    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!token) return;

        const loadPost = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getLostFoundPost(postId, token);

                setPost(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [token, postId]);

    const openEdit = () => {
        setForm({
            type: post.type,
            itemName: post.itemName,
            category: post.category,
            date: post.date,
            location: post.location,
            description: post.description,
            image: post.image || ""
        });
        setEditing(true);
        setError("");
    };

    const closeEdit = () => {
        setEditing(false);
        setForm(null);
    };

    const pickImage = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        try {
            setError("");

            const image = await readImageFile(file);

            setForm((current) => ({ ...current, image }));
        } catch (err) {
            setError(err.message);
        } finally {
            event.target.value = "";
        }
    };

    const saveEdit = async (event) => {
        event.preventDefault();

        try {
            setBusy(true);
            setError("");

            const updated = await updateLostFoundPost(postId, form, token);

            setPost(updated);
            closeEdit();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const changeStatus = async (resolve) => {
        try {
            setBusy(true);
            setError("");

            const updated = resolve
                ? await resolveLostFoundPost(postId, token)
                : await reopenLostFoundPost(postId, token);

            setPost(updated);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const removePost = async () => {
        try {
            setBusy(true);
            setError("");

            await deleteLostFoundPost(postId, token);

            navigate("/lost-found");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading the post...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="dashboard-page">
                <div className="library-header">
                    <h2>Lost &amp; Found</h2>

                    <Link to="/lost-found" className="create-book-link">
                        Back to the board
                    </Link>
                </div>

                <p className="form-message">
                    {error || "This post is not available."}
                </p>
            </div>
        );
    }

    const isOwner =
        currentUserId && post.postedBy && post.postedBy._id === currentUserId;

    // committee members act as the moderators for the board, they can take a
    // post down but they cannot edit somebody else's wording
    const canModerate = role === "committee";

    // "Returned" reads oddly for a lost item the owner got back, so the wording
    // follows whichever way round the post was made
    const resolveLabel =
        post.type === "Lost" ? "Mark as Found" : "Mark as Returned";

    return (
        <div className="dashboard-page">
            <div className="library-header">
                <div>
                    <h2>
                        <span className={`type-tag type-${post.type.toLowerCase()}`}>
                            {post.type}
                        </span>{" "}
                        {post.itemName}
                    </h2>
                </div>

                <Link to="/lost-found" className="create-book-link">
                    Back
                </Link>
            </div>

            {error && <p className="form-message">{error}</p>}

            {editing ? (
                <div className="panel-card">
                    <h3>Edit Post</h3>

                    <form onSubmit={saveEdit} className="booking-form">
                        <div className="type-choice">
                            {LOST_FOUND_TYPES.map((type) => (
                                <label key={type}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={type}
                                        checked={form.type === type}
                                        onChange={() => setForm({ ...form, type })}
                                    />{" "}
                                    I {type.toLowerCase()} this item
                                </label>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Item name"
                            maxLength={60}
                            value={form.itemName}
                            onChange={(event) =>
                                setForm({ ...form, itemName: event.target.value })
                            }
                            required
                        />

                        <select
                            value={form.category}
                            onChange={(event) =>
                                setForm({ ...form, category: event.target.value })
                            }
                        >
                            {ITEM_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            max={getToday()}
                            value={form.date}
                            onChange={(event) =>
                                setForm({ ...form, date: event.target.value })
                            }
                            required
                        />

                        <input
                            type="text"
                            placeholder="Location"
                            maxLength={80}
                            value={form.location}
                            onChange={(event) =>
                                setForm({ ...form, location: event.target.value })
                            }
                            required
                        />

                        <textarea
                            placeholder="Description"
                            maxLength={500}
                            rows={3}
                            value={form.description}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    description: event.target.value
                                })
                            }
                            required
                        />

                        <label className="image-field">
                            Picture (optional)
                            <input type="file" accept="image/*" onChange={pickImage} />
                        </label>

                        {form.image && (
                            <div className="image-preview">
                                <img src={form.image} alt="Item preview" />

                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setForm({ ...form, image: "" })}
                                >
                                    Remove Picture
                                </button>
                            </div>
                        )}

                        <div className="bill-actions">
                            <button type="submit" disabled={busy}>
                                {busy ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={closeEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel-card lost-found-detail">
                    {post.image && (
                        <img
                            className="lost-found-photo"
                            src={post.image}
                            alt={post.itemName}
                        />
                    )}

                    <p>
                        <strong>Status:</strong>{" "}
                        <span
                            className={`status-badge ${
                                post.status === "Returned" ? "paid" : "pending"
                            }`}
                        >
                            {post.status}
                        </span>
                    </p>

                    <p>
                        <strong>Category:</strong>{" "}
                        <span
                            className={`status-badge cat-${categoryClass(
                                post.category
                            )}`}
                        >
                            {post.category}
                        </span>
                    </p>

                    <p>
                        <strong>Date:</strong> {formatDate(post.date)}
                    </p>

                    <p>
                        <strong>Location:</strong> {post.location}
                    </p>

                    <p>
                        <strong>Description:</strong> {post.description}
                    </p>

                    <p>
                        <strong>Posted by:</strong>{" "}
                        {post.postedBy
                            ? `${post.postedBy.username}${
                                  post.postedBy.flatNumber
                                      ? ` (Flat ${post.postedBy.flatNumber})`
                                      : ""
                              }`
                            : "a former resident"}
                    </p>

                    {post.status === "Returned" && post.resolvedAt && (
                        <p>
                            <strong>Closed on:</strong>{" "}
                            {new Date(post.resolvedAt).toLocaleDateString()}
                        </p>
                    )}

                    {!isOwner && post.status === "Active" && (
                        <p className="privacy-hint">
                            Recognise this item? Reach the poster through the
                            Contact Directory or the intercom using their flat
                            number above.
                        </p>
                    )}

                    {(isOwner || canModerate) && (
                        <div className="bill-actions">
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={openEdit}
                                    disabled={busy}
                                >
                                    Edit Post
                                </button>
                            )}

                            {isOwner && post.status === "Active" && (
                                <button
                                    type="button"
                                    onClick={() => changeStatus(true)}
                                    disabled={busy}
                                >
                                    {resolveLabel}
                                </button>
                            )}

                            {isOwner && post.status === "Returned" && (
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => changeStatus(false)}
                                    disabled={busy}
                                >
                                    Reopen Post
                                </button>
                            )}

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setConfirmDelete(true)}
                                disabled={busy}
                            >
                                {isOwner ? "Delete Post" : "Remove Post"}
                            </button>
                        </div>
                    )}

                    {confirmDelete && (
                        <div className="confirm-box">
                            <p>Are you sure you want to delete this post?</p>

                            <button
                                type="button"
                                onClick={removePost}
                                disabled={busy}
                            >
                                Yes, Delete
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LostFoundDetail;
