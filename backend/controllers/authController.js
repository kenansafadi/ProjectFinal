const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Auth } = require('../model/authModel');
const { User } = require('../model/usersModel');
const { Registry } = require('../model/registryModel');
const { hashPassword, verifyPassword, generateToken } = require('../utils/index');
const {
   sendResetEmail,
   sendEmail,
   verification_template,
   registration_template,
} = require('../utils/emailService');

const registerUser = async (userData) => {
   try {
      const existingUser = await User.findOne({ email: userData.email });
      console.log(existingUser);

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

      const verificationLink = `${process.env.FRONTEND_API_URL}/verify-account?code=${verificationCode}&email=${userData.email}`;

      if (existingUser && existingUser.isVerified === false) {
         await sendEmail(
            userData.email,
            'Account Verification',
            verification_template(userData.username, verificationLink)
         );
         await User.findOneAndUpdate(
            { email: userData.email },
            { verificationCode, verificationExpiry }
         );
         throw { message: 'Account verification required', status: 400 };
      }

      if (existingUser) {
         throw { message: 'User already registered.', status: 400 };
      }

      const finalPassword = await hashPassword(userData.password);

      const user = new User({
         email: userData.email,
         username: userData.username,
         password: finalPassword,
         verificationCode,
         verificationExpiry,
         isVerified: false,
      });

      await user.save();

      console.log(verificationLink);

      await sendEmail(
         userData.email,
         'Account Register',
         registration_template(userData.username, verificationLink)
      );

      return { message: 'Registration successful', status: 200 };
   } catch (error) {
      console.log(error);
      throw error;
   }
};

const verify_account = async (payload) => {
   const { email, verificationCode } = payload;

   try {
      const user = await User.findOne({ email });

      if (!user) {
         throw { message: 'User not found.', status: 400 };
      }

      if (user.verificationExpiry < Date.now()) {
         throw { message: 'Code has expired', status: 400 };
      }

      if (user.isVerified) {
         throw { message: 'Account already verified.', status: 400 };
      }

      if (user.verificationCode !== verificationCode) {
         throw { message: 'Code is invalid.', status: 400 };
      }

      // Verify the account
      user.isVerified = true; // Assuming you have an isVerified field
      await user.save();

      return { message: 'Account verified successfully!', status: 200 };
   } catch (error) {
      throw error;
   }
};

// Controller for user login
const loginUser = async (email, password) => {
   try {
      const user = await User.findOne({ email });
      if (!user) {
         throw { message: 'Invalid email or password.', status: 400 };
      }

      if (!user.isVerified) {
         throw { message: 'Account verification required', status: 400 };
      }

      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
         throw { message: 'Invalid email or password.', status: 400 };
      }

      const userData = {
         email: user.email,
         username: user.username,
         id: user._id,
      };

      const token = generateToken(userData);

      return {
         data: {
            token,
            user: userData,
         },
         status: 200,
      };
   } catch (error) {
      throw error;
   }
};

// Forgot Password Controller
const forgotPassword = async (email) => {
   // Check if user exists
   const user = await User.findOne({ email });
   if (!user) throw new Error('User not found');

   // Generate a password reset token (valid for 1 hour)
   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

   // Construct reset link
   const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

   // Send reset email
   await sendResetEmail({ user: process.env.EMAIL_USER }, email, resetLink);

   return 'Password reset link sent to your email.';
};

// Reset Password Controller
const resetPassword = async (token, newPassword) => {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user = await User.findById(decoded.userId);
   if (!user) throw new Error('Invalid token');

   // Hash the new password before saving it
   user.password = await hashPassword(newPassword);
   await user.save();

   return 'Password updated successfully.';
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verify_account };
