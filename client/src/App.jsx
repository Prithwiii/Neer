import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Noticeboard from "./pages/Noticeboard";
import Complaints from "./pages/Complaints";
import ComplaintSubmit from "./pages/ComplaintSubmit";
import Auth from "./pages/Auth";
import StaffDashboard from "./pages/StaffDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import Booking from "./pages/Booking";
import Garages from "./pages/Garages";
import GarageBookingPage from "./pages/GarageBookingPage";
import MyGarageBookings from "./pages/MyGarageBookings";
import Books from "./pages/Books";
import CreateBook from "./pages/CreateBook";
import BillPayments from "./pages/BillPayments";
import DashboardHome from "./pages/DashboardHome";

import DashboardLayout from "./layouts/DashboardLayout";

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
          // element={<Navigate to="/proposal" replace />}
          element={<Navigate to="/dashboard" replace />}
        />
{/* ------------------------ */}
        <Route
          path="/login"
          element={<Auth token={token} onLogin={handleLogin} />}
        />

        <Route
          element = { token ? (
            <DashboardLayout
              token = {token}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to ="/login" replace />
          )}
        >
          <Route
            path = "/dashboard"
            element = { <DashboardHome role = {role}/>
            } />

          <Route path="/books" element={<Books />} />

          <Route
            path="/books/create"
            element={<CreateBook token={token} />}
          />
        </Route>

{/* ------------------------- */}
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

        <Route
          path="/garages/book/:garageId"
          element={
            token ? <GarageBookingPage token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/garages/my-bookings"
          element={
            token ? <MyGarageBookings token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />

        <Route path="/books" element={<Books />} />

        <Route
          path="/bills"
          element={
            token ? (
              <BillPayments
                token={token}
                onLogout={handleLogout}
                role={role}
              />
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
          path="/complaints"
          element={
            token ? (
              <Complaints token={token} onLogout={handleLogout} role={role} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/complaints/my-flat"
          element={
            token && role !== "staff" ? <Complaints token={token} onLogout={handleLogout} role={role} view="my-flat" /> : <Navigate to={token ? "/complaints" : "/login"} replace />
          }
        />

        <Route
          path="/complaints/submit"
          element={
            token && role !== "staff" ? <ComplaintSubmit token={token} onLogout={handleLogout} /> : <Navigate to={token ? "/complaints" : "/login"} replace />
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