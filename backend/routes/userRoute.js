const express = require("express");
const authMiddleware = require("../middleware/auth");
const followMiddleware = require("../middleware/follow");
const {
    getCurrentUserProfile,
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    updateBusinessStatus,
    deleteUser,
    followUser,
    unfollowUser,
} = require("../controllers/userController");

const router = express.Router();

// Apply auth middleware to all routes below
router.use(authMiddleware);

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

// --- Follow/Unfollow ---
router.post("/follow", followMiddleware, followUser);
router.post("/unfollow/:id", unfollowUser);

// --- Profile Actions ---
router.get("/me", getCurrentUserProfile); // Get authenticated user's profile
router.get("/", adminMiddleware, getAllUsers); // Admin: Get all users
router.get("/:id", getUserProfile); // Public: Get user by ID

router.put("/:id", updateUserProfile); // User/Admin: Update profile
router.patch("/:id", updateBusinessStatus); // Update isBusiness
router.delete("/:id", adminMiddleware, deleteUser); // Admin: Delete user

module.exports = router;
