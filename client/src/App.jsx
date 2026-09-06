import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Noticeboard from "./pages/Noticeboard";
import Complaints from "./pages/Complaints";
import ComplaintSubmit from "./pages/ComplaintSubmit";
import Auth from "./pages/Auth";
import ResidentDashboard from "./pages/ResidentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import Booking from "./pages/Booking";
import Garages from "./pages/Garages";
import GarageBookingPage from "./pages/GarageBookingPage";
import MyGarageBookings from "./pages/MyGarageBookings";
import Books from "./pages/Books";
import CreateBook from "./pages/CreateBook";
import DashboardHome from "./pages/DashboardHome";
import BillPayments from "./pages/BillPayments";
import BuildingLayout from "./pages/BuildingLayout";
import ManageBuildingLayout from "./pages/ManageBuildingLayout";
import IntercomAccess from "./pages/IntercomAccess";
import Intercom from "./pages/Intercom";
import ContactDirectory from "./pages/ContactDirectory";
import Flats from "./pages/Flats";
import HousehelpPostings from "./pages/HousehelpPostings";
import CreateHousehelpPosting from "./pages/CreateHousehelpPosting";
import FamilyExpenses from "./pages/FamilyExpenses";
import FamilyExpenseSheet from "./pages/FamilyExpenseSheet";
import LostFound from "./pages/LostFound";
import LostFoundDetail from "./pages/LostFoundDetail";
import Surveillance from "./pages/Surveillance";
import GuestRegistration from "./pages/GuestRegistration";
import GuestValidation from "./pages/GuestValidation";
import Maintenance from "./pages/Maintenance";
import Chat from "./pages/Chat";
import { disconnectSocket } from "./services/socket";

import DashboardLayout from "./layouts/DashboardLayout";

import "./App.css";
// scoped theme for the Dashboard and the five redesigned feature areas.
// every rule inside is nested under `.nx`, so it cannot reach other pages.
import "./styles/neer-theme.css";

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

    disconnectSocket();

    setToken(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <Auth
              token={token}
              onLogin={handleLogin}
            />
          }
        />

        {/* ================================================= */}
        {/* AUTHENTICATED PAGES - ALL USE DASHBOARD LAYOUT   */}
        {/* ================================================= */}

        <Route
          element={
            token ? (
              <DashboardLayout
                token={token}
                role={role}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<DashboardHome role={role} token={token} />}
          />

          {/* Maintenance */}
          <Route path="/maintenance" element={<Maintenance />} />

          {/* Chat */}
          <Route
            path="/chat"
            element={<Chat token={token} role={role} />}
          />

          

          {/* Proposals */}
          <Route
            path="/proposals"
            element={
              role === "staff" ? (
                <Navigate to="/dashboard" replace />
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
            }
          />

          {/* Bookings */}
          <Route
            path="/bookings"
            element={
              <Booking
                token={token}
                onLogout={handleLogout}
                role={role}
              />
            }
          />

          {/* Bill Payments */}
          <Route
            path="/bills"
            element={
              <BillPayments
                token={token}
                onLogout={handleLogout}
                role={role}
              />
            }
          />

          {/* Garages */}
          <Route
            path="/garages"
            element={
              <Garages
                token={token}
                onLogout={handleLogout}
                role={role}
              />
            }
          />

          <Route
            path="/garages/book/:garageId"
            element={
              <GarageBookingPage
                token={token}
                onLogout={handleLogout}
              />
            }
          />

          <Route
            path="/garages/my-bookings"
            element={
              <MyGarageBookings
                token={token}
                onLogout={handleLogout}
              />
            }
          />

          {/* Library */}
          <Route
            path="/books"
            element={<Books />}
          />

          <Route
            path="/books/create"
            element={<CreateBook token={token} />}
          />

          {/* Noticeboard */}
          <Route
            path="/noticeboard"
            element={<Noticeboard />}
          />

          {/* Complaints */}
          <Route
            path="/complaints"
            element={
              <Complaints
                token={token}
                onLogout={handleLogout}
                role={role}
              />
            }
          />

          <Route
            path="/complaints/my-flat"
            element={
              role !== "staff" ? (
                <Complaints
                  token={token}
                  onLogout={handleLogout}
                  role={role}
                  view="my-flat"
                />
              ) : (
                <Navigate to="/complaints" replace />
              )
            }
          />

          <Route
            path="/complaints/submit"
            element={
              role !== "staff" ? (
                <ComplaintSubmit
                  token={token}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/complaints" replace />
              )
            }
          />

          {/* Building Layout */}
          <Route
            path="/building-layout"
            element={
              <BuildingLayout
                token={token}
                role={role}
              />
            }
          />

          {role === "committee" && (
            <Route
              path="/building-layout/manage"
              element={
                <ManageBuildingLayout
                  token={token}
                  role={role}
                />
              }
            />
          )}

          {/* Contact Directory */}
          <Route
            path="/contacts/:type?"
            element={
              <ContactDirectory token={token} />
            }
          />

          {/* Intercom */}
          <Route
            path="/intercom"
            element={<Intercom />}
          />

          <Route
            path="/intercom-access"
            element={<IntercomAccess />}
          />

          {/* Flats */}
          <Route
            path="/flats"
            element={<Flats />}
          />

          {/* Househelp */}
          <Route
            path="/househelp"
            element={<HousehelpPostings />}
          />

          <Route
            path="/househelp/create"
            element={<CreateHousehelpPosting />}
          />

          {/* Family Expenses */}
          <Route
            path="/family-expenses"
            element={<FamilyExpenses token={token} />}
          />

          <Route
            path="/family-expenses/:sheetId"
            element={<FamilyExpenseSheet token={token} />}
          />

          {/* Lost & Found */}
          <Route
            path="/lost-found"
            element={<LostFound token={token} />}
          />

          <Route
            path="/lost-found/:postId"
            element={
              <LostFoundDetail
                token={token}
                role={role}
              />
            }
          />

          {/* Surveillance */}
          <Route
            path="/surveillance"
            element={
              <Surveillance
                token={token}
                role={role}
              />
            }
          />

          {/* Guest Registration */}
          <Route
            path="/guest-registration"
            element={<GuestRegistration />}
          />

          {role === "staff" && (
            <Route
              path="/guest-validation"
              element={<GuestValidation />}
            />
          )}

        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;