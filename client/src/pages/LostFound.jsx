import { useCallback, useEffect, useState } from "react";

import LostFoundCard from "../components/LostFoundCard";

import {
    LOST_FOUND_TYPES,
    ITEM_CATEGORIES,
    POST_STATUSES,
    getToday,
    readImageFile
} from "../config/lostFound";

import {
    getLostFoundPosts,
    createLostFoundPost
} from "../services/lostFoundService";

const emptyFilters = {
    search: "",
    type: "All",
    category: "All",
    status: "All"
};

const emptyForm = {
    type: "Lost",
    itemName: "",
    category: "Other",
    date: getToday(),
    location: "",
    description: "",
    image: ""
};

function LostFound({ token }) {
    const [posts, setPosts] = useState([]);
    const [summary, setSummary] = useState({ total: 0, active: 0, returned: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // the term in the box, kept apart from the one the board is showing so the
    // board only reloads when the search is actually submitted
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState(emptyFilters);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getLostFoundPosts(filters, token);

            setPosts(data.posts);
            setSummary(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, token]);

    useEffect(() => {
        if (!token) return;

        (async () => {
            await loadPosts();
        })();
    }, [token, loadPosts]);

    const submitSearch = (event) => {
        event.preventDefault();

        setFilters((current) => ({ ...current, search: searchTerm.trim() }));
    };

    const changeFilter = (name, value) => {
        setFilters((current) => ({ ...current, [name]: value }));
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilters(emptyFilters);
    };

    const openForm = () => {
        setForm(emptyForm);
        setShowForm(true);
        setError("");
    };

    const closeForm = () => {
        setShowForm(false);
        setForm(emptyForm);
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
            // lets the same file be chosen again after it is removed
            event.target.value = "";
        }
    };

    const submitForm = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            await createLostFoundPost(form, token);

            closeForm();
            await loadPosts();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filtersApplied =
        filters.search !== "" ||
        filters.type !== "All" ||
        filters.category !== "All" ||
        filters.status !== "All";

    return (
        <div className="dashboard-page">
            <div className="library-header">
                <h2>Lost &amp; Found</h2>

                {!showForm && (
                    <button type="button" onClick={openForm}>
                        Post an Item
                    </button>
                )}
            </div>

            <p>
                Report something you have lost or found in the building. Posts stay
                on the board so neighbours can search them.
            </p>

            {error && <p className="form-message">{error}</p>}

            {showForm && (
                <div className="panel-card">
                    <h3>
                        {form.type === "Lost"
                            ? "Report Lost Item"
                            : "Report Found Item"}
                    </h3>

                    <form onSubmit={submitForm} className="booking-form">
                        <div className="type-choice">
                            {LOST_FOUND_TYPES.map((type) => (
                                <label key={type}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={type}
                                        checked={form.type === type}
                                        onChange={() =>
                                            setForm({ ...form, type })
                                        }
                                    />{" "}
                                    I {type.toLowerCase()} this item
                                </label>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Item name, e.g. Black Wallet"
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
                            placeholder="Location, e.g. Building Lobby"
                            maxLength={80}
                            value={form.location}
                            onChange={(event) =>
                                setForm({ ...form, location: event.target.value })
                            }
                            required
                        />

                        <textarea
                            placeholder="Description, e.g. Black leather wallet with several cards"
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
                            <input
                                type="file"
                                accept="image/*"
                                onChange={pickImage}
                            />
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

                        <p className="privacy-hint">
                            Your name and flat number are shown on the post so a
                            neighbour can return the item. Please do not put phone
                            numbers or other private details in the description.
                        </p>

                        <div className="bill-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? "Posting..." : "Publish Post"}
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="panel-card lost-found-filters">
                <form onSubmit={submitSearch} className="search-row">
                    <input
                        type="search"
                        placeholder="Search item, description, location or category"
                        maxLength={60}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />

                    <button type="submit">Search</button>
                </form>

                <div className="filter-row">
                    <label>
                        Type
                        <select
                            value={filters.type}
                            onChange={(event) =>
                                changeFilter("type", event.target.value)
                            }
                        >
                            <option value="All">All</option>

                            {LOST_FOUND_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Category
                        <select
                            value={filters.category}
                            onChange={(event) =>
                                changeFilter("category", event.target.value)
                            }
                        >
                            <option value="All">All</option>

                            {ITEM_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Status
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                changeFilter("status", event.target.value)
                            }
                        >
                            <option value="All">All</option>

                            {POST_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>

                    {filtersApplied && (
                        <button
                            type="button"
                            className="secondary"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <p>Loading the lost and found board...</p>
            ) : posts.length === 0 ? (
                <div className="panel-card">
                    <p>
                        {filtersApplied
                            ? "No posts match your search. Try a different word or clear the filters."
                            : "Nothing has been posted to the board yet. Be the first to report a lost or found item."}
                    </p>
                </div>
            ) : (
                <>
                    <p className="lost-found-summary">
                        Showing {summary.total} post
                        {summary.total === 1 ? "" : "s"} &middot; {summary.active}{" "}
                        active &middot; {summary.returned} returned
                    </p>

                    <div className="lost-found-grid">
                        {posts.map((post) => (
                            <LostFoundCard key={post._id} post={post} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default LostFound;
