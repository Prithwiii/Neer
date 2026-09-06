import { useState } from "react";
import {
    getIntercomUser,
    updateIntercomAccess,
} from "../services/intercomService";

const IntercomAccess = () => {
    const [email, setEmail] = useState("");
    const [user, setUser] = useState(null);

    const [intercomEnabled, setEnabled] = useState(false);
    const [intercomAccess, setAccess] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        setUser(null);
        setMessage("");
        setError("");

        setEnabled(false);
        setAccess(false);

        try {
            const data = await getIntercomUser(email);

            setUser(data.user);

            setEnabled(Boolean(data.user.intercomEnabled));
            setAccess(Boolean(data.user.intercomAccess));

        } catch (error) {
            setError(error.message);
        }
    };

    const handleUpdate = async () => {
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await updateIntercomAccess({
                email: user.email,

                intercomEnabled:
                    user.role === "resident" || user.role === "committee"
                        ? intercomEnabled
                        : false,

                intercomAccess:
                    user.role === "staff" || user.role === "committee"
                        ? intercomAccess
                        : false,
            });

            setUser(data.user);

            setEnabled(data.user.intercomEnabled);
            setAccess(data.user.intercomAccess);

            setMessage(data.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page nx intercom-page intercom-access-page">
            <div className="dashboard-header intercom-header">
                <div>
                    <p className="dash-section-kicker">Building communications</p>
                    <h1>Intercom access</h1>
                    <p>Control who can use the resident and staff intercom channels.</p>
                </div>
            </div>

            <section className="panel-card intercom-panel">
                <div className="intercom-panel-heading">
                    <div>
                        <h2>Find a user</h2>
                        <p>Search by email to review and update their calling permissions.</p>
                    </div>
                    <span className="intercom-panel-icon" aria-hidden="true">⌁</span>
                </div>

                <form className="intercom-search-form" onSubmit={handleSearch}>
                    <label htmlFor="intercom-user-email">User email</label>
                    <div className="intercom-search-row">
                        <input
                            id="intercom-user-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Searching..." : "Find user"}
                        </button>
                    </div>
                </form>

                {error && <p className="form-message error-message">{error}</p>}
                {message && <p className="form-message success-message">{message}</p>}

                {user && (
                    <div className="intercom-user-panel">
                        <div className="intercom-user-heading">
                            <span className="intercom-user-avatar" aria-hidden="true">
                                {user.username.charAt(0).toUpperCase()}
                            </span>
                            <div>
                                <h2>{user.username}</h2>
                                <p>{user.email}</p>
                            </div>
                            <span className="status-badge intercom-role-badge">{user.role}</span>
                        </div>

                        <div className="intercom-permission-grid">
                            {user.role !== "staff" && (
                                <label className="intercom-toggle">
                                    <input
                                        type="checkbox"
                                        checked={intercomEnabled}
                                        onChange={(e) => setEnabled(e.target.checked)}
                                    />
                                    <span>
                                        <strong>Resident calling</strong>
                                        <small>Allow this user to receive intercom calls.</small>
                                    </span>
                                </label>
                            )}

                            {user.role !== "resident" && (
                                <label className="intercom-toggle">
                                    <input
                                        type="checkbox"
                                        checked={intercomAccess}
                                        onChange={(e) => setAccess(e.target.checked)}
                                    />
                                    <span>
                                        <strong>Calling access</strong>
                                        <small>Allow this user to initiate intercom calls.</small>
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="intercom-user-actions">
                            <button type="button" onClick={handleUpdate} disabled={loading}>
                                {loading ? "Saving changes..." : "Save permissions"}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default IntercomAccess;