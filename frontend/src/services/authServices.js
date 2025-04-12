import API_BASE_URL from "../utils/api";
import { getToken, setToken } from "../utils/jwtHelper"; // Importing token helper functions

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();

        // Save the token in cookies
        if (data.token) {
            setToken(data.token); // Save token if login is successful

            console.log("Token:", data.token);

        }

        return data; // Return user data
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

// Forgot password request
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to send password reset link");
        }

        return data.message || "Password reset link sent to your email.";
    } catch (error) {
        console.error("Forgot password error:", error);
        throw error;
    }
};

// Reset password request
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword }), // no token in body anymore
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to reset password.");
        }

        return data.message || "Password reset successfully.";
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
};

// Register new user
export const registerUser = async (userData) => {
    try {
        const token = getToken(); // Retrieve token from cookies if present
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "", // Send token if it exists
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json(); // Parse the response as JSON

        if (!response.ok) {
            // Log the server response in case of error
            console.error("Registration failed. Server response:", data);
            throw new Error(data.message || "Registration failed.");
        }

        console.log("Token:", data.token);  // Now that data is available, you can safely log it

        return data.message || "Registration successful.";
    } catch (error) {
        // Log the complete error to see if any additional information is available
        console.error("Registration error:", error);
        throw error;
    }
};
// Verify email using token
export const verifyEmail = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
            method: "GET",
        });

        const data = await response.text(); // As it's just a simple text response
        if (!response.ok) {
            throw new Error(data || "Failed to verify email.");
        }

        return data || "Email verified successfully.";
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
};
