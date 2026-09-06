import { Link, useLocation } from "react-router-dom";

function Sidebar({ open, role, onClose }) {
  const location = useLocation();

  const linkClassName = (path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
      ? "sidebar-link active"
      : "sidebar-link"
  );

  const navIcon = (icon) => <span className="sidebar-icon" aria-hidden="true">{icon}</span>;

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
          <p className="sidebar-section-label">Overview</p>
          <Link className={linkClassName("/dashboard")} to="/dashboard" onClick={onClose}>
            {navIcon("⌂")}
            Dashboard
          </Link>

          {role !== "staff" && (
            <Link className={linkClassName("/proposals")} to="/proposals" onClick={onClose}>
              {navIcon("◇")}
              Proposals
            </Link>
          )}

          {role !== "staff" && (
            <>
              <p className="sidebar-section-label">Services</p>
              <Link className={linkClassName("/bookings")} to="/bookings" onClick={onClose}>
                {navIcon("▣")}
                Bookings
              </Link>

              <Link className={linkClassName("/garages")} to="/garages" onClick={onClose}>
                {navIcon("▤")}
                Garages
              </Link>

              <Link className={linkClassName("/bills")} to="/bills" onClick={onClose}>
                {navIcon("৳")}
                Bill Payments
              </Link>

              <Link className={linkClassName("/family-expenses")} to="/family-expenses" onClick={onClose}>
                {navIcon("+")}
                Family Expenses
              </Link>

              <Link className={linkClassName("/books")} to="/books" onClick={onClose}>
                {navIcon("▥")}
                Library
              </Link>

              <Link className={linkClassName("/noticeboard")} to="/noticeboard" onClick={onClose}>
                {navIcon("▤")}
                Noticeboard
              </Link>

              <Link className={linkClassName("/lost-found")} to="/lost-found" onClick={onClose}>
                {navIcon("⌕")}
                Lost &amp; Found
              </Link>

              <Link className={linkClassName("/alerts")} to="/alerts" onClick={onClose}>
                {navIcon("⚠")}
                Alerts
              </Link>
            </>
          )}

          <p className="sidebar-section-label">Building</p>
          <Link className={linkClassName("/building-layout")} to="/building-layout" onClick={onClose}>
            {navIcon("⌂")}
            Building Layout
          </Link>

          <Link className={linkClassName("/surveillance")} to="/surveillance" onClick={onClose}>
            {navIcon("◉")}
            Surveillance
          </Link>

          {role === "committee" && (
            <Link
              className={linkClassName("/building-layout/manage")}
              to="/building-layout/manage"
              onClick={onClose}
            >
              {navIcon("✦")}
              Manage Building Layout
            </Link>
          )}

          <Link className={linkClassName("/complaints")} to="/complaints" onClick={onClose}>
            {navIcon("!")}
            Complaints
          </Link>

          <Link className={linkClassName("/contacts")} to="/contacts" onClick={onClose}>
            {navIcon("◎")}
            Contact Directory
          </Link>

          {role === "committee" && (
            <>
              <Link className={linkClassName("/intercom-access")} to="/intercom-access" onClick={onClose}>
                {navIcon("◌")}
                Intercom Management
              </Link>
            </>
          )}

          <Link className={linkClassName("/intercom")} to="/intercom" onClick={onClose}>
            {navIcon("◍")}
            Intercom
          </Link>

          <Link className={linkClassName("/flats")} to="/flats" onClick={onClose}>
            {navIcon("▦")}
            Flats
          </Link>

          <Link className={linkClassName("/househelp")} to="/househelp" onClick={onClose}>
            {navIcon("♧")}
            Househelp Postings
          </Link>

          <Link
            className={linkClassName("/guest-registration")}
            to="/guest-registration"
            onClick={onClose}
          >
            {navIcon("＋")}
            Register Guest
          </Link>

          {role === "staff" && (
            <>
              <Link
                className={linkClassName("/guest-validation")}
                to="/guest-validation"
                onClick={onClose}
              >
                {navIcon("✓")}
                Validate Guest
              </Link>
            </>
          )}

          <Link className={linkClassName("/maintenance")} to="/maintenance" onClick={onClose}>
            {navIcon("⚙")}
            Maintenance
          </Link>

          

          

          {/* add new features here later */}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
