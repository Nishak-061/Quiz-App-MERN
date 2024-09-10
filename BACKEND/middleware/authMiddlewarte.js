const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();



// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; //get the authorization header
  const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]); // Extract token from 'Bearer <token>'
  
  // Debug: Log the token received in the request
  console.log('Received Auth Token:', token);
  
  // If no token is provided, return 401 Unauthorized
  if (token == null) {
    console.log("No token provided.");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Debug: Log the error if the token verification fails
      console.log('Token verification error:', err);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
     // If verification is successful, attach user info to the request object
    req.user = user; // Attach user information to the request
    next();  // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;

