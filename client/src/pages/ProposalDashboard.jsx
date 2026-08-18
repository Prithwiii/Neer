import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

// const PROPOSAL_API = "http://localhost:5001/api/proposals";
const PROPOSAL_API = `${API_URL}/api/proposals`;

const dashboardOptions = [
  { key: "create", label: "Create Proposal" },
  { key: "vote", label: "Vote Proposal" },
];

function ProposalDashboard({ token, onLogout, role }) {
  const [proposals, setProposals] = useState([]);
  const defaultPanel = role === "resident" ? "vote" : "create";
  const [activePanel, setActivePanel] = useState(defaultPanel);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Budget Approval");
  const [message, setMessage] = useState("");

  const loadProposals = useCallback(async () => {
    const response = await fetch(PROPOSAL_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(JSON.stringify(data, null, 2));
      return;
    }
    setProposals(data);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      await loadProposals();
    };

    loadInitialData();
  }, [token, loadProposals]);

  const createProposal = async (event) => {
    event.preventDefault();
    const response = await fetch(PROPOSAL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, type }),
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));

    if (response.ok) {
      setTitle("");
      setDescription("");
      loadProposals();
    }
  };

  const voteProposal = async (proposalId, vote) => {
    const response = await fetch(`${PROPOSAL_API}/${proposalId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ vote }),
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));

    if (response.ok) {
      setProposals((prev) =>
        prev.map((proposal) =>
          proposal._id === data._id ? data : proposal
        )
      );
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Proposal Dashboard</h1>
          <p>Choose an action below to manage proposals.</p>
        </div>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      <nav className="top-nav">
        <Link to="/proposals">Proposals</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/bills">Bill Payments</Link>
        <Link to="/garages">Garages</Link>
        <Link to="/noticeboard">Noticeboard</Link>
        <Link to="/books">Library</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <div className="dashboard-menu">
        {dashboardOptions
          .filter((opt) => {
            if (role === "resident") return opt.key === "vote";
            return true; // committee sees all options
          })
          .map((option) => (
            <button
              key={option.key}
              type="button"
              className={option.key === activePanel ? "active" : ""}
              onClick={() => setActivePanel(option.key)}
            >
              {option.label}
            </button>
          ))}
      </div>

      <div className="dashboard-panel">
        {activePanel === "create" ? (
          <div className="panel-card" id="create-proposal">
            <h2>Create Proposal</h2>
            <form onSubmit={createProposal} className="proposal-form">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Proposal title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proposal description"
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option>Budget Approval</option>
                <option>Rule Change</option>
                <option>Vendor Selection</option>
              </select>
              <button className="primary" type="submit">
                Create Proposal
              </button>
            </form>
          </div>
        ) : (
          <div className="panel-card" id="vote-proposals">
            <h2>Vote for Proposal</h2>
            {proposals.length === 0 ? (
              <p>No proposals available yet.</p>
            ) : (
              proposals.map((proposal) => {
                const yesVotes = proposal.votes.filter((v) => v.vote === "Yes").length;
                const noVotes = proposal.votes.filter((v) => v.vote === "No").length;
                return (
                  <div key={proposal._id} className="proposal-card">
                    <h3>{proposal.title}</h3>
                    <p>{proposal.description}</p>
                    <p>Type: {proposal.type}</p>
                    <div className="proposal-actions">
                      <button onClick={() => voteProposal(proposal._id, "Yes")}>Yes</button>
                      <button onClick={() => voteProposal(proposal._id, "No")}>No</button>
                    </div>
                    <p>Yes: {yesVotes} | No: {noVotes}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <pre className="dashboard-message">{message}</pre>
    </div>
  );
}

export default ProposalDashboard;