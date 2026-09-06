import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API_URL from "../config/api";
import { formatAmount, getCurrentMonth } from "../config/familyExpense";
import { getFamilySheets } from "../services/familyExpenseService";
import { getLostFoundPosts } from "../services/lostFoundService";

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
    paidBills: 0,
    overdueBills: 0,
    totalBills: 0,
    upcomingBookings: 0,
    activeLostFound: 0,
    returnedLostFound: 0,
    familySheets: 0,
    familyTotal: 0
};

function DashboardHome({ role, token }) {
    const [stats, setStats] = useState(emptyStats);
    // without a token there is nothing to fetch, so the summary is not loading
    const [loading, setLoading] = useState(Boolean(token));

    // staff do not get the family expense tracker, matching the sidebar
    const showsFamily = role !== "staff";

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

        const loadBookings = async () => {
            const response = await fetch(`${API_URL}/api/bookings/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("bookings");

            return response.json();
        };

        const loadSummary = async () => {
            // every panel is optional, one failing feature should not take the
            // whole dashboard down, so each result is handled on its own
            const [bills, bookings, board, sheets] = await Promise.allSettled([
                loadBills(),
                loadBookings(),
                getLostFoundPosts({}, token),
                showsFamily ? getFamilySheets(token) : Promise.resolve([])
            ]);

            if (cancelled) return;

            const next = { ...emptyStats };

            if (bills.status === "fulfilled" && Array.isArray(bills.value)) {
                next.totalBills = bills.value.length;
                next.paidBills = bills.value.filter((b) => b.status === "paid").length;
                next.pendingBills = bills.value.filter((b) => b.status === "pending").length;
                next.overdueBills = bills.value.filter((b) => b.status === "overdue").length;
            }

            if (bookings.status === "fulfilled" && Array.isArray(bookings.value)) {
                const now = new Date();

                next.upcomingBookings = bookings.value.filter(
                    (b) =>
                        b.status === "confirmed" &&
                        new Date(`${b.date}T${b.endTime}:00`) >= now
                ).length;
            }

            if (board.status === "fulfilled" && board.value.summary) {
                next.activeLostFound = board.value.summary.active;
                next.returnedLostFound = board.value.summary.returned;
            }

            if (sheets.status === "fulfilled" && Array.isArray(sheets.value)) {
                next.familySheets = sheets.value.length;
                next.familyTotal = sheets.value.reduce(
                    (sum, sheet) => sum + (sheet.totalAmount || 0),
                    0
                );
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

            <h2 className="dash-section-title">This Month</h2>

            {loading ? (
                <p className="dash-empty">Loading your summary...</p>
            ) : (
                <div className="dash-stat-grid">
                    <Link to="/bills" className="dash-stat">
                        <span className="dash-stat-label">Pending Bills</span>
                        <span
                            className={`dash-stat-value ${
                                stats.overdueBills > 0 ? "is-alert" : ""
                            }`}
                        >
                            {stats.pendingBills + stats.overdueBills}
                        </span>
                        <span className="dash-stat-note">
                            {stats.overdueBills > 0
                                ? `${stats.overdueBills} overdue`
                                : "Nothing overdue"}
                        </span>
                    </Link>

                    <Link to="/bills" className="dash-stat">
                        <span className="dash-stat-label">Paid Bills</span>
                        <span className="dash-stat-value is-ok">{stats.paidBills}</span>
                        <span className="dash-stat-note">
                            of {stats.totalBills} this month
                        </span>
                    </Link>

                    <Link to="/bookings" className="dash-stat">
                        <span className="dash-stat-label">Upcoming Bookings</span>
                        <span className="dash-stat-value">{stats.upcomingBookings}</span>
                        <span className="dash-stat-note">
                            Spaces &amp; facilities
                        </span>
                    </Link>

                    <Link to="/lost-found" className="dash-stat">
                        <span className="dash-stat-label">Active Lost &amp; Found</span>
                        <span className="dash-stat-value">{stats.activeLostFound}</span>
                        <span className="dash-stat-note">
                            {stats.returnedLostFound} returned
                        </span>
                    </Link>

                    {showsFamily && stats.familySheets > 0 && (
                        <Link to="/family-expenses" className="dash-stat">
                            <span className="dash-stat-label">Family Expenses</span>
                            <span className="dash-stat-value">
                                &#2547;{formatAmount(stats.familyTotal)}
                            </span>
                            <span className="dash-stat-note">
                                across {stats.familySheets} sheet
                                {stats.familySheets === 1 ? "" : "s"}
                            </span>
                        </Link>
                    )}
                </div>
            )}

            <h2 className="dash-section-title">Quick Access</h2>

            <div className="dash-quick-grid">
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
            </div>
        </div>
    );
}

export default DashboardHome;
