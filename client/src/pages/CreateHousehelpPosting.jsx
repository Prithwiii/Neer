import React from "react";
import { useNavigate } from "react-router-dom";

import {
  createHousehelpPosting,
} from "../services/househelpService";

function CreateHousehelpPosting() {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    residentName: "",
    flatNumber: "",
    preferredHours: "",
    mobileNumber: "",
  });

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Create Househelp Posting
        </h1>

        <p className="text-gray-600 mt-1">
          Let other residents know that you are looking
          for a househelp.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg shadow-sm p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Resident Name
          </label>

          <input
            type="text"
            name="residentName"
            value={formData.residentName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Flat Number
          </label>

          <input
            type="text"
            name="flatNumber"
            value={formData.flatNumber}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 5A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Preferred Hours
          </label>

          <input
            type="text"
            name="preferredHours"
            value={formData.preferredHours}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 8 AM - 12 PM"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>

          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Enter mobile number"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/househelp")}
            className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Create Posting"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateHousehelpPosting;