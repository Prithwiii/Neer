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
        <article className="househelp-card">

            <div className="househelp-card-heading">
                <div>
                    <p className="househelp-card-kicker">Househelp request</p>
                    <h3>Flat {posting.flatNumber}</h3>
                </div>
                <span className={`status-badge ${posting.status === "open" ? "househelp-open" : "completed"}`}>
                    {posting.status === "open" ? "Open" : "Closed"}
                </span>
            </div>

            <p>
                <span className="househelp-detail-label">Resident</span>
                {posting.residentName}
            </p>

            <p>
                <span className="househelp-detail-label">Preferred hours</span>
                {posting.hours}
            </p>

            <p>
                <span className="househelp-detail-label">Mobile</span>
                {posting.mobileNumber}
            </p>

            <div className="househelp-card-actions">

                {canClose && (
                    <button
                        className="secondary"
                        onClick={() => onClose(posting._id)}
                    >
                        Mark as closed
                    </button>
                )}

            </div>

        </article>
    );
};

export default HousehelpCard;