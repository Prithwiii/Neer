import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const BILL_API = "http://localhost:5000/api/bills";

const CATEGORIES = [
  "Electricity",
  "Gas",
  "Water",
  "Internet",
  "Maintenance Fee",
  "Security Fee",
  "Other",
];

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const formatMonthLabel = (month) => {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const shiftMonth = (month, offset) => {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const emptyForm = {
  name: "",
  amount: "",
  category: "Electricity",
  dueDate: "",
  note: "",
  recurring: false,
};

function BillPayments({ token, onLogout, role }) {
  const [month, setMonth] = useState(getCurrentMonth());
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteId, setDeleteId] = useState(null);

  const loadBills = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${BILL_API}?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      setBills(data);
    } else {
      setMessage(data.message || "Could not load bills");
    }
    setLoading(false);
  }, [token, month]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      await loadBills();
    })();
  }, [token, loadBills]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (bill) => {
    setEditingId(bill._id);
    setForm({
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      dueDate: bill.dueDate,
      note: bill.note || "",
      recurring: bill.recurring,
    });
    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");

    const url = editingId ? `${BILL_API}/${editingId}` : BILL_API;
    const methodType = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not save bill");
      return;
    }

    closeForm();
    loadBills();
  };

  const togglePaid = async (bill) => {
    setMessage("");
    const action = bill.status === "paid" ? "unpay" : "pay";

    const response = await fetch(`${BILL_API}/${bill._id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not update bill");
      return;
    }

    loadBills();
  };

  const deleteBill = async (id) => {
    setMessage("");

    const response = await fetch(`${BILL_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not delete bill");
      return;
    }

    setDeleteId(null);
    loadBills();
  };

  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.status === "paid").length;
  const pendingBills = bills.filter((b) => b.status === "pending").length;
  const overdueBills = bills.filter((b) => b.status === "overdue").length;
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amount, 0);
  const progressPercent =
    totalBills === 0 ? 0 : Math.round((paidBills / totalBills) * 100);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Bill Payments</h1>
          <p>Role: {role}</p>
        </div>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/bills">Bill Payments</Link>
        <Link to="/books">Library</Link>
      </nav>

      <div className="month-nav">
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
          &lt; Previous
        </button>
        <strong>{formatMonthLabel(month)}</strong>
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
          Next &gt;
        </button>
      </div>

      <div className="bills-summary panel-card">
        <h2>Summary</h2>
        <div className="bills-summary-grid">
          <div>Total Bills: {totalBills}</div>
          <div>Paid: {paidBills}</div>
          <div>Pending: {pendingBills}</div>
          <div>Overdue: {overdueBills}</div>
          <div>Total Amount: &#2547;{totalAmount}</div>
          <div>Paid Amount: &#2547;{paidAmount}</div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p>{progressPercent}% completed</p>
      </div>

      <div className="panel-card">
        <div className="library-header">
          <h2>Monthly Checklist</h2>
          <button className="primary" type="button" onClick={openAddForm}>
            Add Bill
          </button>
        </div>

        {loading ? (
          <p>Loading bills...</p>
        ) : bills.length === 0 ? (
          <p>No bills for this month yet.</p>
        ) : (
          bills.map((bill) => (
            <div
              key={bill._id}
              className={`bill-card ${bill.status === "paid" ? "paid" : ""}`}
            >
              <div className="bill-card-row">
                <div className="bill-info">
                  <input
                    type="checkbox"
                    checked={bill.status === "paid"}
                    onChange={() => togglePaid(bill)}
                  />
                  <div>
                    <p
                      className={`bill-name ${
                        bill.status === "paid" ? "paid-text" : ""
                      }`}
                    >
                      {bill.name}
                    </p>
                    <p>
                      &#2547;{bill.amount} | Due {bill.dueDate} | {bill.category}
                    </p>
                    {bill.note && <p>Note: {bill.note}</p>}
                    {bill.status === "paid" && bill.paidDate && (
                      <p>Paid on {bill.paidDate}</p>
                    )}
                  </div>
                </div>

                <div className="bill-actions">
                  <span className={`status-badge ${bill.status}`}>
                    {bill.status === "paid"
                      ? "Paid"
                      : bill.status === "overdue"
                      ? "Overdue"
                      : "Pending"}
                  </span>
                  <button type="button" onClick={() => openEditForm(bill)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setDeleteId(bill._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {deleteId === bill._id && (
                <div className="confirm-box">
                  <p>Are you sure you want to delete this bill?</p>
                  <button type="button" onClick={() => deleteBill(bill._id)}>
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
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="panel-card">
          <h2>{editingId ? "Edit Bill" : "Add Bill"}</h2>
          <form onSubmit={submitForm} className="booking-form">
            <input
              type="text"
              placeholder="Bill name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <label>
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(e) =>
                  setForm({ ...form, recurring: e.target.checked })
                }
              />{" "}
              Repeat this bill every month
            </label>

            <div className="bill-actions">
              <button className="primary" type="submit">
                {editingId ? "Save Changes" : "Add Bill"}
              </button>
              <button className="secondary" type="button" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default BillPayments;
