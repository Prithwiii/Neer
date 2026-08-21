import { useLocation } from "react-router-dom";

function Navbar({ profile, onLogout, onMenuClick }) {
  const location = useLocation();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/proposals": "Proposals",
    "/bookings": "Bookings",
    "/books": "Library",
    "/books/create": "Create Book",
    "/noticeboard": "Noticeboard",
    "/intercom": "Intercom",
  };

  const pageName = pageNames[location.pathname] || "NEER";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div className="navbar-brand">NEER</div>

        <div className="navbar-page">{pageName}</div>
      </div>

      <div className="navbar-right">
        <span className="navbar-username">
          {profile ? profile.username : "User"}
        </span>

        <button
          type="button"
          className="secondary"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;