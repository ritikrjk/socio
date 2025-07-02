const Post = require("../models/post.model");

//create a new post
const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    // Validate content
    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    //create and save new post
    const newPost = new Post({
      user: userId,
      content: text,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post Created succesfully",
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error while creating post." });
  }
};

//like or unlike a post
const likeOrunlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
      await post.save();
      return res.status(200).json({ message: "Post unliked." });
    } else {
      post.likes.push(userId);
      await post.save();
      return res.status(200).json({ message: "Post liked." });
    }
  } catch (error) {
    console.log("Like Error :", error);
    return res.status(500).json({ message: "Error liking a post" });
  }
};

//add comment on a post
const addComment = async (req, res) => {
  try {
    const userId= req.user._id;
    const { postId } = req.params;
    const {text} = req.body;

    const post  = await Post.findById(postId);

    if(!post){
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({
      user : userId,
      comment : text.trim()
    })

    await post.save();

     res.status(201).json({ message: "Comment added successfully." });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Error adding comment." });
  }
};

module.exports = {createPost, likeOrunlikePost, addComment};
