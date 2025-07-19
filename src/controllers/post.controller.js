const Post = require("../models/post.model");
const User = require("../models/user.model");

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
      message: "Post created successfully.",
      post: {
        id: newPost._id,
        content: newPost.content,
        user: newPost.user,
        createdAt: newPost.createdAt,
        likes: [],
        comments: [],
      },
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server Error while creating post." });
  }
};

//like a post
const likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    // Use findByIdAndUpdate with $addToSet for an atomic and idempotent operation
    const post = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } }, // $addToSet ensures a user can't be added twice
      { new: true } // Return the updated document
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({
      message: "Post liked successfully.",
      post,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like Error:", error);
    return res.status(500).json({ message: "Error liking the post." });
  }
};

//unlike a post
const unlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    // Use findByIdAndUpdate with $pull for an atomic operation
    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({
      message: "Post unliked successfully.",
      post,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Unlike Error:", error);
    return res.status(500).json({ message: "Error unliking the post." });
  }
};

//add a comment to a post
const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text } = req.body;

    // Check if the post exists
    const validPost = await Post.findById(postId);
    if (!validPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Validate comment content
    if (typeof text !== "string" || text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Comment content cannot be empty." });
    }
    if (text.trim().length > 300) {
      return res
        .status(400)
        .json({ message: "Comment cannot exceed 300 characters." });
    }

    const newComment = {
      user: userId,
      comment: text.trim(),
      createdAt: new Date(),
    };

    // Add comment to the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updatedPost) {
      return res
        .status(404)
        .json({ message: "Failed to add comment. Post not found." });
    }

    res.status(201).json({
      comment: newComment,
      message: "Comment added successfully.",
      commentsCount: updatedPost.comments.length,
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Error adding comment." });
  }
};

//delete a comment from post
const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    comment.remove();
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Delete Comment error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllPublicPosts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const publicUsers = await User.find({ isPrivate: false }).select("_id");
    const publicUserIds = publicUsers.map((user) => user._id);

    const totalPosts = await Post.countDocuments({
      user: { $in: publicUserIds },
    });

    const posts = await Post.find({ user: { $in: publicUserIds } })
      .populate("user", "nameFirst nameLast avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      message: "Public posts fetched successfully.",
    });
  } catch (error) {
    console.error("Fetching Public Posts error:", error);
    res
      .status(500)
      .json({ message: "Server Error While Fetching public posts." });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    // Fetch feed for the currently authenticated user
    const userId = req.user._id;
    const user = await User.findById(userId).select("following");

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const followingUsersIds = user.following;

    const totalPosts = await Post.countDocuments({
      user: { $in: followingUsersIds },
    });

    const posts = await Post.find({ user: { $in: followingUsersIds } })
      .populate("user", "nameFirst nameLast avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      message: "Following posts fetched successfully.",
    });
  } catch (error) {
    console.error("Fetching Following Posts error:", error);
    res
      .status(500)
      .json({ message: "Server Error While Fetching following posts." });
  }
};

module.exports = {
  createPost,
  likePost,
  unlikePost,
  addComment,
  getAllPublicPosts,
  getFollowingPosts,
};
