// src/components/context/PostContext.jsx
import { createContext, useState, useEffect } from "react";
import { fetchPosts, likePost, sharePost, addComment } from "../../services/postServices"; // Include addComment service

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const data = await fetchPosts(); // Fetch posts from API
                setPosts(data);
            } catch (err) {
                setError("Failed to load posts", err);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    const handleLike = async (postId) => {
        try {
            const updatedPost = await likePost(postId); // Get the full updated post object
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? updatedPost : post
                )
            );
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };


    const handleShare = async (postId) => {
        try {
            await sharePost(postId); // still register share action on server

            const shareUrl = `${window.location.origin}/posts/${postId}`;
            return shareUrl;
        } catch (err) {
            console.error("Error sharing post:", err);
            return null;
        }
    };


    const handleAddComment = async (postId, commentText) => {
        try {
            const response = await addComment(postId, commentText);
            // Update the post with the new comment
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { ...post, comments: [...post.comments, response.comment] } // Add the new comment to the post
                        : post
                )
            );
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    return (
        <PostContext.Provider
            value={{
                posts,
                loading,
                error,
                handleLike,
                handleShare,
                handleAddComment, // Provide the handleAddComment function to the components
            }}
        >
            {children}
        </PostContext.Provider>
    );
};

export default PostContext;
