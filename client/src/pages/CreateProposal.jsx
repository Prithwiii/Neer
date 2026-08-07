import { useState } from "react";

function CreateProposal() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Budget Approval");

  const createProposal = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/proposals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        type,
      }),
    });

    const data = await response.json();

    console.log(data);

    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h2>Create Proposal</h2>

      <form onSubmit={createProposal}>
        <input
          type="text"
          placeholder="Proposal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Budget Approval</option>
          <option>Rule Change</option>
          <option>Vendor Selection</option>
        </select>

        <button type="submit">Create Proposal</button>
      </form>
    </div>
  );
}

export default CreateProposal;