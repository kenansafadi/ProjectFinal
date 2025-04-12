const { verifyToken } = require('../utils');
const authMiddleware = (req, res, next) => {
   try {
      const authorization = req.headers.authorization;

      if (!authorization) return res.status(401).json({ message: 'Unauthorized' });

      const token = authorization.split(' ')[1];

      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
   } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
   }
};

module.exports = authMiddleware;
