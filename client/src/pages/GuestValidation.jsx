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
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-3xl mx-auto">

                {/* Page Header */}
                <div className="mb-6">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Guest Validation
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Verify the guest's information before allowing entry.
                    </p>

                </div>


                {/* Validation Form */}
                <div className="bg-white rounded-xl shadow-md p-6">

                    <h2 className="text-xl font-semibold text-gray-800 mb-5">
                        Enter Guest Information
                    </h2>


                    {error && (
                        <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-5">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-lg mb-5">
                            {success}
                        </div>
                    )}


                    <form
                        onSubmit={handleValidate}
                        className="space-y-5"
                    >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Resident Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resident Name
                                </label>

                                <input
                                    type="text"
                                    name="residentName"
                                    value={formData.residentName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resident name"
                                />
                            </div>


                            {/* Flat Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Flat Number
                                </label>

                                <input
                                    type="text"
                                    name="flatNumber"
                                    value={formData.flatNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter flat number"
                                />
                            </div>


                            {/* Guest Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guest Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="guestPhone"
                                    value={formData.guestPhone}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter guest phone"
                                />
                            </div>


                            {/* Passcode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    One-Time Passcode
                                </label>

                                <input
                                    type="text"
                                    name="passcode"
                                    value={formData.passcode}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    inputMode="numeric"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="6-digit passcode"
                                />
                            </div>

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading
                                ? "Checking..."
                                : "Validate Guest"}
                        </button>

                    </form>

                </div>


                {/* Guest Details Card */}
                {guest && (
                    <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">

                        {/* Card Header */}
                        <div className="bg-blue-600 px-6 py-4">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Guest Details
                                    </h2>

                                    <p className="text-blue-100 text-sm mt-1">
                                        Registration verified successfully
                                    </p>
                                </div>


                                {/* Status */}
                                <div>
                                    {guest.checkedIn ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                            Checked In
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                                            Not Checked In
                                        </span>
                                    )}
                                </div>

                            </div>

                        </div>


                        {/* Guest Information */}
                        <div className="p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Guest Name */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Guest Name
                                    </p>

                                    <p className="text-lg font-semibold text-gray-800">
                                        {guest.guestName}
                                    </p>
                                </div>


                                {/* Guest Phone */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Phone Number
                                    </p>

                                    <p className="text-lg font-semibold text-gray-800">
                                        {guest.guestPhone}
                                    </p>
                                </div>


                                {/* Resident */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Visiting Resident
                                    </p>

                                    <p className="text-lg font-semibold text-gray-800">
                                        {guest.residentName}
                                    </p>
                                </div>


                                {/* Flat */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Flat Number
                                    </p>

                                    <p className="text-lg font-semibold text-gray-800">
                                        {guest.flatNumber}
                                    </p>
                                </div>


                                {/* Visit Date */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Visit Date
                                    </p>

                                    <p className="text-lg font-semibold text-gray-800">
                                        {new Date(
                                            guest.visitDate
                                        ).toLocaleDateString()}
                                    </p>
                                </div>


                                {/* Registration ID */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Guest Registration ID
                                    </p>

                                    <p className="text-sm font-mono text-gray-800 break-all">
                                        {guest._id}
                                    </p>
                                </div>

                            </div>


                            {/* Confirmation */}
                            {!guest.checkedIn ? (

                                <div className="mt-6">

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            <span className="font-semibold">
                                                Important:
                                            </span>{" "}
                                            Verify the guest's identity
                                            manually before confirming entry.
                                        </p>
                                    </div>


                                    <button
                                        onClick={handleConfirm}
                                        disabled={confirming}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {confirming
                                            ? "Confirming Guest Visit..."
                                            : "Confirm Guest Visit"}
                                    </button>

                                </div>

                            ) : (

                                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <span className="text-green-600 text-xl">
                                                ✓
                                            </span>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-green-800">
                                                Guest Visit Confirmed
                                            </p>

                                            {guest.checkedInAt && (
                                                <p className="text-sm text-green-700">
                                                    Entry recorded at{" "}
                                                    {new Date(
                                                        guest.checkedInAt
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
};

export default GuestValidation;
