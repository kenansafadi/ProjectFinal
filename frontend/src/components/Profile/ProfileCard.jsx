// src/components/Profile/ProfileCard.jsx
import React from "react";
import useProfile from "../hooks/useProfile";
import FollowButton from "./FollowButton";
import { CircleLoader } from "react-spinners";
import { useEffect } from "react";
const ProfileCard = ({ isOwnProfile }) => {
    const { profile, loading, loadProfile } = useProfile();

    useEffect(() => {
        loadProfile(); // Loads current user's profile
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <CircleLoader color="#00BFFF" size={80} />
            </div>
        );
    } if (!profile) return <p>Profile not found or not logged in.</p>;

    return (
        <div className="profile-card">
            <div className="cover-image">
                <img src={profile.coverImage || "/default-cover.jpg"} alt="Cover" />
            </div>
            <div className="profile-info">
                <img className="profile-pic" src={profile.avatar || "/default-avatar.jpg"} alt="Avatar" />
                <h2>{profile.name}</h2>
                <p>{profile.bio}</p>
                <p>Followers: {profile.followers.length}</p>
                <p>Following: {profile.following.length}</p>

                {!isOwnProfile ? <FollowButton userId={profile._id} /> : null}
            </div>
        </div>
    );
};

export default ProfileCard;
