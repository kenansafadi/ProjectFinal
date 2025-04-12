// const mongoose = require('mongoose');
// const Joi = require('joi');

// // Define the Mongoose Registry Schema (only for registration)
// const userSchema = new mongoose.Schema(
//    {
//       username: { type: String, required: true },
//       email: { type: String, required: true, unique: true },
//       password: { type: String, required: true },
//       isVerified: { type: Boolean, default: false },
//       verificationCode: { type: String, default: null },
//       followers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
//       following: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
//       profilePicture: { type: String, default: null },
//    },
//    { timestamps: true }
// );

// // Define the Mongoose Registry Model
// const User = mongoose.model('User', userSchema);

// // Define the Joi schema for registration validation
// const registryValidationSchema = Joi.object({
//    username: Joi.string().min(3).max(30).required().messages({
//       'string.base': `"username" should be a type of 'text'`,
//       'string.empty': `"username" cannot be an empty field`,
//       'string.min': `"username" should have a minimum length of {#limit}`,
//       'any.required': `"username" is a required field`,
//    }),
//    email: Joi.string().email().required().messages({
//       'string.email': `"email" should be a valid email`,
//       'any.required': `"email" is a required field`,
//    }),
//    password: Joi.string().min(6).required().messages({
//       'string.base': `"password" should be a type of 'text'`,
//       'string.empty': `"password" cannot be an empty field`,
//       'string.min': `"password" should have a minimum length of {#limit}`,
//       'any.required': `"password" is a required field`,
//    }),
// });

// module.exports = { userSchema, User };
