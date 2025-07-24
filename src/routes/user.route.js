const express = require("express");
const {
  getUserData,
  getUserById,
  updateUserProfile,
  followUser,
  unFollowUser,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser,
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/authmiddleware");
const router = express.Router();

// User profile
router.get("/userdata", authMiddleware, getUserData);
router.post("/updatedata", authMiddleware, updateUserProfile);
router.get("/:id", authMiddleware, getUserById);

// follow and unfollow
router.post("/follow/:id", authMiddleware, followUser);
router.delete("/unfollow/:id", authMiddleware, unFollowUser);


// Accept/Reject follow request (Private accounts)
router.post("/accept-follow/:id", authMiddleware, acceptFollowRequest); // ✅ NEW
router.post("/reject-follow/:id", authMiddleware, rejectFollowRequest); // ✅ Optional

// Get connections
router.get("/following", authMiddleware, getFollowing);
router.get("/followers", authMiddleware, getFollowers);

// Block/Unblock
router.post("/block/:id", authMiddleware, blockUser);
router.post("/unblock/:id", authMiddleware, unblockUser);

module.exports = router;
