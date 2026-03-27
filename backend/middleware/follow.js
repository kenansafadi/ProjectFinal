const User = require('../model/usersModel'); 
module.exports = async (req, res, next) => {
    const { followId } = req.body;
    const currentUserId = req.user.id;

    if (!followId) {
        return res.status(400).json({ message: "Missing followId" });
    }

    if (currentUserId.toString() === followId.toString()) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    next(); // המשך לבקרת העוקב או לאמצעי הבא אם כל הבדיקות עברו בהצלחה
};
