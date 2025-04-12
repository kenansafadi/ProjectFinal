const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
   const saltRounds = 12;
   return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hashedPassword) => {
   return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (user) => {
   return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
   return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { hashPassword, verifyPassword, generateToken, verifyToken };
