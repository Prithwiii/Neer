import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HousehelpCard from "../components/HousehelpCard";

import {
    getHousehelpPostings,
    closeHousehelpPosting
} from "../services/househelpService";

const HousehelpPostings = () => {

    const navigate = useNavigate();

    const [postings, setPostings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const role = localStorage.getItem("role");
    const isAuthenticated = !!localStorage.getItem("token");

    const loadPostings = async () => {
        try {
            setLoading(true);

            const data = await getHousehelpPostings();

            setPostings(data);
            setError("");

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // The loader also owns refresh state after closing a posting.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPostings();
    }, []);

    const handleClose = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to mark this posting as closed?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await closeHousehelpPosting(id);

            await loadPostings();

        } catch (err) {

            console.error(err);
            setError(err.message);

        }
    };

    if (loading) {
        return (
            <div className="dashboard-page nx househelp-page">
                <div className="dash-loading" role="status">
                    <span className="dash-loading-mark" aria-hidden="true" />
                    <span>Loading househelp postings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page nx househelp-page">

            <div className="dashboard-header library-header">

                <div>
                    <p className="dash-section-kicker">Neighbourhood services</p>
                    <h1>Househelp</h1>
                    <p>Find and share trusted househelp opportunities within the building.</p>
                </div>

                {role === "resident" && (
                    <button
                        onClick={() =>
                            navigate("/househelp/create")
                        }
                    >
                        Create posting
                    </button>
                )}

            </div>

            {error && (
                <div className="form-message error-message">
                    {error}
                </div>
            )}

            {postings.length === 0 ? (

                <div className="feature-empty-state">
                    <span className="feature-empty-icon" aria-hidden="true">⌂</span>
                    <strong>No househelp postings yet</strong>
                    <span>Share an opportunity when you are looking for help at home.</span>
                </div>

            ) : (
                <div>
                    <div className="househelp-grid">

                        {postings.map((posting) => (

                            <HousehelpCard
                                key={posting._id}
                                posting={posting}
                                isAuthenticated={isAuthenticated}
                                onClose={handleClose}
                            />

                        ))}

                    </div>
                </div>

            )}

        </div>
    );
};

export default HousehelpPostings;