// src/services/postServices.js
import API_BASE_URL from "../utils/api";
import { getToken } from "../utils/jwtHelper";

// Helper function to attach headers with token
const authHeaders = () => {
    const token = getToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// ✅ Public route
export const fetchPosts = async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return response.json();
};

// ✅ Protected route
export const likePost = async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to like the post");
    }

    return response.json();
};

// ✅ Protected route
export const sharePost = async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to share the post");
    }

    return response.json();
};

// ✅ Protected route
export const addComment = async (postId, commentText) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ text: commentText }),
    });

    if (!response.ok) {
        throw new Error("Failed to add comment");
    }

    return response.json();
};
