// middleware/authorize.js
const jwt = require('jsonwebtoken');

// Middleware to verify the token and the role
const authorize = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            // Check if the user has the required role
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
            }

            // Attach user info to the request
            req.user = decoded;
            next();
        });
    };
};

module.exports = authorize;
