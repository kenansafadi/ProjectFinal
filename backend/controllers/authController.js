const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth } = require("../model/authModel");
const { User } = require("../model/usersModel");
const generateToken = require("../utils/jwtHelper");
const { sendResetEmail } = require("../utils/emailService");

// Helper function to hash password
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};


// Controller for user registration
const registerUser = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error("User already registered.");

    const hashedPassword = await hashPassword(userData.password);

    const user = new User({
        ...userData,
        password: hashedPassword,
    });

    await user.save();

    // Create Auth record for login later
    const auth = new Auth({
        email: userData.email,
        password: hashedPassword,
    });
    await auth.save();
};

// Controller for user login
const loginUser = async (email, password) => {
    try {
        const auth = await Auth.findOne({ email });
        if (!auth) throw new Error("Invalid email or password.");

        const isMatch = await bcrypt.compare(password, auth.password);
        if (!isMatch) throw new Error("Invalid email or password.");

        // Generate and return JWT token on successful login
        const user = await User.findOne({ email });
        const token = generateToken(user);

        return { token, user };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Forgot Password Controller
const forgotPassword = async (email) => {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // Generate a password reset token (valid for 1 hour)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Construct reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send reset email
    await sendResetEmail({ user: process.env.EMAIL_USER }, email, resetLink);

    return "Password reset link sent to your email.";
};

// Reset Password Controller
const resetPassword = async (token, newPassword) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error("Invalid token");

    // Hash the new password before saving it
    user.password = await hashPassword(newPassword);
    await user.save();

    return "Password updated successfully.";
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };


