function DashboardHome({ role }) {
  return (
    <div className="dashboard-home">
      <h1>Welcome to NEER</h1>

      <p>
        You are logged in as <strong>{role}</strong>.
      </p>

      <p>
        Use the menu above to access NEER features.
      </p>
    </div>
  );
}

export default DashboardHome;