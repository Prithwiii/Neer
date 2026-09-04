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
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-2xl mx-auto">

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Guest Registration
                </h1>

                <p className="text-gray-600 mb-6">
                    Register a resident's visiting guest and generate a
                    one-time guest passcode.
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


                    {passcode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-center">

                            <p className="text-sm text-gray-600 mb-2">
                                One-Time Guest Passcode
                            </p>

                            <p className="text-4xl font-bold tracking-widest text-blue-700">
                                {passcode}
                            </p>

                            <p className="text-sm text-gray-500 mt-2">
                                This code can only be used once.
                            </p>

                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-5">

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
                                Visit Date
                            </label>

                            <input
                                type="date"
                                name="visitDate"
                                value={formData.visitDate}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Guest Name
                            </label>

                            <input
                                type="text"
                                name="guestName"
                                value={formData.guestName}
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


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading
                                ? "Registering..."
                                : "Register Guest"}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default GuestRegistration;