import { useState, useEffect, useCallback } from "react";
import API_URL from "../config/api";

// const PROPOSAL_API = "http://localhost:5001/api/proposals";
const PROPOSAL_API = `${API_URL}/api/proposals`;

const dashboardOptions = [
  { key: "create", label: "Create Proposal" },
  { key: "vote", label: "Vote Proposal" },
];

function ProposalDashboard({ token, role }) {
  const [proposals, setProposals] = useState([]);
  const defaultPanel = role === "resident" ? "vote" : "create";
  const [activePanel, setActivePanel] = useState(defaultPanel);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Budget Approval");
  const [message, setMessage] = useState("");
  const [changingVoteId, setChangingVoteId] = useState(null);
  const userId = localStorage.getItem("userId");

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

    if (response.ok) {
      setMessage("Proposal created successfully.");
      setTitle("");
      setDescription("");
      loadProposals();
    } else {
      setMessage(data.message || "Unable to create proposal.");
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

    if (response.ok) {
      setMessage("Your vote has been recorded.");
      setChangingVoteId(null);
      setProposals((prev) =>
        prev.map((proposal) =>
          proposal._id === data._id ? data : proposal
        )
      );
    } else {
      setMessage(data.message || "Unable to record your vote.");
    }
  };

  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.votes.length, 0);

  return (
    <div className="dashboard-page nx proposals-page">
      <div className="dashboard-header">
        <div>
          <h1>Proposal Dashboard</h1>
          <p>Choose an action below to manage proposals.</p>
        </div>
      </div>

      <div className="feature-stat-grid" aria-label="Proposal summary">
        <div className="feature-stat-card"><span>Active proposals</span><strong>{proposals.length}</strong></div>
        <div className="feature-stat-card"><span>Total votes</span><strong>{totalVotes}</strong></div>
        <div className="feature-stat-card"><span>Workspace</span><strong>{role === "committee" ? "Committee" : "Resident"}</strong></div>
      </div>

      <div className="dashboard-menu">
        {dashboardOptions
          .filter((opt) => {
            if (role === "resident") return opt.key === "vote";
            return role === "committee";
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
              <div className="feature-empty-state"><span className="feature-empty-icon">◇</span><strong>No proposals available yet</strong><span>New community proposals will appear here when they are published.</span></div>
            ) : (
              proposals.map((proposal) => {
                const yesVotes = proposal.votes.filter((v) => v.vote === "Yes").length;
                const noVotes = proposal.votes.filter((v) => v.vote === "No").length;
                const userVote = proposal.votes.find(
                  (vote) => String(vote.resident) === String(userId)
                );
                const isChangingVote = changingVoteId === proposal._id;
                return (
                  <div key={proposal._id} className="proposal-card proposal-card-rich">
                    <div className="proposal-card-topline">
                      <span className="proposal-type-badge">{proposal.type}</span>
                      {userVote && <span className="proposal-vote-status">Vote recorded</span>}
                    </div>
                    <h3>{proposal.title}</h3>
                    <p className="proposal-description">{proposal.description}</p>
                    <div className="proposal-vote-summary">
                      <span>Yes <strong>{yesVotes}</strong></span>
                      <span>No <strong>{noVotes}</strong></span>
                    </div>
                    {userVote && !isChangingVote ? (
                      <div className="proposal-voted-state">
                        <span>Your vote: <strong>{userVote.vote}</strong></span>
                        <button className="secondary" onClick={() => setChangingVoteId(proposal._id)}>
                          Change vote
                        </button>
                      </div>
                    ) : (
                      <div className="proposal-actions">
                        {isChangingVote && <span className="proposal-change-prompt">Choose a new vote</span>}
                        <button onClick={() => voteProposal(proposal._id, "Yes")}>Yes</button>
                        <button onClick={() => voteProposal(proposal._id, "No")}>No</button>
                        {isChangingVote && <button className="secondary" onClick={() => setChangingVoteId(null)}>Cancel</button>}
                      </div>
                    )}
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