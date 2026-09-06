import { useState } from "react";
import { useLocation } from "react-router-dom";

function Navbar({ profile, onLogout, onMenuClick }) {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

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
    "/contacts": "Contact Directory",
    "/flats": "Flats",
    "/househelp": "Househelp Postings",
    "/maintenance": "Maintenance",
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
        <div className="profile-menu">
          <button
            type="button"
            className="profile-trigger"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
          >
            <span className="profile-avatar" aria-hidden="true">
              {(profile?.username || "U").charAt(0).toUpperCase()}
            </span>
            <span className="navbar-username">
              {profile ? `${profile.username}${profile.flatNumber ? ` : ${profile.flatNumber}` : ""}` : "User"}
            </span>
            <span className="profile-chevron" aria-hidden="true">⌄</span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <p className="profile-dropdown-label">Signed in as</p>
              <strong>{profile?.username || "User"}</strong>
              {profile?.flatNumber && <span>{profile.flatNumber}</span>}
              <button type="button" className="profile-logout" onClick={onLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;