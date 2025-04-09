import React, { useEffect } from "react";
import ProfileCard from "../components/Profile/ProfileCard";
import PostList from "../components/Feed/PostList";
import useProfile from "../components/hooks/useProfile";
import { useParams } from "react-router-dom";

const Profile = () => {
    const { userId } = useParams(); // grab from URL
    const { loadProfile, profile } = useProfile();

    const isOwnProfile = !userId || userId === profile?._id;

    useEffect(() => {
        loadProfile(userId || "me"); // or fetch from auth context
    }, [userId, loadProfile]); // Include loadProfile as a dependency here

    return (
        <div className="profile-page">
            <ProfileCard isOwnProfile={isOwnProfile} />

            {isOwnProfile && (
                <>
                    <hr />
                    <ProfileEditForm />
                </>
            )}

            <hr />
            <h3>{isOwnProfile ? "Your Posts" : `${profile?.name}'s Posts`}</h3>

            {profile?.posts && <PostList posts={profile.posts} />}
        </div>
    );
};

export default Profile;
