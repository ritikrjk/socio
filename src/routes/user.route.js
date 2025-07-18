const express = require('express');
const { 
  getUserData,
  updateUserData,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser
} = require("../controllers/user.controller");
const authMiddleware = require('../middleware/authmiddleware');
const router = express.Router();

// User data route
router.get("/userdata", authMiddleware, getUserData);

// Update user data route
router.post("/updatedata", authMiddleware, updateUserData);


// Follow/Unfollow routes
router.post("/follow/:id", authMiddleware, followUser);
router.post("/unfollow/:id", authMiddleware, unfollowUser);

// Get following/followers routes
router.get("/following", authMiddleware, getFollowing);
router.get("/followers", authMiddleware, getFollowers);

// Block/Unblock routes
router.post("/block/:id", authMiddleware, blockUser);
router.post("/unblock/:id", authMiddleware, unblockUser);

module.exports = router;
