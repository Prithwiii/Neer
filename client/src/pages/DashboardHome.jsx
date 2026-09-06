import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";
import { getCurrentMonth } from "../config/familyExpense";

// Small stroke icons for the quick access cards. They are inline so the
// project does not pick up an icon dependency.
const icons = {
    bills: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 3h16v18l-2.5-1.6L15 21l-2.5-1.6L10 21l-2.5-1.6L5 21l-1-.6z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
    ),
    layout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6v6H9z" />
        </svg>
    ),
    family: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20a6 6 0 0 1 12 0" />
            <path d="M16 11a3 3 0 1 0-1.5-5.6" />
            <path d="M17 20a6 6 0 0 0-2-4.5" />
        </svg>
    ),
    lostFound: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
            <path d="M11 8v3.5M11 14.5v.01" />
        </svg>
    ),
    complaints: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M7 8h10M7 12h6" />
        </svg>
    ),
    contacts: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20a6 6 0 0 1 12 0M16 4h5v16h-5M18 8h1M18 12h1M18 16h1" />
        </svg>
    ),
    booking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
            <path d="m9 15 2 2 4-4" />
        </svg>
    )
};

const emptyStats = {
    pendingBills: 0,
    overdueBills: 0,
    totalBills: 0,
    complaintsAgainstMyFlat: 0,
    garageBookingsDue: 0,
    proposalsYetToVote: 0
};

