// src/components/Feed/Comment.jsx
import React, { useState } from "react";
import { addComment } from "../../services/postServices"; // Assuming you have a service function to add comments
import usePost from "../hooks/usePost";

const Comment = ({ postId }) => {
    const { posts, setPosts } = usePost(); // Assuming you have a way to update posts in the context
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (newComment.trim() === "") return;

        setIsSubmitting(true);
        try {
            const response = await addComment(postId, newComment);
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { ...post, comments: [...post.comments, response.comment] }
                        : post
                )
            );
            setNewComment("");
        } catch (err) {
            console.error("Failed to add comment:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="comment-section">
            <h4>Comments</h4>
            <div className="comments-list">
                {posts
                    .find((post) => post.id === postId)
                    ?.comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <p>{comment.author}: {comment.text}</p>
                        </div>
                    ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment..."
                    rows={3}
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Comment"}
                </button>
            </form>
        </div>
    );
};

export default Comment;
