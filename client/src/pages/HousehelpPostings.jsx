import React from "react";
import { useNavigate } from "react-router-dom";

import {
  getHousehelpPostings,
  closeHousehelpPosting,
} from "../services/househelpService";

function HousehelpPostings() {
  const navigate = useNavigate();

  const [postings, setPostings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const loadPostings = async () => {
    try {
      setLoading(true);

      const data = await getHousehelpPostings();
      setPostings(data);

      setError("");
    } catch (err) {
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
      "Are you sure you want to close this posting?"
    );

    if (!confirmed) return;

    try {
      await closeHousehelpPosting(id);
      await loadPostings();
    } catch (err) {
      setError(err.message);
    }
  };

  const canClose = (posting) => {
    const isOwner =
      posting.postedBy?._id?.toString() === userId?.toString();

    const isStaff = role === "staff";

    return isOwner || isStaff;
  };

  if (loading) {
    return <div className="p-6">Loading postings...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Househelp Postings
          </h1>

          <p className="text-gray-600 mt-1">
            Residents looking for househelp
          </p>
        </div>

        {role === "resident" && (
          <button
            onClick={() => navigate("/househelp/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Posting
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {postings.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No househelp postings available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {postings.map((posting) => (
            <div
              key={posting._id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              {/* Tab/header */}
              <div className="bg-gray-100 border-b px-5 py-3">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">
                    Flat {posting.flatNumber}
                  </h2>

                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      posting.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {posting.status === "open"
                      ? "Looking"
                      : "Closed"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Resident
                    </p>
                    <p className="font-medium">
                      {posting.residentName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Preferred Hours
                    </p>
                    <p className="font-medium">
                      {posting.preferredHours}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Mobile Number
                    </p>
                    <p className="font-medium">
                      {posting.mobileNumber}
                    </p>
                  </div>
                </div>

                {posting.status === "open" &&
                  canClose(posting) && (
                    <button
                      onClick={() =>
                        handleClose(posting._id)
                      }
                      className="mt-5 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                      Mark as Closed
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HousehelpPostings;