function DashboardHome({ role, token }) {
    const [stats, setStats] = useState(emptyStats);
    // without a token there is nothing to fetch, so the summary is not loading
    const [loading, setLoading] = useState(Boolean(token));

    // staff do not get the family expense tracker, matching the sidebar
    const showsFamily = role !== "staff";
    const showsServices = role !== "staff";

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        const loadBills = async () => {
            const response = await fetch(
                `${API_URL}/api/bills?month=${getCurrentMonth()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error("bills");

            return response.json();
        };

        const loadProfile = async () => {
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("profile");

            return response.json();
        };

        const loadGarageBookings = async () => {
            const response = await fetch(`${API_URL}/api/garage-bookings/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("garage-bookings");

            return response.json();
        };

        const loadProposals = async () => {
            const response = await fetch(`${API_URL}/api/proposals`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("proposals");

            return response.json();
        };

        const loadComplaints = async () => {
            const response = await fetch(`${API_URL}/api/complaints`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("complaints");

            return response.json();
        };

        const loadSummary = async () => {
            // every panel is optional, one failing feature should not take the
            // whole dashboard down, so each result is handled on its own
            const [bills, profile, complaints, garageBookings, proposals] = await Promise.allSettled([
                loadBills(),
                showsFamily ? loadProfile() : Promise.resolve(null),
                showsFamily ? loadComplaints() : Promise.resolve([]),
                showsFamily ? loadGarageBookings() : Promise.resolve([]),
                showsFamily ? loadProposals() : Promise.resolve([])
            ]);

            if (cancelled) return;

            const next = { ...emptyStats };

            if (bills.status === "fulfilled" && Array.isArray(bills.value)) {
                next.totalBills = bills.value.length;
                next.pendingBills = bills.value.filter((b) => b.status === "pending").length;
                next.overdueBills = bills.value.filter((b) => b.status === "overdue").length;
            }

            if (profile.status === "fulfilled" && profile.value?.flatNumber && complaints.status === "fulfilled" && Array.isArray(complaints.value)) {
                const flatNumber = profile.value.flatNumber.trim().toUpperCase();
                next.complaintsAgainstMyFlat = complaints.value.filter(
                    (complaint) => (complaint.flatNumber || "").trim().toUpperCase() === flatNumber
                ).length;
            }

            if (garageBookings.status === "fulfilled" && Array.isArray(garageBookings.value)) {
                const now = new Date();
                next.garageBookingsDue = garageBookings.value.filter(
                    (booking) => booking.status === "confirmed" && new Date(booking.startDate) >= now
                ).length;
            }

            if (profile.status === "fulfilled" && profile.value?._id && proposals.status === "fulfilled" && Array.isArray(proposals.value)) {
                next.proposalsYetToVote = proposals.value.filter(
                    (proposal) => !proposal.votes.some(
                        (vote) => String(vote.resident) === String(profile.value._id)
                    )
                ).length;
            }

            setStats(next);
            setLoading(false);
        };

        loadSummary();

        return () => {
            cancelled = true;
        };
    }, [token, showsFamily]);

    return (
        <div className="dashboard-page nx">
            <div className="dash-hero">
                <h1>Welcome to NEER</h1>

                <p>
                    Your apartment at a glance — track this month&apos;s bills, keep
                    an eye on your bookings, and stay across what neighbours have
                    lost or found in the building.
                </p>

                <span className="dash-hero-role">Signed in as {role}</span>
            </div>

            {!showsServices ? (
                <div className="dash-empty staff-dashboard-note">
                    <strong>Staff workspace</strong>
                    <span>Use the building and operations tools from the navigation menu.</span>
                </div>
            ) : loading ? (
                <div className="dash-empty dash-loading" role="status">
                    <span className="dash-loading-mark" aria-hidden="true" />
                    <span>Loading your summary...</span>
                </div>
            ) : null}

            {showsFamily && !loading && (
                <section className="notification-center" aria-label="Notifications">
                    <div className="notification-center-heading">
                        <div>
                            <p className="dash-section-kicker">Needs your attention</p>
                            <h2>Notification Centre</h2>
                        </div>
                        <span>{stats.pendingBills + stats.overdueBills + stats.garageBookingsDue + stats.complaintsAgainstMyFlat + stats.proposalsYetToVote} items</span>
                    </div>
                    <div className="notification-list">
                        <Link to="/bills" className="notification-item">
                            <span className="notification-icon notification-icon-alert">৳</span>
                            <span><strong>Pending bills</strong><small>{stats.pendingBills + stats.overdueBills} requiring attention this month</small></span>
                            <b>{stats.pendingBills + stats.overdueBills}</b>
                        </Link>
                        <Link to="/garages/my-bookings" className="notification-item">
                            <span className="notification-icon">▤</span>
                            <span><strong>Garage booking due</strong><small>Upcoming confirmed garage bookings</small></span>
                            <b>{stats.garageBookingsDue}</b>
                        </Link>
                        <Link to="/complaints/my-flat" className="notification-item">
                            <span className="notification-icon">!</span>
                            <span><strong>Complaints against my flat</strong><small>Verified complaints listed for your flat</small></span>
                            <b>{stats.complaintsAgainstMyFlat}</b>
                        </Link>
                        <Link to="/proposals" className="notification-item">
                            <span className="notification-icon">◇</span>
                            <span><strong>Proposals yet to vote</strong><small>Community decisions waiting for your vote</small></span>
                            <b>{stats.proposalsYetToVote}</b>
                        </Link>
                    </div>
                </section>
            )}

            <div className="dash-section-heading dash-section-heading-quick">
                <div>
                    <p className="dash-section-kicker">{showsServices ? "Everything close at hand" : "Staff tools"}</p>
                    <h2 className="dash-section-title">Quick Access</h2>
                </div>
            </div>

            {showsServices ? <div className="dash-quick-grid">
                <Link to="/bills" className="dash-quick-card">
                    <span className="dash-quick-icon">{icons.bills}</span>
                    <h3>Bill Payments</h3>
                    <p>
                        Track electricity, gas, water and service charges month by
                        month, and mark them off as you pay.
                    </p>
                </Link>

                <Link to="/bookings" className="dash-quick-card">
                    <span className="dash-quick-icon">{icons.booking}</span>
                    <h3>Common Space &amp; Facility Booking</h3>
                    <p>
                        Reserve the community hall, rooftop, gym or pool, and see
                        which time slots are already taken.
                    </p>
                </Link>

                <Link to="/building-layout" className="dash-quick-card">
                    <span className="dash-quick-icon">{icons.layout}</span>
                    <h3>Building Layout</h3>
                    <p>
                        Find flats, entrances, lifts, stairs, parking and emergency
                        exits floor by floor.
                    </p>
                </Link>

                {showsFamily && (
                    <Link to="/family-expenses" className="dash-quick-card">
                        <span className="dash-quick-icon">{icons.family}</span>
                        <h3>Family Expenses</h3>
                        <p>
                            Keep a private household spending sheet and share it with
                            the family members you choose.
                        </p>
                    </Link>
                )}

                <Link to="/lost-found" className="dash-quick-card">
                    <span className="dash-quick-icon">{icons.lostFound}</span>
                    <h3>Lost &amp; Found</h3>
                    <p>
                        Report something you have lost or found, and search what
                        neighbours have posted to the board.
                    </p>
                </Link>
            </div> : (
                <div className="dash-quick-grid staff-quick-grid">
                    <Link to="/complaints" className="dash-quick-card">
                        <span className="dash-quick-icon">{icons.complaints}</span>
                        <h3>Complaints</h3>
                        <p>Review and manage resident complaints from one place.</p>
                    </Link>

                    <Link to="/contacts" className="dash-quick-card">
                        <span className="dash-quick-icon">{icons.contacts}</span>
                        <h3>Contact Directory</h3>
                        <p>Find building staff, emergency contacts, and committee members.</p>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default DashboardHome;
