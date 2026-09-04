import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import API_URL from "../config/api";

const categoryLabels = {
  emergency: "Emergency Contacts",
  staff: "Staff Contacts",
  committee: "Committee Members",
};

const fallbackContacts = {
  emergency: [
    { _id: "emergency-fire", name: "Fire Service", phone: "01700000000", designation: "Fire Response Unit", category: "emergency" },
    { _id: "emergency-ambulance", name: "Ambulance Service", phone: "01711111111", designation: "Medical Emergency", category: "emergency" },
    { _id: "emergency-police", name: "Police Station", phone: "01722222222", designation: "Emergency Security", category: "emergency" },
    { _id: "emergency-hospital", name: "City General Hospital", phone: "01733333333", designation: "Urgent Care", category: "emergency" },
    { _id: "emergency-security", name: "Building Security Desk", phone: "01844444444", designation: "Entry Control", category: "emergency" },
  ],
  staff: [
    { _id: "staff-rakib", name: "Rakib", phone: "01757348678", designation: "Guard", category: "staff" },
    { _id: "staff-shahriar", name: "Shahriar", phone: "01734567890", designation: "Electrician", category: "staff" },
    { _id: "staff-nabil", name: "Nabil", phone: "01811223344", designation: "Plumber", category: "staff" },
    { _id: "staff-ayesha", name: "Ayesha", phone: "01699887766", designation: "Housekeeping Supervisor", category: "staff" },
    { _id: "staff-imran", name: "Imran", phone: "01855667788", designation: "Maintenance Engineer", category: "staff" },
  ],
  committee: [
    { _id: "committee-farah", name: "Farah Ahmed", phone: "01766445588", designation: "Chairperson", category: "committee" },
    { _id: "committee-karim", name: "Karim Hossain", phone: "01799887766", designation: "Finance Member", category: "committee" },
    { _id: "committee-sabrina", name: "Sabrina Islam", phone: "01822334455", designation: "Security Coordinator", category: "committee" },
    { _id: "committee-mahmud", name: "Mahmud Hasan", phone: "01677889900", designation: "Maintenance Committee", category: "committee" },
    { _id: "committee-tanvir", name: "Tanvir Rahman", phone: "01855669922", designation: "Resident Welfare Secretary", category: "committee" },
  ],
};

function ContactDirectory({ token }) {
  const { type } = useParams();
  const fallbackList = useMemo(
    () => (type ? fallbackContacts[type] || [] : Object.values(fallbackContacts).flat()),
    [type]
  );
  const [liveContacts, setLiveContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const loadContacts = async () => {
      setLoading(true);
      setError("");

      try {
        const url = type
          ? `${API_URL}/api/contacts/${type}`
          : `${API_URL}/api/contacts`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load contacts");
        }

        const data = await response.json();
        const nextContacts = Array.isArray(data) && data.length > 0 ? data : fallbackList;

        if (isMounted) {
          setLiveContacts(nextContacts);
        }
      } catch {
        if (isMounted) {
          setLiveContacts(fallbackList);
          setError("");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContacts();

    return () => {
      isMounted = false;
    };
  }, [fallbackList, token, type]);

  const contacts = token ? (liveContacts.length > 0 ? liveContacts : fallbackList) : fallbackList;

  const selectedType = type || "";

  if (!selectedType) {
    return (
      <div className="dashboard-page">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">Directory</p>
            <h1>Contact Directory</h1>
          </div>
          <Link to="/dashboard" className="secondary-link">
            ← Dashboard
          </Link>
        </div>

        <div className="contact-directory-grid">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link key={key} to={`/contacts/${key}`} className="contact-option-card">
              <span className="contact-option-icon">☎</span>
              <h2>{label}</h2>
              <p>View the available contacts for {label.toLowerCase()}.</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header-row contact-header-row">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>{categoryLabels[selectedType] || "Contact List"}</h1>
        </div>
        <div className="header-actions">
          <Link to="/dashboard" className="secondary-link">
            ← Dashboard
          </Link>
          <Link to="/contacts" className="secondary-link">
            Back to directory
          </Link>
        </div>
      </div>

      {loading && <p>Loading contacts...</p>}
      {error && <p className="form-message error-message">{error}</p>}

      {!loading && !error && contacts.length === 0 && (
        <p className="form-message">No contacts available for this category yet.</p>
      )}

      <div className="contact-list">
        {contacts.map((contact) => (
          <div key={contact._id} className="contact-card">
            <div className="contact-meta-row">
              <span className="contact-badge">{categoryLabels[contact.category] || "Contact"}</span>
            </div>
            <h3>{contact.name}</h3>
            <p>
              <strong>Phone:</strong> {contact.phone}
            </p>
            <p>
              <strong>Designation:</strong> {contact.designation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactDirectory;
