import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API_URL from "../config/api";

function DashboardLayout({ token, role, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        const response = await fetch(
        //   "http://localhost:5000/api/auth/profile",
        `${API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const user = await response.json();
        setProfile(user);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [token]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="app-layout">
      <Navbar
        profile={profile}
        onLogout={onLogout}
        onMenuClick={() => setMenuOpen(true)}
      />

      <Sidebar
        open={menuOpen}
        role={role}
        onClose={closeMenu}
      />

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;