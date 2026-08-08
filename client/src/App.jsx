import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Auth from "./pages/Auth";
import StaffDashboard from "./pages/StaffDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import Booking from "./pages/Booking";
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
    setToken(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/proposals" replace />} />
        <Route path="/login" element={<Auth token={token} onLogin={handleLogin} />} />
        <Route
          path="/proposals"
          element={
            token ? (
              role === "staff" ? (
                <StaffDashboard token={token} onLogout={handleLogout} />
              ) : role === "committee" ? (
                <CommitteeDashboard token={token} onLogout={handleLogout} role={role} />
              ) : (
                <ResidentDashboard token={token} onLogout={handleLogout} role={role} />
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
              <Booking token={token} onLogout={handleLogout} role={role} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;