const User = require("../models/user.model");

const getUserData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        message:
          "User data not found in request. Authentication might have failed.",
      });
    }

    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.log("Getting UserData Error :", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//update user details 
const updateUserData = async (req, res) => {
  try {
    const {bio, age} = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(user == null){
      return res.status(404).json({ message: "User not found" });
    }

    user.bio = bio;
    user.age = age;
    await user.save();
    res.status(200).json({ message: "User data updated successfully" });

  } catch (error) {
      console.log("Updating UserData Error :", error);
      res.status(500).json({ message: "Server Error" });
  }
}

// Follow a user
const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // Check if trying to follow themselves
    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is blocked by the user they want to follow
    if (userToFollow.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ message: "You cannot follow this user" });
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId);
    if (currentUser.following.includes(id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: id }
    });

    // Add to followers list of target user
    await User.findByIdAndUpdate(id, {
      $push: { followers: currentUserId }
    });

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.log("Follow user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // Check if trying to unfollow themselves
    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    // Check if user exists
    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if currently following
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.following.includes(id)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: id }
    });

    // Remove from followers list of target user
    await User.findByIdAndUpdate(id, {
      $pull: { followers: currentUserId }
    });

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.log("Unfollow user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get following list
const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate('following', 'nameFirst nameLast email avatar')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.log("Get following error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get followers list
const getFollowers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate('followers', 'nameFirst nameLast email avatar')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.log("Get followers error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Block a user
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // Check if trying to block themselves
    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    // Check if user exists
    const userToBlock = await User.findById(id);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already blocked
    const currentUser = await User.findById(currentUserId);
    if (currentUser.blockedUsers.includes(id)) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    // Add to blocked users list
    await User.findByIdAndUpdate(currentUserId, {
      $push: { blockedUsers: id }
    });

    // Remove from following/followers if they exist
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: id }
    });

    await User.findByIdAndUpdate(id, {
      $pull: { followers: currentUserId }
    });

    // Remove current user from blocked user's following/followers
    await User.findByIdAndUpdate(id, {
      $pull: { following: currentUserId }
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followers: id }
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Block user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // Check if trying to unblock themselves
    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "You cannot unblock yourself" });
    }

    // Check if user exists
    const userToUnblock = await User.findById(id);
    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if currently blocked
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.blockedUsers.includes(id)) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Remove from blocked users list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: id }
    });

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Unblock user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { 
  getUserData,
  updateUserData,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser
};
