import API_BASE_URL from "../utils/api";

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

// ✅ Protected routes — token passed as parameter
export const likePost = async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to like the post");
    }

    return response.json();
};

export const sharePost = async (postId, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to share the post");
    }

    return response.json();
};

export const addComment = async (postId, commentText, token) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
    });

    if (!response.ok) {
        throw new Error("Failed to add comment");
    }

    return response.json();
};