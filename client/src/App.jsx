import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Noticeboard from "./pages/Noticeboard";
import Auth from "./pages/Auth";
import StaffDashboard from "./pages/StaffDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import Booking from "./pages/Booking";
import Garages from "./pages/Garages";
import Books from "./pages/Books";
import CreateBook from "./pages/CreateBook";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole || null);

    if (newToken) localStorage.setItem("token", newToken);
    if (newRole) localStorage.setItem("role", newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    setToken(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/proposals" replace />}
        />

        <Route
          path="/login"
          element={<Auth token={token} onLogin={handleLogin} />}
        />

        <Route
          path="/proposals"
          element={
            token ? (
              role === "staff" ? (
                <StaffDashboard
                  token={token}
                  onLogout={handleLogout}
                />
              ) : role === "committee" ? (
                <CommitteeDashboard
                  token={token}
                  onLogout={handleLogout}
                  role={role}
                />
              ) : (
                <ResidentDashboard
                  token={token}
                  onLogout={handleLogout}
                  role={role}
                />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/bookings"
          element={
            token ? (
              <Booking
                token={token}
                onLogout={handleLogout}
                role={role}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/garages"
          element={
            token ? (
              <Garages token={token} onLogout={handleLogout} role={role} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/books" element={<Books />} />

        <Route
          path="/books/create"
          element={
            token ? (
              <CreateBook token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Noticeboard */}
        <Route
          path="/noticeboard"
          element={
            token ? (
              <Noticeboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;