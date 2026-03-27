
const User = require('../model/usersModel');
const io = require('socket.io');  
const { createNotification } = require("../controllers/notificationController");

const getCurrentUserProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId)
            .select("-password")
            .lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    try {
        const users = await User.find()
            .select("username email isBusiness createdAt")
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBusinessStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBusiness = req.body.isBusiness ?? user.isBusiness;

        await user.save();
        res.status(200).json({ message: "Business status updated", isBusiness: user.isBusiness });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// לקבל פרופיל משתמש לפי מזהה עם אפשרות להגבלת מספר העוקבים והעוקבים המוצגים
const getUserProfile = async (req, res) => {
    const userId = req.params.id;
    const followersLimit = parseInt(req.query.followersLimit) || 10;
    const followingLimit = parseInt(req.query.followingLimit) || 10;

    try {
        const user = await User.findById(userId)
            .select("-password")
            .lean(); // להשתמש ב-lean() כדי לקבל אובייקט פשוט ולא מסמך Mongoose
        if (!user) return res.status(404).json({ message: "User not found" });

        //לעדכן את מספר העוקבים והעוקבים המוצגים בפרופיל
        const followers = await User.find({ _id: { $in: user.followers } })
            .select("username avatar bio")
            .limit(followersLimit)
            .lean();

        
        const following = await User.find({ _id: { $in: user.following } })
            .select("username avatar bio")
            .limit(followingLimit)
            .lean();

        res.status(200).json({
            ...user,
            followers,
            following,
            meta: {
                totalFollowers: user.followers.length,
                totalFollowing: user.following.length,
                followersDisplayed: followers.length,
                followingDisplayed: following.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// עדכון פרופיל משתמש עם אפשרות לעדכון שם משתמש, אימייל וביו
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        //  לעדכן רק את השדות שנשלחו בבקשה, ולהשאיר את השאר ללא שינוי
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio || user.bio;

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.body.followId);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });

        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save();
            await userToFollow.save();

            await createNotification(userToFollow._id, `${currentUser.username} followed you`);

            // שליחת התראה בזמן אמת למשתמש שעוקבים אחריו באמצעות Socket.IO
            io.to(userToFollow._id.toString()).emit("receiveNotification", {
                message: `${currentUser.username} followed you.`,
                link: `/profile/${currentUser._id}`
            });
        }

        res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow || !currentUser) return res.status(404).json({ message: "User not found" });

        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

        await currentUser.save();
        await userToUnfollow.save();

        res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    getCurrentUserProfile,
    getAllUsers,
    updateUserProfile,
    updateBusinessStatus,
    deleteUser,
    followUser,
    unfollowUser,
};