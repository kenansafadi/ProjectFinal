import { createContext, useState } from "react";
import {
    fetchCurrentUserProfile,
    fetchUserProfileById,
    updateUserProfile,
    deleteUser,
    updateBusinessStatus,
} from "../../services/profileServices";
import toast from "react-hot-toast";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (userId = null) => {
        try {
            setLoading(true);
            const data = userId
                ? await fetchUserProfileById(userId)
                : await fetchCurrentUserProfile();
            setProfile(data);
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (updatedData) => {
        try {
            const data = await updateUserProfile(updatedData);
            setProfile(data);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Failed to update profile.");
        }

    };


    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            toast.success("User deleted successfully.");
            // Optionally: clear profile state or redirect user
            setProfile(null);
        } catch (err) {
            console.error("Failed to delete user", err);
            toast.error("Failed to delete user.");
        }
    };

    const handleBusinessToggle = async (isBusiness) => {
        try {
            const data = await updateBusinessStatus(isBusiness);
            setProfile(data); // Update with new profile info
            toast.success(`Business status updated.`);
        } catch (err) {
            console.error("Failed to update business status", err);
            toast.error("Failed to update business status.");
        }
    };


    return (
        <ProfileContext.Provider value={{ profile, loading, loadProfile, handleUpdateProfile, handleBusinessToggle, handleDeleteUser }}>
            {children}
        </ProfileContext.Provider>
    );
};


export default ProfileContext;
