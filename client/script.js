console.log("Script loaded");

const API = "http://localhost:5000/api/auth";
const PROPOSAL_API = "http://localhost:5000/api/proposals";

const output = document.getElementById("output");
const proposalSection = document.getElementById("proposalSection");
const proposalsList = document.getElementById("proposalsList");

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    if (token) {
        localStorage.setItem("token", token);
    }
}

function showSection() {
    const token = getToken();
    proposalSection.classList.toggle("hidden", !token);
}

async function register() {
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch(API + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 4);
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(API + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 4);

    if (data.token) {
        setToken(data.token);
        showSection();
        loadProposals();
    }
}

async function getProfile() {
    const token = getToken();
    if (!token) {
        output.textContent = "No token found. Please login first.";
        return;
    }

    const response = await fetch(API + "/profile", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 4);
}

function logout() {
    localStorage.removeItem("token");
    proposalSection.classList.add("hidden");
    proposalsList.innerHTML = "";
    output.textContent = "Logged out.";
}

function showProposals() {
    const token = getToken();
    if (!token) {
        alert("Please login first.");
        return;
    }
    proposalSection.classList.remove("hidden");
    loadProposals();
}

async function createProposal() {
    const title = document.getElementById("proposalTitle").value;
    const description = document.getElementById("proposalDescription").value;
    const type = document.getElementById("proposalType").value;
    const token = getToken();

    if (!token) {
        alert("Please login first.");
        return;
    }

    const response = await fetch(PROPOSAL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title, description, type }),
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 4);

    if (response.ok) {
        document.getElementById("proposalTitle").value = "";
        document.getElementById("proposalDescription").value = "";
        loadProposals();
    }
}

async function loadProposals() {
    const token = getToken();
    if (!token) {
        alert("Please login first.");
        return;
    }

    const response = await fetch(PROPOSAL_API, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    const data = await response.json();
    proposalsList.innerHTML = "";

    if (!response.ok) {
        output.textContent = JSON.stringify(data, null, 4);
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        proposalsList.innerHTML = "<p>No proposals available.</p>";
        return;
    }

    proposalsList.innerHTML = data
        .map((proposal) => {
            const yesVotes = proposal.votes.filter((v) => v.vote === "Yes").length;
            const noVotes = proposal.votes.filter((v) => v.vote === "No").length;
            return `
                <div class="proposal-item">
                    <h3>${proposal.title}</h3>
                    <p>${proposal.description}</p>
                    <p>Type: ${proposal.type}</p>
                    <p>Yes: ${yesVotes} | No: ${noVotes}</p>
                    <button onclick="voteProposal('${proposal._id}', 'Yes')">Yes</button>
                    <button onclick="voteProposal('${proposal._id}', 'No')">No</button>
                </div>
            `;
        })
        .join("\n");
}

async function voteProposal(proposalId, vote) {
    const token = getToken();
    if (!token) {
        alert("Please login first.");
        return;
    }

    const response = await fetch(`${PROPOSAL_API}/${proposalId}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ vote }),
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 4);

    if (response.ok) {
        loadProposals();
    }
}

showSection();
