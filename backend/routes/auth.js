const express = require("express");
const passport = require("../config/passport"); // Import passport config
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../controllers/authController");
const { sendResetEmail } = require("../utils/emailService");
const User = require("../model/usersModel");
const { userValidationSchema } = require("../model/usersModel"); // Import Joi schema
const { generateToken } = require('../utils/jwtHelper'); // Import generateToken from jwtHelper.js
const validator = require("validator");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, password, name, ...rest } = req.body;

    // Validate the email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate using Joi schema
    const { error } = userValidationSchema.validate({ username: name, email, password });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        // Use registerUser controller to handle registration logic
        await registerUser({ email, password, name });

        // Generate a verification token
        const verificationToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Send the verification email
        const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        await sendVerificationEmail(email, verificationLink);

        // Successful registration response
        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
        });
    } catch (err) {
        console.error("Error during registration:", err);

        // Ensure error response is in JSON format
        res.status(400).json({ message: "Registration failed. Please try again." });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate the email and password using Joi
    const { error } = userValidationSchema.validate({ email, password });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        // Use loginUser controller to handle the login logic
        const auth = await loginUser(email, password);
        const token = generateToken(auth);

        res.cookie("token", token, {
            httpOnly: true,    // Ensures the cookie can't be accessed by JavaScript
            secure: process.env.NODE_ENV === "production", // Set secure flag in production
            sameSite: "Strict", // Mitigates CSRF attacks
            maxAge: 3600 * 1000, // Cookie expires in 1 hour
        });

        res.status(200).send({ message: "Login successful" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(400).json({ message: err.message });
    }
});


// Google Login - Redirect to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const { user, token } = req.user;
        res.json({ message: "Google login successful", user, token });
    }
);

router.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the token from the cookie
    res.redirect("/"); // Redirect to the homepage
});
// Forgot Password (Send Reset Email)
router.post("/api/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate a password reset token (valid for 1 hour)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Construct reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Send email
        await sendResetEmail({ user: process.env.EMAIL_USER }, email, resetLink);

        res.json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Error sending password reset email." });
    }
});

router.post("/api/auth/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: "Invalid or expired token" });

        // Update password (Hash it before saving)
        user.password = await hashPassword(newPassword);
        await user.save();

        res.json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(400).json({ message: "Invalid or expired token." });
    }
});
router.get("/verify-email/:token", async (req, res) => {
    try {
        const { token } = req.params;

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Mark the user as verified
        user.verified = true;
        await user.save();

        res.status(200).send("Email verified successfully. You can now log in.");
    } catch (err) {
        res.status(400).send("Invalid or expired token.");
    }
});

module.exports = router;
