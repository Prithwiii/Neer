import React from "react";
import { useNavigate } from "react-router-dom";

import HousehelpCard from "../components/HousehelpCard";

import {
    getHousehelpPostings,
    closeHousehelpPosting
} from "../services/househelpService";

const HousehelpPostings = () => {

    const navigate = useNavigate();

    const [postings, setPostings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

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

    React.useEffect(() => {
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
            <div className="library-page">
                <p>Loading househelp postings...</p>
            </div>
        );
    }

    return (
        <div className="library-page">

            <div className="library-header">

                <div>
                    <h1>Househelp</h1>

                    <p>
                        Residents looking for househelp
                    </p>
                </div>

                {role === "resident" && (
                    <button
                        onClick={() =>
                            navigate("/househelp/create")
                        }
                    >
                        Create Posting
                    </button>
                )}

            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {postings.length === 0 ? (

                <div className="empty-message">
                    <p>
                        There are currently no househelp postings.
                    </p>
                </div>

            ) : (
                <div>
                    <div className="book-grid">

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