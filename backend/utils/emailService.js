const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// OAuth2 credentials (you can store these in environment variables for better security)
const { CLIENT_ID, CLIENT_SECRET, GOOGLE_CALLBACK_URL, REFRESH_TOKEN } = process.env;

/**
 * Sends a password reset email to the specified email address.
 * 
 * @param {Object} emailConfig - Configuration for the email service.
 * @param {string} emailConfig.user - The sender's email address.
 * @param {string} email - The recipient's email address.
 * @param {string} resetLink - The password reset link.
 * @returns {Promise} - Resolves when the email is sent successfully, rejects if there is an error.
 */
const sendResetEmail = async (emailConfig, email, resetLink) => {
    try {
        // Set up OAuth2 authentication for Gmail
        const oAuth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            GOOGLE_CALLBACK_URL
        );

        oAuth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN,
        });

        // Get the access token
        const accessToken = await oAuth2Client.getAccessToken();

        // Create a transporter with OAuth2 configuration
        const transporter = nodemailer.createTransport({
            service: "gmail",  // Gmail service
            auth: {
                type: "OAuth2",
                user: emailConfig.user,  // Sender's email
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,  // OAuth2 access token
            },
        });

        // Construct the email content
        const mailOptions = {
            from: emailConfig.user,  // Sender's email
            to: email,  // Recipient's email
            subject: "Password Reset Request",
            html: `
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">${resetLink}</a>
                <p>If you did not request this, please ignore this email.</p>
            `,  // HTML content
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send password reset email.");
    }
};

module.exports = { sendResetEmail };
