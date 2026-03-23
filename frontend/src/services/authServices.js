import API_BASE_URL from "../utils/api";

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
        return data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

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

export const resetPassword = async (verificationCode, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verificationCode, password: newPassword }),
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

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        return data.message || "Registration successful.";
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
            method: "GET",
        });

        const data = await response.text();
        if (!response.ok) {
            throw new Error(data || "Failed to verify email.");
        }

        return data || "Email verified successfully.";
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
};
