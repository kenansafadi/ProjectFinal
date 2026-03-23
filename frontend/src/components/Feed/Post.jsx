// src/components/Feed/Post.jsx
import React from "react";
import LikeButton from "./LikeButton";
import Comment from "./Comment";
import ShareButton from "./ShareButton";
import usePost from "../hooks/usePost";
const Post = ({ post }) => {
    // Use the usePost hook to get context values and functions
    const { handleLike, handleShare } = usePost();

    return (
        <div className="post">
            <div className="post-header">
                <h3>{post.title}</h3>
                <p>{post.author}</p>
                <p>{post.date}</p>
            </div>
            <div className="post-content">
                <p>{post.content}</p>
                {post.image && <img src={post.image} alt="Post content" />}
            </div>
            <div className="post-actions">
                <LikeButton onClick={() => handleLike(post.id)} />
                <Comment postId={post.id} />
                <ShareButton getShareUrl={() => handleShare(post.id)} />

            </div>
        </div>
    );
};

export default Post;
