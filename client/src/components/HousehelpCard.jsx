import React from "react";

const HousehelpCard = ({
    posting,
    isAuthenticated,
    onClose
}) => {

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const isOwner =
        userId &&
        posting.postedBy?._id === userId;

    const isStaff =
        role === "staff";

    const canClose =
        isAuthenticated &&
        posting.status === "open" &&
        (isOwner || isStaff);

    return (
        <div className="book-card">

            <h3>Flat {posting.flatNumber}</h3>

            <p>
                <strong>Resident:</strong>{" "}
                {posting.residentName}
            </p>

            <p>
                <strong>Preferred Hours:</strong>{" "}
                {posting.hours}
            </p>

            <p>
                <strong>Mobile:</strong>{" "}
                {posting.mobileNumber}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {posting.status === "open"
                    ? "Looking for Househelp"
                    : "Closed"}
            </p>

            <div className="book-actions">

                {canClose && (
                    <button
                        className="secondary"
                        onClick={() => onClose(posting._id)}
                    >
                        Mark as Closed
                    </button>
                )}

            </div>

        </div>
    );
};

export default HousehelpCard;