import { Link } from "react-router-dom";

import { categoryClass, formatDate } from "../config/lostFound";

// One item on the board. It links through to the full post, where the picture
// and the management buttons live.
function LostFoundCard({ post }) {
    return (
        <Link to={`/lost-found/${post._id}`} className="lost-found-card">
            <div className="lost-found-card-top">
                <h3>
                    <span className={`type-tag type-${post.type.toLowerCase()}`}>
                        {post.type}
                    </span>{" "}
                    {post.itemName}
                </h3>

                <span
                    className={`status-badge ${
                        post.status === "Returned" ? "paid" : "pending"
                    }`}
                >
                    {post.status}
                </span>
            </div>

            <p>
                <strong>Location:</strong> {post.location}
            </p>

            <p>
                <strong>Date:</strong> {formatDate(post.date)}
            </p>

            <p className="lost-found-description">{post.description}</p>

            <p className="lost-found-card-meta">
                <span className={`status-badge cat-${categoryClass(post.category)}`}>
                    {post.category}
                </span>{" "}
                Posted by{" "}
                {post.postedBy
                    ? `${post.postedBy.username}${
                          post.postedBy.flatNumber
                              ? ` (${post.postedBy.flatNumber})`
                              : ""
                      }`
                    : "a former resident"}
            </p>
        </Link>
    );
}

export default LostFoundCard;
