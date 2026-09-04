import { useEffect, useState } from "react";
import API_URL from "../config/api";

function Proposal() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // fetch("http://localhost:5000/api/proposals", {
    fetch(`${API_URL}/api/proposals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProposals(data));
  }, []);

  const vote = async (proposalId, choice) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      // `http://localhost:5000/api/proposals/${proposalId}/vote`,
      `${API_URL}/api/proposals/${proposalId}/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vote: choice,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    setProposals(
      proposals.map((proposal) =>
        proposal._id === data._id ? data : proposal
      )
    );
  };

  return (
    <div>
      <h2>Committee Proposals</h2>

      {proposals.map((proposal) => (
        <div key={proposal._id}>
          <h3>{proposal.title}</h3>

          <p>{proposal.description}</p>

          <p>Type: {proposal.type}</p>

          <button onClick={() => vote(proposal._id, "Yes")}>
            Yes
          </button>

          <button onClick={() => vote(proposal._id, "No")}>
            No
          </button>

          <p>
            Yes:{" "}
            {proposal.votes.filter((v) => v.vote === "Yes").length}
          </p>

          <p>
            No:{" "}
            {proposal.votes.filter((v) => v.vote === "No").length}
          </p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Proposal;