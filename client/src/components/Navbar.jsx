import { useLocation } from "react-router-dom";

function Navbar({ profile, onLogout, onMenuClick }) {
  const location = useLocation();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/proposals": "Proposals",
    "/bookings": "Bookings",
    "/garages": "Garages",
    "/garages/book": "Book Garage",
    "/garages/my-bookings": "My Garage Bookings",
    "/books": "Library",
    "/books/create": "Create Book",
    "/noticeboard": "Noticeboard",
    "/complaints": "Complaints",
    "/complaints/submit": "Submit Complaint",
    "/complaints/my-flat": "Complaints Against My Flat",
    "/intercom": "Intercom",
    "/building-layout": "Building Layout",
    "/building-layout/manage": "Manage Building Layout",
    "/intercom-access": "Intercom Management",
    "/family-expenses": "Family Expenses",
    "/lost-found": "Lost & Found",
  };

  // an exact match wins, otherwise fall back to the longest matching prefix so
  // pages with an id in the url (e.g. /family-expenses/<id>) still get a name
  const matchPageName = (path) => {
    if (pageNames[path]) return pageNames[path];

    const prefix = Object.keys(pageNames)
      .filter((key) => path.startsWith(`${key}/`))
      .sort((a, b) => b.length - a.length)[0];

    return prefix ? pageNames[prefix] : "NEER";
  };

  const pageName = matchPageName(location.pathname);

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
          {profile ? `${profile.username}${profile.flatNumber ? ` : ${profile.flatNumber}` : ""}` : "User"}
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