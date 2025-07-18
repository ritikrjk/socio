const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware//authmiddleware");
const {
  createPost,
  likePost,
  unlikePost,
  addComment,
  getAllPublicPosts,
  getFollowingPosts
} = require("../controllers/post.controller");

router.post("/create", authMiddleware, createPost);
router.post("/like/:postId", authMiddleware, likePost);
router.delete("/unlike/:postId", authMiddleware, unlikePost);
router.post("/comment/:postId", authMiddleware, addComment);

//fetch posts
router.get("/public-feed", authMiddleware, getAllPublicPosts);
router.get("/following-feed/:userId", authMiddleware, getFollowingPosts);

module.exports = router;
