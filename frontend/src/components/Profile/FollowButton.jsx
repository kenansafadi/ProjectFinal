// src/components/Profile/FollowButton.jsx
import React from "react";
import useFollow from "../hooks/useFollow";

const FollowButton = ({ userId }) => {
    const { following, handleFollow, handleUnfollow } = useFollow();

    const isFollowing = following.includes(userId);

    const toggleFollow = () => {
        if (isFollowing) {
            handleUnfollow(userId);
        } else {
            handleFollow(userId);
        }
    };

    return (
        <button onClick={toggleFollow}>
            {isFollowing ? "Unfollow" : "Follow"}
        </button>
    );
};

export default FollowButton;
