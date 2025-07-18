const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  if (!process.env.ACCESS_SECRET) {
    console.error(
      "CRITICAL: ACCESS_SECRET is not defined in environment variables."
    );

    return res.status(500).json({ message: "Internal Server Error." });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication error: No token provided or malformed token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    // Attach user to request. Using .lean() for performance.
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res
        .status(404)
        .json({ message: "User associated with this token not found." });
    }

    req.user = user; // Store user info for next middleware or controller
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please re-authenticate." });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Token is invalid. Please re-authenticate." });
    }

    return res
      .status(500)
      .json({ message: "An unexpected error occurred during authentication." });
  }
};

module.exports = authMiddleware;
