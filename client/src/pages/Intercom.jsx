import { useState } from "react";
import { startIntercomCall } from "../services/intercomService";
import IntercomCall from "../components/IntercomCall";

const Intercom = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [callData, setCallData] = useState(null);

    const handleCall = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const data = await startIntercomCall(email);

            setCallData(data);
            setMessage("Calling resident...");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page nx intercom-page">
            <div className="dashboard-header intercom-header">
                <div>
                    <p className="dash-section-kicker">Building communications</p>
                    <h1>Intercom</h1>
                    <p>Reach a resident directly through the building intercom.</p>
                </div>
            </div>

            <section className="panel-card intercom-panel">
                <div className="intercom-panel-heading">
                    <div>
                        <h2>Start a call</h2>
                        <p>Enter the resident email registered with NEER.</p>
                    </div>
                    <span className="intercom-panel-icon" aria-hidden="true">◉</span>
                </div>

                <form className="intercom-call-form" onSubmit={handleCall}>
                    <label htmlFor="resident-email">Resident email</label>
                    <div className="intercom-search-row">
                        <input
                            id="resident-email"
                            type="email"
                            placeholder="resident@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Calling..." : "Start call"}
                        </button>
                    </div>
                </form>

                {message && <p className={`form-message ${callData ? "success-message" : "error-message"}`}>{message}</p>}
            </section>

            {callData && (
                <IntercomCall 
                    callData = {callData}
                    onEndCall = {() => {setCallData(null);
                                        setMessage("");
                    }}
                />
            )}
        </div>
    );
};

export default Intercom;