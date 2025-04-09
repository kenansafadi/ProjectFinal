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
        return data; // Return user data
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

// New function for forgot password
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

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const data = await response.text(); // Get the response as text first
            try {
                // Attempt to parse JSON if possible
                const jsonResponse = JSON.parse(data);
                throw new Error(jsonResponse.message || "Registration failed.");
            } catch (e) {
                throw new Error("Unknown error occurred.", e);
            }
        }

        const data = await response.json();
        return data.message || "Registration successful.";
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};
