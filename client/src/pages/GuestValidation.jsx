import { useState } from "react";

import {
    validateGuest,
    confirmGuestVisit
} from "../services/guestService";


const GuestValidation = () => {

    const [formData, setFormData] = useState({
        residentName: "",
        flatNumber: "",
        guestPhone: "",
        passcode: ""
    });

    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleValidate = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setGuest(null);
        setLoading(true);

        try {
            const data = await validateGuest(formData);

            setGuest(data.guest);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleConfirm = async () => {

        if (!guest) return;

        setError("");
        setSuccess("");
        setConfirming(true);

        try {

            const data = await confirmGuestVisit(guest._id);

            setGuest({
                ...guest,
                checkedIn: true,
                checkedInAt: data.guest.checkedInAt
            });

            setSuccess(
                "Guest visit confirmed. Entry has been recorded."
            );

        } catch (error) {
            setError(error.message);
        } finally {
            setConfirming(false);
        }
    };


    return (
        <div className="dashboard-page nx guest-page guest-validation-page">
            <div className="dashboard-header guest-page-header">
                <div>
                    <p className="dash-section-kicker">Front desk services</p>
                    <h1>Guest validation</h1>
                    <p>Verify visitor details and record entry only after the information is confirmed.</p>
                </div>
            </div>


            <section className="panel-card guest-form-panel">
                    <div className="guest-form-heading">
                        <h2>Find a guest registration</h2>
                        <p>Use the resident details, phone number, and one-time passcode provided by the visitor.</p>
                    </div>


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


                    <form onSubmit={handleValidate} className="guest-form">

                        <div className="guest-field-grid">

                            {/* Resident Name */}
                            <div className="guest-form-field">
                                <label htmlFor="validation-resident-name">Resident name</label>

                                <input
                                    id="validation-resident-name"
                                    type="text"
                                    name="residentName"
                                    value={formData.residentName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter resident name"
                                />
                            </div>


                            {/* Flat Number */}
                            <div className="guest-form-field">
                                <label htmlFor="validation-flat-number">Flat number</label>

                                <input
                                    id="validation-flat-number"
                                    type="text"
                                    name="flatNumber"
                                    value={formData.flatNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 5-A"
                                />
                            </div>


                            {/* Guest Phone */}
                            <div className="guest-form-field">
                                <label htmlFor="validation-guest-phone">Guest phone number</label>

                                <input
                                    id="validation-guest-phone"
                                    type="tel"
                                    name="guestPhone"
                                    value={formData.guestPhone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter guest phone"
                                />
                            </div>


                            {/* Passcode */}
                            <div className="guest-form-field">
                                <label htmlFor="validation-passcode">One-time passcode</label>

                                <input
                                    id="validation-passcode"
                                    type="text"
                                    name="passcode"
                                    value={formData.passcode}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    inputMode="numeric"
                                    placeholder="6-digit passcode"
                                />
                            </div>

                        </div>


                        <button type="submit" disabled={loading}>
                            {loading
                                ? "Checking..."
                                : "Validate guest"}
                        </button>

                    </form>

            </section>


                {/* Guest Details Card */}
                {guest && (
                    <section className="panel-card guest-details-card">

                        {/* Card Header */}
                        <div className="guest-details-header">
                            <div>
                                <p className="dash-section-kicker">Registration verified</p>
                                <h2>Guest details</h2>
                                <p>Review the information before recording entry.</p>
                            </div>

                            <div>
                                    {guest.checkedIn ? (
                                        <span className="status-badge guest-checked-in">
                                            Checked in
                                        </span>
                                    ) : (
                                        <span className="status-badge guest-not-checked-in">
                                            Not checked in
                                        </span>
                                    )}
                            </div>
                        </div>


                        {/* Guest Information */}
                        <div className="guest-details-body">
                            <div className="guest-details-grid">

                                {/* Guest Name */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Guest name</p>
                                    <p className="guest-detail-value">
                                        {guest.guestName}
                                    </p>
                                </div>


                                {/* Guest Phone */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Phone number</p>
                                    <p className="guest-detail-value">
                                        {guest.guestPhone}
                                    </p>
                                </div>


                                {/* Resident */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Visiting resident</p>
                                    <p className="guest-detail-value">
                                        {guest.residentName}
                                    </p>
                                </div>


                                {/* Flat */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Flat number</p>
                                    <p className="guest-detail-value">
                                        {guest.flatNumber}
                                    </p>
                                </div>


                                {/* Visit Date */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Visit date</p>
                                    <p className="guest-detail-value">
                                        {new Date(
                                            guest.visitDate
                                        ).toLocaleDateString()}
                                    </p>
                                </div>


                                {/* Registration ID */}
                                <div className="guest-detail-item">
                                    <p className="guest-detail-label">Registration ID</p>
                                    <p className="guest-detail-value guest-detail-id">
                                        {guest._id}
                                    </p>
                                </div>

                            </div>


                            {/* Confirmation */}
                            {!guest.checkedIn ? (

                                <div className="guest-confirmation">

                                    <div className="guest-warning">
                                        <p><strong>Important:</strong> Verify the guest&apos;s identity manually before confirming entry.</p>
                                    </div>


                                    <button onClick={handleConfirm} disabled={confirming}>
                                        {confirming
                                            ? "Confirming guest visit..."
                                            : "Confirm guest visit"}
                                    </button>

                                </div>

                            ) : (

                                <div className="guest-confirmed-state">
                                    <span className="guest-confirmed-icon" aria-hidden="true">✓</span>

                                    <div>
                                        <p><strong>Guest visit confirmed</strong></p>

                                        {guest.checkedInAt && (
                                            <p>
                                                    Entry recorded at{" "}
                                                    {new Date(
                                                        guest.checkedInAt
                                                    ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                            )}

                        </div>
                    </section>
                )}

        </div>
    );
};

export default GuestValidation;
