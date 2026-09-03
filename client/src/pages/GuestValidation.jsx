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

            setSuccess("Guest visit confirmed. Entry has been recorded.");

        } catch (error) {
            setError(error.message);
        } finally {
            setConfirming(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-2xl mx-auto">

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Guest Validation
                </h1>

                <p className="text-gray-600 mb-6">
                    Verify the guest's information before allowing entry.
                </p>


                <div className="bg-white rounded-xl shadow-md p-6">

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}


                    <form
                        onSubmit={handleValidate}
                        className="space-y-5"
                    >

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Resident Name
                            </label>

                            <input
                                type="text"
                                name="residentName"
                                value={formData.residentName}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Flat Number
                            </label>

                            <input
                                type="text"
                                name="flatNumber"
                                value={formData.flatNumber}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Guest Phone Number
                            </label>

                            <input
                                type="tel"
                                name="guestPhone"
                                value={formData.guestPhone}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                                className="w-full border rounded-lg px-4 py-2 tracking-widest"
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading
                                ? "Checking..."
                                : "Validate Guest"}
                        </button>

                    </form>


                    {guest && (
                        <div className="mt-8 border-t pt-6">

                            <h2 className="text-xl font-semibold mb-4">
                                Guest Registration Found
                            </h2>


                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Guest Name
                                    </p>

                                    <p className="font-medium">
                                        {guest.guestName}
                                    </p>
                                </div>


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Guest Phone
                                    </p>

                                    <p className="font-medium">
                                        {guest.guestPhone}
                                    </p>
                                </div>


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Resident
                                    </p>

                                    <p className="font-medium">
                                        {guest.residentName}
                                    </p>
                                </div>


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Flat
                                    </p>

                                    <p className="font-medium">
                                        {guest.flatNumber}
                                    </p>
                                </div>


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Visit Date
                                    </p>

                                    <p className="font-medium">
                                        {new Date(
                                            guest.visitDate
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                            </div>


                            {!guest.checkedIn ? (
                                <button
                                    onClick={handleConfirm}
                                    disabled={confirming}
                                    className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {confirming
                                        ? "Confirming..."
                                        : "Confirm Guest Visit"}
                                </button>
                            ) : (
                                <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-lg text-center font-medium">
                                    Guest has already checked in.
                                </div>
                            )}

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default GuestValidation;