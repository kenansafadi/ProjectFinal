const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, verify_account } = require('../controllers/authController');
const { sendEmail, resetPassword_template } = require('../utils/emailService');
const { User } = require('../model/usersModel');
const { hashPassword } = require('../utils/index');

const {
   userValidationSchema,
   verificationValidationSchema,
   loginValidationSchema,
} = require('../model/usersModel');

router.post('/register', async (req, res) => {
   try {
      const { error } = userValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message, status: 400 });

      const result = await registerUser(req.body);
      res.status(201).json(result);
   } catch (err) {
      if (err.status) {
         return res.status(err.status).json({ message: err.message, status: err.status });
      }
      res.status(500).json({ message: 'Server Error', status: 500 });
   }
});

router.post('/verify', async (req, res) => {
   try {
      const { error } = verificationValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message, status: 400 });

      const result = await verify_account(req.body);
      res.status(201).json(result);
   } catch (err) {
      if (err.status) {
         return res.status(err.status).json({ message: err.message, status: err.status });
      }

      res.status(500).json({ message: 'Server Error', status: 500 });
   }
});

router.post('/login', async (req, res) => {
   try {
      const { email, password } = req.body;

      const { error } = loginValidationSchema.validate({ email, password });

      if (error) {
         return res.status(400).json({ message: error.details[0].message, status: 400 });
      }

      const result = await loginUser(email, password);
      res.status(201).json(result);
   } catch (err) {
      console.log(err);
      if (err.status) {
         return res.status(err.status).json({ message: err.message, status: err.status });
      }
      res.status(500).json({ message: 'Server Error', status: 500 });
   }
});

// גוגל אוטנטיקציה
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID);

router.post('/google', async (req, res) => {
   try {
      const { credential } = req.body;
      if (!credential) return res.status(400).json({ message: 'Missing Google credential', status: 400 });

      const ticket = await googleClient.verifyIdToken({
         idToken: credential,
         audience: process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
      });
      const { sub: googleId, email, name, picture } = ticket.getPayload();

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (user && !user.googleId) {
         // אם המשתמש קיים אך לא מקושר לגוגל, עדכן את הפרטים שלו
         user.googleId = googleId;
         user.authProvider = 'google';
         if (!user.profilePicture && picture) user.profilePicture = picture;
         user.isVerified = true;
         await user.save();
      } else if (!user) {
         user = new User({
            username: name || email.split('@')[0],
            email,
            googleId,
            authProvider: 'google',
            isVerified: true,
            profilePicture: picture || null,
         });
         await user.save();
      }

      const { generateToken } = require('../utils/index');
      const userData = { email: user.email, username: user.username, id: user._id, profilePicture: user.profilePicture };
      const token = generateToken(userData);

      res.status(200).json({ data: { token, user: userData }, status: 200 });
   } catch (err) {
      console.error('Google auth error:', err);
      res.status(401).json({ message: 'Google authentication failed', status: 401 });
   }
});

router.post('/forgot-password', async (req, res) => {
   try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 שעות

      const resetPasswordLink = `${process.env.FRONTEND_API_URL}/reset-password?verificationCode=${verificationCode}`;
      console.log(resetPasswordLink);

      await User.updateOne(
         { email },
         { $set: { verificationCode, verificationExpiry, resetPasswordLink } }
      );

      await sendEmail(
         email,
         'Reset Password',
         resetPassword_template(user.username, resetPasswordLink)
      );

      res.status(201).json({ message: 'Reset password link sent to email', status: 201 });
   } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: err.message || 'Server Error', status: 500 });
   }
});

router.post('/reset-password', async (req, res) => {
   try {
      const { verificationCode, password } = req.body;
      const user = await User.findOne({ verificationCode });

      if (!user) {
         return res.status(400).json({ message: 'Invalid verification code', status: 400 });
      }

      if (verificationCode != user.verificationCode) {
         return res.status(400).json({ message: 'Invalid verification code', status: 400 });
      }

      if (user.verificationExpiry < Date.now()) {
         return res.status(400).json({ message: 'Verification code expired', status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      await User.updateOne({ email: user.email }, { $set: { password: hashedPassword } });

      res.status(201).json({ message: 'Password reset successful', status: 201 });
   } catch (err) {
      console.log(err);
      res.status(400).json({ message: 'Server Error', status: 400 });
   }
});
module.exports = router;
