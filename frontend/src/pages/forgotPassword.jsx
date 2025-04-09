import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/forgotPassword.scss"; // Import SCSS styles
import { forgotPassword } from "../services/authServices";
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigate instead of useHistory

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true); // Start loading state
        setError(""); // Clear previous errors
        setSuccess(""); // Clear previous success messages

        try {
            // Make the API call to the backend to send the reset password email
            const message = await forgotPassword(email);

            // If successful, set the success message
            setSuccess(message);

            // After 3 seconds, navigate to the login page
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            // If there's an error, catch it and display the error message
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            // Once done (whether successful or not), stop the loading state
            setLoading(false);
        }
    };


    return (
        <div className="forgot-password-container">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
