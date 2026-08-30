import { useEffect, useMemo, useState } from "react";

import { getFlats } from "../services/flatService";

const Flats = () => {

    const [flats, setFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [sortColumn, setSortColumn] = useState("flatNumber");
    const [sortDirection, setSortDirection] = useState("asc");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);


    const fetchFlats = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getFlats();

            setFlats(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchFlats();
    }, []);


    const filteredFlats = useMemo(() => {

        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) {
            return flats;
        }

        return flats.filter((flat) => {

            const residentNames = (flat.residents || [])
                .map((resident) => resident.username)
                .join(" ")
                .toLowerCase();

            return (
                flat.flatNumber?.toLowerCase().includes(searchTerm) ||
                flat.floor?.toLowerCase().includes(searchTerm) ||
                flat.state?.toLowerCase().includes(searchTerm) ||
                residentNames.includes(searchTerm)
            );
        });

    }, [flats, search]);


    const sortedFlats = useMemo(() => {

        const sorted = [...filteredFlats];

        sorted.sort((a, b) => {

            let valueA;
            let valueB;

            switch (sortColumn) {

                case "flatNumber":
                    valueA = a.flatNumber || "";
                    valueB = b.flatNumber || "";
                    break;

                case "floor":
                    valueA = a.floor || "";
                    valueB = b.floor || "";
                    break;

                case "state":
                    valueA = a.state || "";
                    valueB = b.state || "";
                    break;

                case "residents":
                    valueA = (a.residents || [])
                        .map((resident) => resident.username)
                        .join(", ");

                    valueB = (b.residents || [])
                        .map((resident) => resident.username)
                        .join(", ");

                    break;

                default:
                    valueA = "";
                    valueB = "";
            }


            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();

            if (sortColumn === "floor") {
                const numberA = parseInt(valueA, 10);
                const numberB = parseInt(valueB, 10);

                if (!isNaN(numberA) && !isNaN(numberB)) {
                    return sortDirection === "asc"
                        ? numberA - numberB
                        : numberB - numberA;
                }
            }


            if (sortColumn === "flatNumber") {

                const [floorA, letterA] = valueA.split("-");
                const [floorB, letterB] = valueB.split("-");

                const numberA = parseInt(floorA, 10);
                const numberB = parseInt(floorB, 10);

                if (!isNaN(numberA) && !isNaN(numberB)) {

                    if (numberA !== numberB) {
                        return sortDirection === "asc"
                            ? numberA - numberB
                            : numberB - numberA;
                    }

                    if (letterA !== letterB) {
                        return sortDirection === "asc"
                            ? letterA.localeCompare(letterB)
                            : letterB.localeCompare(letterA);
                    }

                    return 0;
                }
            }


            if (valueA < valueB) {
                return sortDirection === "asc" ? -1 : 1;
            }

            if (valueA > valueB) {
                return sortDirection === "asc" ? 1 : -1;
            }

            return 0;
        });

        return sorted;

    }, [filteredFlats, sortColumn, sortDirection]);



    const totalPages = Math.ceil(sortedFlats.length / pageSize);

    const paginatedFlats = useMemo(() => {

        const startIndex = (currentPage - 1) * pageSize;

        return sortedFlats.slice(
            startIndex,
            startIndex + pageSize
        );

    }, [sortedFlats, currentPage, pageSize]);


    useEffect(() => {
        setCurrentPage(1);
    }, [search, pageSize]);


    const handleSort = (column) => {

        if (sortColumn === column) {

            setSortDirection((previousDirection) =>
                previousDirection === "asc"
                    ? "desc"
                    : "asc"
            );

        } else {

            setSortColumn(column);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    };


    const getSortIndicator = (column) => {

        if (sortColumn !== column) {
            return "↕";
        }

        return sortDirection === "asc"
            ? "↑"
            : "↓";
    };


    const getResidentNames = (flat) => {

        if (flat.state !== "Occupied") {
            return "—";
        }

        if (!flat.residents || flat.residents.length === 0) {
            return "None";
        }

        return flat.residents
            .map((resident) => resident.username)
            .join(", ");
    };


    const goToPage = (page) => {

        if (page < 1 || page > totalPages) {
            return;
        }

        setCurrentPage(page);
    };


    const firstItem =
        sortedFlats.length === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const lastItem =
        Math.min(
            currentPage * pageSize,
            sortedFlats.length
        );


    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading flats...</p>
            </div>
        );
    }


    return (
        <div className="dashboard-page">

            <div>
                <h3>
                    View the flats and their current availability.
                </h3>
                <p></p>
            </div>


            <div className="panel-card">

                <div className="flats-header">

                    <h2>Flat Directory</h2>

                    <input
                        type="text"
                        placeholder="Search flats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>


                {error && (
                    <p className="form-message">
                        {error}
                    </p>
                )}


                {sortedFlats.length === 0 ? (

                    <p>No flats match your search.</p>

                ) : (

                    <>

                        <div className="flats-table-container">

                            <table className="flats-table">

                                <thead>
                                    <tr>

                                        <th
                                            onClick={() =>
                                                handleSort("flatNumber")
                                            }
                                        >
                                            Flat
                                            <span className="sort-indicator">
                                                {getSortIndicator("flatNumber")}
                                            </span>
                                        </th>


                                        <th
                                            onClick={() =>
                                                handleSort("floor")
                                            }
                                        >
                                            Floor
                                            <span className="sort-indicator">
                                                {getSortIndicator("floor")}
                                            </span>
                                        </th>


                                        <th
                                            onClick={() =>
                                                handleSort("state")
                                            }
                                        >
                                            State
                                            <span className="sort-indicator">
                                                {getSortIndicator("state")}
                                            </span>
                                        </th>


                                        <th
                                            onClick={() =>
                                                handleSort("residents")
                                            }
                                        >
                                            Resident(s)
                                            <span className="sort-indicator">
                                                {getSortIndicator("residents")}
                                            </span>
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>

                                    {paginatedFlats.map((flat) => (

                                        <tr key={flat._id}>

                                            <td>
                                                {flat.flatNumber}
                                            </td>

                                            <td>
                                                {flat.floor}
                                            </td>

                                            <td>
                                                {flat.state || "—"}
                                            </td>

                                            <td>
                                                {getResidentNames(flat)}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        <div className="flats-table-footer">

                            <div className="page-size">

                                <span>Page Size:</span>

                                <select
                                    value={pageSize}
                                    onChange={(e) =>
                                        setPageSize(
                                            Number(e.target.value)
                                        )
                                    }
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>

                            </div>


                            <div className="page-info">

                                {firstItem} to {lastItem} of{" "}
                                {sortedFlats.length}

                            </div>


                            <div className="pagination">

                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    |&lt;
                                </button>

                                <button
                                    onClick={() =>
                                        goToPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>


                                <span>
                                    Page {currentPage} of{" "}
                                    {totalPages}
                                </span>


                                <button
                                    onClick={() =>
                                        goToPage(currentPage + 1)
                                    }
                                    disabled={
                                        currentPage === totalPages
                                    }
                                >
                                    &gt;
                                </button>

                                <button
                                    onClick={() =>
                                        goToPage(totalPages)
                                    }
                                    disabled={
                                        currentPage === totalPages
                                    }
                                >
                                    &gt;|
                                </button>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </div>
    );
};

export default Flats;