import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { formatAmount } from "../config/familyExpense";
import {
    getFamilySheets,
    createFamilySheet
} from "../services/familyExpenseService";

const emptyForm = {
    name: "",
    description: ""
};

function FamilyExpenses({ token }) {
    const [sheets, setSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!token) return;

        const loadSheets = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getFamilySheets(token);

                setSheets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSheets();
    }, [token]);

    const openForm = () => {
        setForm(emptyForm);
        setShowForm(true);
        setError("");
    };

    const closeForm = () => {
        setShowForm(false);
        setForm(emptyForm);
    };

    const submitForm = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const sheet = await createFamilySheet(form, token);

            setSheets((current) => [sheet, ...current]);
            closeForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading your family expense sheets...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="library-header">
                <h2>Family Expenses</h2>

                {!showForm && (
                    <button type="button" onClick={openForm}>
                        Create Family Expense Sheet
                    </button>
                )}
            </div>

            <p>
                A family expense sheet is private. Only you and the members you
                give access to can see or change it.
            </p>

            {error && <p className="form-message">{error}</p>}

            {showForm && (
                <div className="panel-card">
                    <h3>Create Family Expense Sheet</h3>

                    <form onSubmit={submitForm} className="booking-form">
                        <input
                            type="text"
                            placeholder="Family name, e.g. Rahman Family"
                            maxLength={60}
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                            required
                        />

                        <textarea
                            placeholder="Description (optional), e.g. Monthly household expenses"
                            maxLength={300}
                            rows={3}
                            value={form.description}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    description: event.target.value
                                })
                            }
                        />

                        <div className="bill-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? "Creating..." : "Create Sheet"}
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

            {sheets.length === 0 ? (
                <div className="panel-card">
                    <p>
                        You do not have a family expense sheet yet. Create one to
                        start tracking what your family spends.
                    </p>
                </div>
            ) : (
                <div className="sheet-grid">
                    {sheets.map((sheet) => (
                        <Link
                            key={sheet._id}
                            to={`/family-expenses/${sheet._id}`}
                            className="sheet-card"
                        >
                            <div className="sheet-card-top">
                                <h3>{sheet.name}</h3>

                                <span className="status-badge">
                                    {sheet.isOwner ? "Owner" : "Member"}
                                </span>
                            </div>

                            {sheet.description && <p>{sheet.description}</p>}

                            <p className="sheet-card-meta">
                                {sheet.members.length + 1} member
                                {sheet.members.length === 0 ? "" : "s"}
                                {" · "}
                                {sheet.expenseCount} expense
                                {sheet.expenseCount === 1 ? "" : "s"}
                                {" · "}
                                &#2547;{formatAmount(sheet.totalAmount)} in total
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FamilyExpenses;
