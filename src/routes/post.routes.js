const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware//authmiddleware");
const {createPost, likeOrunlikePost}= require("../controllers/post.controller");

router.post("/create",authMiddleware, createPost);


module.exports = router;