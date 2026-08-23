import { Link } from "react-router-dom";

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" onClick={onClose}>
            Dashboard
          </Link>

          <Link to="/proposals" onClick={onClose}>
            Proposals
          </Link>

          <Link to="/bookings" onClick={onClose}>
            Bookings
          </Link>

          <Link to="/books" onClick={onClose}>
            Library
          </Link>

          <Link to="/noticeboard" onClick={onClose}>
            Noticeboard
          </Link>

          <Link to="/chat" onClick={onClose}>
            Chat
          </Link>

          <Link to="/alerts" onClick={onClose}>
            Alerts
          </Link>

          {/* add new features here later */}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;