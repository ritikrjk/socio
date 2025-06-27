const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Get token from "Bearer <token>"

    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is not defined.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // Store user info for next middleware or controller
    next(); // Proceed to route

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
};

module.exports = authMiddleware;
