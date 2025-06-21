const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateAccessToken, generateRefreshToken} = require("../utils/token");
const isValidEmail = require("../utils/validemail_check");

const registerUser = async (req, res) => {
  try {
    const { nameFirst, nameLast, email, password, gender } = req.body;

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format provided." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    const newUser = await User.create({
      nameFirst,
      nameLast,
      email,
      password,
      gender,
    });

    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.nameFirst,
      lastName: newUser.nameLast,
      email: newUser.email,
      gender: newUser.gender,
      token: generateToken(newUser._id), // Assuming generateToken is defined elsewhere
    });
  } catch (error) {
    console.error(error); // It's good practice to log the actual error on the server
    res.status(500).json({ message: "Server Error" });
  }
};

loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    res.status(201).json({
      _id: user._id,
      firstName: user.nameFirst,
      lastName: user.nameLast,
      email: user.email,
      gender: user.gender,
      refreshToken : generateRefreshToken(user._id),
      accessToken : generateAccessToken(user._id)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
};

const refreshAccessToken = async (req, res) => {

  const {refreshToken} = req.body;

  if(!refreshToken){
      return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
     const newAccessToken = generateAccessToken(decoded.id);

   
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
     return res.status(401).json({ message: "Invalid or expired refresh token." });
  }

};

module.exports = { loginUser, registerUser, refreshAccessToken};
