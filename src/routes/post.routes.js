const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware//authmiddleware");
const {
  createPost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  getAllPublicPosts,
  getFollowingPosts
} = require("../controllers/post.controller");

router.post("/create", authMiddleware, createPost);

//like and unlike 
router.post("/like/:postId", authMiddleware, likePost);
router.delete("/unlike/:postId", authMiddleware, unlikePost);


//add and remove a comment 
router.post("/comment/:postId", authMiddleware, addComment);
router.delete("/comment/:postId/:commentId", authMiddleware, deleteComment);

//fetch posts
router.get("/public-feed", authMiddleware, getAllPublicPosts);
router.get("/following-feed/:userId", authMiddleware, getFollowingPosts);

module.exports = router;
