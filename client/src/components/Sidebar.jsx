import { Link } from "react-router-dom";

function Sidebar({ open, role, onClose }) {
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

          <Link to="/garages" onClick={onClose}>
            Garages
          </Link>

          <Link to="/bills" onClick={onClose}>
            Bill Payments
          </Link>

          <Link to="/books" onClick={onClose}>
            Library
          </Link>

          <Link to="/noticeboard" onClick={onClose}>
            Noticeboard
          </Link>

          <Link to="/building-layout" onClick={onClose}>
            Building Layout
          </Link>

          {role === "committee" && (
            <Link to="/building-layout/manage" onClick={onClose}>
              Manage Building Layout
            </Link>
          )}

          <Link to="/complaints" onClick={onClose}>
            Complaints
          </Link>

          <Link to="/contacts" onClick={onClose}>
            Contact Directory
          </Link>

          <Link to="/intercom-access" onClick={onClose}>
            Intercom Management
          </Link>

          <Link to="/intercom" onClick={onClose}>
            Intercom
          </Link>

          <Link to="/flats" onClick={onClose}>
            Flats
          </Link>

          <Link to="/househelp" onClick={onClose}>
            Househelp Postings
          </Link>

          {/* add new features here later */}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;