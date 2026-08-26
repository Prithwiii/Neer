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
                    user.role === "staff" || user.type === "committee"
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
        <div>
            <h1>Intercom Access Management</h1>

            <form onSubmit={handleSearch}>
                <input
                    type="email"
                    placeholder="Enter user email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit">
                    Find User
                </button>
            </form>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            {user && (
                <div>
                    <h2>{user.username}</h2>

                    <p>Email: {user.email}</p>
                    <p>Type: {user.role}</p>

                    {user.role !== "staff" && (
                        <label>
                            <input
                                type="checkbox"
                                checked={intercomEnabled}
                                onChange={(e) =>
                                    setEnabled(e.target.checked)
                                }
                            />

                            Intercom Enabled
                        </label>
                    )}

                    {user.role !== "resident" && (
                        <label>
                            <input
                                type="checkbox"
                                checked={intercomAccess}
                                onChange={(e) =>
                                    setAccess(e.target.checked)
                                }
                            />

                            Intercom Access
                        </label>
                    )}

                    <br />

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default IntercomAccess;