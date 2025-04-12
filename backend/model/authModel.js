// model/auth.js

const mongoose = require('mongoose');
const Joi = require('joi');

// הגדרת הסכימה עבור Auth
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// יצירת המודל Auth בהתבסס על הסכימה
const Auth = mongoose.model('Auth', authSchema);

// ולידציה לנתוני הקלט של Auth
function validateAuth(auth) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(auth);
}

// ייצוא המודל Auth ופונקציית הולידציה
module.exports = {
    Auth,
    validateAuth
};