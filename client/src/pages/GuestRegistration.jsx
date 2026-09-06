import { useState } from "react";
import { registerGuest } from "../services/guestService";

const GuestRegistration = () => {

    const [formData, setFormData] = useState({
        residentName: "",
        flatNumber: "",
        visitDate: "",
        guestName: "",
        guestPhone: ""
    });

    const [passcode, setPasscode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setPasscode("");
        setLoading(true);

        try {
            const data = await registerGuest(formData);

            setPasscode(data.passcode);

            setSuccess(
                "Guest registered successfully. Give this passcode to the visitor."
            );

            setFormData({
                residentName: "",
                flatNumber: "",
                visitDate: "",
                guestName: "",
                guestPhone: ""
            });

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="dashboard-page nx guest-page guest-registration-page">
            <div className="dashboard-header guest-page-header">
                <div>
                    <p className="dash-section-kicker">Front desk services</p>
                    <h1>Guest registration</h1>
                    <p>Register a resident&apos;s visitor and generate a one-time entry passcode.</p>
                </div>
            </div>

            <section className="panel-card guest-form-panel">

                    {error && (
                        <div className="form-message error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="form-message success-message">
                            {success}
                        </div>
                    )}


                    {passcode && (
                        <div className="guest-passcode">
                            <p className="guest-passcode-label">One-time guest passcode</p>
                            <p className="guest-passcode-value">
                                {passcode}
                            </p>
                            <p className="guest-passcode-note">Share this code with the visitor. It can only be used once.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="guest-form">

                        <div className="guest-form-heading">
                            <h2>Visitor details</h2>
                            <p>Enter the resident and visitor information for the expected visit.</p>
                        </div>

                        <div className="guest-form-field">
                            <label htmlFor="guest-resident-name">Resident name</label>

                            <input
                                id="guest-resident-name"
                                type="text"
                                name="residentName"
                                value={formData.residentName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="guest-form-field">
                            <label htmlFor="guest-flat-number">Flat number</label>

                            <input
                                id="guest-flat-number"
                                type="text"
                                name="flatNumber"
                                value={formData.flatNumber}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 5-A"
                            />
                        </div>

                        <div className="guest-form-field">
                            <label htmlFor="guest-visit-date">Visit date</label>

                            <input
                                id="guest-visit-date"
                                type="date"
                                name="visitDate"
                                value={formData.visitDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="guest-form-field">
                            <label htmlFor="guest-name">Guest name</label>

                            <input
                                id="guest-name"
                                type="text"
                                name="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="guest-form-field">
                            <label htmlFor="guest-phone">Guest phone number</label>

                            <input
                                id="guest-phone"
                                type="tel"
                                name="guestPhone"
                                value={formData.guestPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading
                                ? "Registering..."
                                : "Register guest"}
                        </button>

                    </form>
            </section>
        </div>
    );
};

export default GuestRegistration;