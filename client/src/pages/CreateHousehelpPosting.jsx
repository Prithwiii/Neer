import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createHousehelpPosting,
} from "../services/househelpService";

function CreateHousehelpPosting() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    residentName: "",
    flatNumber: "",
    hours: "",
    mobileNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createHousehelpPosting(formData);

      navigate("/househelp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page nx househelp-page create-househelp-page">
      <div className="dashboard-header library-header">
        <div>
          <p className="dash-section-kicker">Neighbourhood services</p>
          <h1>Share a househelp request</h1>
          <p>Let other residents know when you are looking for househelp.</p>
        </div>
      </div>

      {error && (
        <div className="form-message error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel-card househelp-form">
        <div className="househelp-form-heading">
          <h2>Posting details</h2>
          <p>Include clear contact information and the hours you need help.</p>
        </div>

        <div className="househelp-form-field">
          <label htmlFor="househelp-resident-name">Resident name</label>

          <input
            id="househelp-resident-name"
            type="text"
            name="residentName"
            value={formData.residentName}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="househelp-form-field">
          <label htmlFor="househelp-flat-number">Flat number</label>

          <input
            id="househelp-flat-number"
            type="text"
            name="flatNumber"
            value={formData.flatNumber}
            onChange={handleChange}
            required
            placeholder="e.g. 5-A"
          />
        </div>

        <div className="househelp-form-field">
          <label htmlFor="househelp-hours">Preferred hours</label>

          <input
            id="househelp-hours"
            type="text"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            required
            placeholder="e.g. 8 AM - 12 PM"
          />
        </div>

        <div className="househelp-form-field">
          <label htmlFor="househelp-mobile">Mobile number</label>

          <input
            id="househelp-mobile"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            placeholder="Enter mobile number"
          />
        </div>

        <div className="househelp-form-actions">
          <button
            type="button"
            onClick={() => navigate("/househelp")}
            className="secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Posting..." : "Create posting"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateHousehelpPosting;