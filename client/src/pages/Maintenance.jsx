import { useEffect, useState } from "react";
import {
  getMaintenanceItems,
  createMaintenanceItem,
  updateMaintenanceItem,
  deleteMaintenanceItem,
} from "../services/maintenanceService";
import "./Maintenance.css";

const CATEGORIES = ["Appliance", "Car", "Electronics", "Other"];

const emptyForm = {
  itemName: "",
  category: "Appliance",
  lastServiced: "",
  intervalDays: 90,
  notes: "",
};

const statusStyles = {
  Overdue: "status-overdue",
  Due: "status-due",
  Upcoming: "status-upcoming",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceItems();
      setItems(data);
      setError("");
    } catch (err) {
      setError("Couldn't load maintenance items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.lastServiced) return;

    try {
      setSubmitting(true);
      await createMaintenanceItem({
        ...form,
        intervalDays: Number(form.intervalDays) || 90,
      });
      setForm(emptyForm);
      setShowForm(false);
      await loadItems();
    } catch (err) {
      setError("Couldn't save that item. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkServiced = async (item) => {
    try {
      await updateMaintenanceItem(item._id, {
        lastServiced: new Date().toISOString(),
      });
      await loadItems();
    } catch (err) {
      setError("Couldn't update that item.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from your maintenance list?")) return;
    try {
      await deleteMaintenanceItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError("Couldn't delete that item.");
    }
  };

  const overdueCount = items.filter((i) => i.status === "Overdue").length;
  const dueCount = items.filter((i) => i.status === "Due").length;

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <div>
          <h1>Maintenance Reminders</h1>
          <p className="maintenance-subtitle">
            Track routine upkeep for appliances, vehicles, and other equipment.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add item"}
        </button>
      </div>

      {(overdueCount > 0 || dueCount > 0) && (
        <div className="maintenance-summary">
          {overdueCount > 0 && (
            <span className="summary-pill summary-overdue">{overdueCount} overdue</span>
          )}
          {dueCount > 0 && <span className="summary-pill summary-due">{dueCount} due soon</span>}
        </div>
      )}

      {error && <div className="maintenance-error">{error}</div>}

      {showForm && (
        <form className="maintenance-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Item name
              <input
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="e.g. Air Conditioner, Car"
                required
              />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Last serviced
              <input
                type="date"
                name="lastServiced"
                value={form.lastServiced}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Reminder interval (days)
              <input
                type="number"
                name="intervalDays"
                min="1"
                value={form.intervalDays}
                onChange={handleChange}
              />
            </label>
          </div>
          <label className="form-notes">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional — model number, service provider, etc."
            />
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save item"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading maintenance items...</p>
      ) : items.length === 0 ? (
        <div className="maintenance-empty">
          No items yet. Add your first appliance or vehicle to start tracking maintenance.
        </div>
      ) : (
        <div className="maintenance-grid">
          {items.map((item) => (
            <div key={item._id} className={`maintenance-card ${statusStyles[item.status]}`}>
              <div className="card-top">
                <h3>{item.itemName}</h3>
                <span className={`status-badge ${statusStyles[item.status]}`}>{item.status}</span>
              </div>
              <p className="card-category">{item.category}</p>
              <p className="card-date">Next maintenance: {formatDate(item.nextMaintenance)}</p>
              {item.lastServiced && (
                <p className="card-date-secondary">
                  Last serviced: {formatDate(item.lastServiced)}
                </p>
              )}
              {item.notes && <p className="card-notes">{item.notes}</p>}
              <div className="card-actions">
                <button onClick={() => handleMarkServiced(item)}>Mark serviced today</button>
                <button className="btn-danger" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
