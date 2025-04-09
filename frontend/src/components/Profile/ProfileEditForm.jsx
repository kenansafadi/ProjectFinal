// src/components/Profile/ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import useProfile from "../hooks/useProfile";

const ProfileEditForm = () => {
    const { profile, handleUpdateProfile, loading } = useProfile();

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        avatar: "",
        coverImage: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                bio: profile.bio || "",
                avatar: profile.avatar || "",
                coverImage: profile.coverImage || "",
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdateProfile(formData);
    };

    return (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
            <h2>Edit Profile</h2>

            <label>
                Name:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Bio:
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                />
            </label>

            <label>
                Avatar URL:
                <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                />
            </label>

            <label>
                Cover Image URL:
                <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                />
            </label>

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
};

export default ProfileEditForm;
