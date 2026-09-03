import { useState } from "react";

// The people who can see a family expense sheet. The owner gets the search box
// and the remove buttons, everyone else just sees who has access.
function FamilyMemberList({
    sheet,
    isOwner,
    currentUserId,
    searchMembers,
    onAdd,
    onRemove,
    busy
}) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [removeId, setRemoveId] = useState(null);

    const runSearch = async (event) => {
        event.preventDefault();

        try {
            setSearching(true);

            const found = await searchMembers(search.trim());

            setResults(found);
            setSearched(true);
        } finally {
            setSearching(false);
        }
    };

    const addMember = async (userId) => {
        await onAdd(userId);

        // the person just added is no longer available, drop them from the list
        setResults((current) => current.filter((item) => item._id !== userId));
    };

    const removeMember = async (userId) => {
        await onRemove(userId);
        setRemoveId(null);
    };

    const label = (person) =>
        `${person.username}${person.flatNumber ? ` (${person.flatNumber})` : ""}`;

    return (
        <div className="panel-card family-members">
            <h3>Family Members</h3>

            <ul className="member-list">
                <li className="member-row">
                    <span>
                        {label(sheet.owner)}
                        {sheet.owner._id === currentUserId && " — you"}
                    </span>

                    <span className="status-badge">Owner</span>
                </li>

                {sheet.members.map((member) => (
                    <li key={member._id} className="member-row">
                        <span>
                            {label(member)}
                            {member._id === currentUserId && " — you"}
                        </span>

                        <span className="member-row-actions">
                            <span className="status-badge">Member</span>

                            {isOwner && (
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setRemoveId(member._id)}
                                    disabled={busy}
                                >
                                    Remove
                                </button>
                            )}
                        </span>
                    </li>
                ))}
            </ul>

            {removeId && (
                <div className="confirm-box">
                    <p>
                        Are you sure you want to remove this member? They will lose
                        access to the sheet, but the expenses they added stay.
                    </p>

                    <button
                        type="button"
                        onClick={() => removeMember(removeId)}
                        disabled={busy}
                    >
                        Yes, Remove
                    </button>

                    <button
                        type="button"
                        className="secondary"
                        onClick={() => setRemoveId(null)}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {isOwner && (
                <div className="member-search">
                    <h4>Add a Family Member</h4>

                    <form onSubmit={runSearch} className="member-search-form">
                        <input
                            type="text"
                            placeholder="Search by name or flat number"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                        <button type="submit" disabled={searching}>
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </form>

                    {searched && results.length === 0 && (
                        <p>No matching residents were found.</p>
                    )}

                    {results.length > 0 && (
                        <ul className="member-list">
                            {results.map((person) => (
                                <li key={person._id} className="member-row">
                                    <span>{label(person)}</span>

                                    <button
                                        type="button"
                                        onClick={() => addMember(person._id)}
                                        disabled={busy}
                                    >
                                        Add
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default FamilyMemberList;
