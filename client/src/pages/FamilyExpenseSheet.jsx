import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ExpenseSummary from "../components/ExpenseSummary";
import FamilyMemberList from "../components/FamilyMemberList";

import {
    EXPENSE_CATEGORIES,
    categoryClass,
    formatAmount,
    formatDayLabel,
    formatMonthLabel,
    getCurrentMonth,
    getToday,
    shiftMonth
} from "../config/familyExpense";

import {
    getFamilySheet,
    updateFamilySheet,
    deleteFamilySheet,
    getAvailableMembers,
    addFamilyMember,
    removeFamilyMember,
    getFamilyExpenses,
    createFamilyExpense,
    updateFamilyExpense,
    deleteFamilyExpense
} from "../services/familyExpenseService";

const emptySummary = {
    monthTotal: 0,
    monthCount: 0,
    allTimeTotal: 0,
    allTimeCount: 0,
    categoryTotals: {}
};

const emptyExpenseForm = {
    title: "",
    amount: "",
    category: "Food",
    date: getToday(),
    note: ""
};

function FamilyExpenseSheet({ token }) {
    const { sheetId } = useParams();
    const navigate = useNavigate();

    const currentUserId = localStorage.getItem("userId");

    const [sheet, setSheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [month, setMonth] = useState(getCurrentMonth());
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(emptySummary);
    const [loadingExpenses, setLoadingExpenses] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyExpenseForm);
    const [saving, setSaving] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [busy, setBusy] = useState(false);

    const [showSettings, setShowSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        name: "",
        description: ""
    });
    const [confirmSheetDelete, setConfirmSheetDelete] = useState(false);

    useEffect(() => {
        if (!token) return;

        const loadSheet = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getFamilySheet(sheetId, token);

                setSheet(data);
                setSettingsForm({
                    name: data.name,
                    description: data.description || ""
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSheet();
    }, [token, sheetId]);

    const loadExpenses = useCallback(async () => {
        try {
            setLoadingExpenses(true);

            const data = await getFamilyExpenses(sheetId, month, token);

            setExpenses(data.expenses);
            setSummary(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingExpenses(false);
        }
    }, [sheetId, month, token]);

    useEffect(() => {
        if (!token || !sheet) return;

        (async () => {
            await loadExpenses();
        })();
    }, [token, sheet, loadExpenses]);

    const openAddForm = () => {
        setEditingId(null);
        // new expenses default to the month being looked at, not always today
        setForm({
            ...emptyExpenseForm,
            date:
                month === getCurrentMonth() ? getToday() : `${month}-01`
        });
        setShowForm(true);
        setError("");
    };

    const openEditForm = (expense) => {
        setEditingId(expense._id);
        setForm({
            title: expense.title,
            amount: String(expense.amount),
            category: expense.category,
            date: expense.date,
            note: expense.note || ""
        });
        setShowForm(true);
        setError("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyExpenseForm);
    };

    const submitExpense = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await updateFamilyExpense(editingId, form, token);
            } else {
                await createFamilyExpense(sheetId, form, token);
            }

            closeForm();

            // an expense can be saved into a different month than the one on
            // screen, so follow it there instead of leaving the list looking empty
            const savedMonth = form.date.slice(0, 7);

            if (savedMonth === month) {
                await loadExpenses();
            } else {
                setMonth(savedMonth);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeExpense = async (expenseId) => {
        try {
            setBusy(true);
            setError("");

            await deleteFamilyExpense(expenseId, token);

            setDeleteId(null);
            await loadExpenses();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const searchMembers = async (search) => {
        try {
            setError("");

            return await getAvailableMembers(sheetId, search, token);
        } catch (err) {
            setError(err.message);

            return [];
        }
    };

    const addMember = async (userId) => {
        try {
            setBusy(true);
            setError("");

            const updated = await addFamilyMember(sheetId, userId, token);

            setSheet(updated);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const removeMember = async (userId) => {
        try {
            setBusy(true);
            setError("");

            const updated = await removeFamilyMember(sheetId, userId, token);

            setSheet(updated);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const saveSettings = async (event) => {
        event.preventDefault();

        try {
            setBusy(true);
            setError("");

            const updated = await updateFamilySheet(sheetId, settingsForm, token);

            setSheet(updated);
            setShowSettings(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const removeSheet = async () => {
        try {
            setBusy(true);
            setError("");

            await deleteFamilySheet(sheetId, token);

            navigate("/family-expenses");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    // the person who added an expense can change it, and so can the sheet owner
    const canChange = (expense) =>
        sheet.isOwner ||
        (expense.addedBy && expense.addedBy._id === currentUserId);

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading the family expense sheet...</p>
            </div>
        );
    }

    if (!sheet) {
        return (
            <div className="dashboard-page">
                <div className="library-header">
                    <h2>Family Expenses</h2>

                    <Link to="/family-expenses" className="create-book-link">
                        Back to Family Expenses
                    </Link>
                </div>

                <p className="form-message">
                    {error || "This family expense sheet is not available."}
                </p>
            </div>
        );
    }

    const deleting = expenses.find((expense) => expense._id === deleteId);

    return (
        <div className="dashboard-page family-page">
            <div className="library-header">
                <div>
                    <h2>{sheet.name}</h2>

                    {sheet.description && <p>{sheet.description}</p>}
                </div>

                <div className="bill-actions">
                    {sheet.isOwner && (
                        <button
                            type="button"
                            className="secondary"
                            onClick={() => setShowSettings((open) => !open)}
                        >
                            Sheet Settings
                        </button>
                    )}

                    <Link to="/family-expenses" className="create-book-link">
                        Back
                    </Link>
                </div>
            </div>

            {error && <p className="form-message">{error}</p>}

            {showSettings && sheet.isOwner && (
                <div className="panel-card">
                    <h3>Sheet Settings</h3>

                    <form onSubmit={saveSettings} className="booking-form">
                        <input
                            type="text"
                            placeholder="Family name"
                            maxLength={60}
                            value={settingsForm.name}
                            onChange={(event) =>
                                setSettingsForm({
                                    ...settingsForm,
                                    name: event.target.value
                                })
                            }
                            required
                        />

                        <textarea
                            placeholder="Description (optional)"
                            maxLength={300}
                            rows={3}
                            value={settingsForm.description}
                            onChange={(event) =>
                                setSettingsForm({
                                    ...settingsForm,
                                    description: event.target.value
                                })
                            }
                        />

                        <div className="bill-actions">
                            <button type="submit" disabled={busy}>
                                {busy ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setShowSettings(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setConfirmSheetDelete(true)}
                            >
                                Delete Sheet
                            </button>
                        </div>
                    </form>

                    {confirmSheetDelete && (
                        <div className="confirm-box">
                            <p>
                                Are you sure you want to delete this sheet? Every
                                expense on it will be deleted too.
                            </p>

                            <button
                                type="button"
                                onClick={removeSheet}
                                disabled={busy}
                            >
                                Yes, Delete
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setConfirmSheetDelete(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="month-nav">
                <button
                    type="button"
                    onClick={() => setMonth((current) => shiftMonth(current, -1))}
                >
                    &lt; {formatMonthLabel(shiftMonth(month, -1))}
                </button>

                <strong>{formatMonthLabel(month)}</strong>

                <button
                    type="button"
                    onClick={() => setMonth((current) => shiftMonth(current, 1))}
                >
                    {formatMonthLabel(shiftMonth(month, 1))} &gt;
                </button>
            </div>

            <ExpenseSummary summary={summary} month={month} />

            <div className="family-workspace">
                <div className="panel-card">
                    <div className="library-header">
                        <h3>Expenses</h3>

                        {!showForm && (
                            <button type="button" onClick={openAddForm}>
                                Add Expense
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <form onSubmit={submitExpense} className="booking-form">
                            <input
                                type="text"
                                placeholder="Expense name"
                                maxLength={60}
                                value={form.title}
                                onChange={(event) =>
                                    setForm({ ...form, title: event.target.value })
                                }
                                required
                            />

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Amount"
                                value={form.amount}
                                onChange={(event) =>
                                    setForm({ ...form, amount: event.target.value })
                                }
                                required
                            />

                            <select
                                value={form.category}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        category: event.target.value
                                    })
                                }
                            >
                                {EXPENSE_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={form.date}
                                onChange={(event) =>
                                    setForm({ ...form, date: event.target.value })
                                }
                                required
                            />

                            <input
                                type="text"
                                placeholder="Note (optional)"
                                maxLength={300}
                                value={form.note}
                                onChange={(event) =>
                                    setForm({ ...form, note: event.target.value })
                                }
                            />

                            <div className="bill-actions">
                                <button type="submit" disabled={saving}>
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Save Changes"
                                        : "Add Expense"}
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
                    )}

                    {deleting && (
                        <div className="confirm-box">
                            <p>
                                Are you sure you want to delete this expense?
                                <br />
                                {deleting.title} &middot; &#2547;
                                {formatAmount(deleting.amount)}
                            </p>

                            <button
                                type="button"
                                onClick={() => removeExpense(deleting._id)}
                                disabled={busy}
                            >
                                Yes, Delete
                            </button>

                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {loadingExpenses ? (
                        <p>Loading expenses...</p>
                    ) : expenses.length === 0 ? (
                        <p>
                            No expenses were recorded in{" "}
                            {formatMonthLabel(month)} yet.
                        </p>
                    ) : (
                        <div className="expense-table-container">
                            <table className="expense-table">
                                <thead>
                                    <tr>
                                        <th>Expense</th>
                                        <th className="align-right">Amount</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Added By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense._id}>
                                            <td>
                                                {expense.title}

                                                {expense.note && (
                                                    <span className="expense-note">
                                                        {expense.note}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="align-right no-wrap">
                                                &#2547;
                                                {formatAmount(expense.amount)}
                                            </td>

                                            <td className="no-wrap">
                                                <span
                                                    className={`status-badge cat-${categoryClass(
                                                        expense.category
                                                    )}`}
                                                >
                                                    {expense.category}
                                                </span>
                                            </td>

                                            <td className="no-wrap">
                                                {formatDayLabel(expense.date)}
                                            </td>

                                            <td>
                                                {expense.addedBy
                                                    ? expense.addedBy.username
                                                    : "Removed member"}
                                            </td>

                                            <td className="no-wrap">
                                                {canChange(expense) ? (
                                                    <span className="bill-actions">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    expense
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="secondary"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    expense._id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <span className="expense-note">
                                                        View only
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <FamilyMemberList
                    sheet={sheet}
                    isOwner={sheet.isOwner}
                    currentUserId={currentUserId}
                    searchMembers={searchMembers}
                    onAdd={addMember}
                    onRemove={removeMember}
                    busy={busy}
                />
            </div>
        </div>
    );
}

export default FamilyExpenseSheet;
