const User = require('../model/usersModel'); // Assuming you have a User model with a 'following' array
// followMiddleware.js
module.exports = async (req, res, next) => {
    const { followId } = req.body;
    const currentUserId = req.user.id;

    if (!followId) {
        return res.status(400).json({ message: "Missing followId" });
    }

    if (currentUserId.toString() === followId.toString()) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    next(); // Pass control to the controller
};
