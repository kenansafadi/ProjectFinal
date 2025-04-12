import { createContext, useState } from "react";
import { followUser, unfollowUser } from "../../services/profileServices";
import toast from "react-hot-toast";
const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
    const [following, setFollowing] = useState([]);

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
            setFollowing((prev) => [...prev, userId]);
            toast.success("You are now following this user!");

        } catch (err) {
            console.error("Follow error:", err);
            toast.error("Failed to follow the user.");

        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await unfollowUser(userId);
            setFollowing((prev) => prev.filter((id) => id !== userId));
            toast.success("You have unfollowed this user."); // ✅ success toast here

        } catch (err) {
            console.error("Unfollow error:", err);
            toast.error("Unfollow failed."); // ❌ error only on failure

        }
    };

    return (
        <FollowContext.Provider value={{ following, handleFollow, handleUnfollow }}>
            {children}
        </FollowContext.Provider>
    );
};

export default FollowContext;
