const Post = require("../models/post.model");

const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const {text} = req.body;

    // Validate content
    if (typeof text !== "string"|| text.trim().length === 0) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    //create and save new post 
    const newPost = new Post({
        user : userId,
        content : trim
    });

    await newPost.save();

    res.status(200).json({
        "message" : "Post Created succesfully"
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error while creating post." });
  }
};

module.exports = { createPost };
