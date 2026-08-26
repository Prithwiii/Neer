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
        <div>
            <h1>Intercom</h1>

            <form onSubmit={handleCall}>
                <input
                    type="email"
                    placeholder="Resident email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Calling..." : "Call"}
                </button>
            </form>

            {message && <p>{message}</p>}

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