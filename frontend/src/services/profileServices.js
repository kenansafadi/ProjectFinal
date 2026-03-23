import API_BASE_URL from "../utils/api";

// ✅ pass token as argument
export const fetchCurrentUserProfile = async (token) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }

    return response.json();
};

export const fetchUserProfileById = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user profile by ID");
    }

    return response.json();
};

export const followUser = async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/users/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ followId: userId }),
    });

    if (!response.ok) {
        throw new Error("Failed to follow/unfollow user");
    }

    return response.json();
};

export const unfollowUser = async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/users/unfollow/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to unfollow user");
    }

    return response.json();
};

export const updateUserProfile = async (updatedData, token) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error("Failed to update user profile");
    }

    return response.json();
};

export const updateBusinessStatus = async (isBusiness, token) => {
    const response = await fetch(`${API_BASE_URL}/users/me/business-status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ isBusiness }),
    });

    if (!response.ok) {
        throw new Error("Failed to update business status");
    }

    return response.json();
};

export const deleteUser = async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to delete user");
    }

    return response.json();
};