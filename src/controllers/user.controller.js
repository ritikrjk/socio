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
    console.error("Getting UserData Error :", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error while getting user by id:", error);
    res.status(500).json({ message: "Error while getting user by id" });
  }
};

//updating user details
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const updates = req.body; // The fields to update

    // Filter allowed fields to prevent arbitrary updates (important for security!)
    const allowedUpdates = [
      "nameFirst",
      "nameLast",
      "email",
      "gender",
      "avatar",
      "bio",
      "isPrivate",
    ];
    const actualUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    if (Object.keys(actualUpdates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: actualUpdates }, // Use $set to update only specified fields
      { new: true, runValidators: true, select: "-password" } // Return updated doc, run schema validators, exclude password
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser.toObject({ getters: true, virtuals: false }), // Convert to plain object, handle virtuals if needed
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during profile update." });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    if (targetUser.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    if (targetUser.isPrivate) {
      // For private account → send request
      if (targetUser.pendingFollowRequests.includes(currentUserId)) {
        return res.status(400).json({ message: "Follow request already sent" });
      }

      targetUser.pendingFollowRequests.push(currentUserId);
      await targetUser.save();

      return res
        .status(200)
        .json({ message: "Follow request sent to private user" });
    }

    // Public user → directly follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "Followed public user" });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Unfollow a user
const unFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove from following and followers arrays
    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Unfollow error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

const acceptFollowRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id; // private user
    const requesterId = req.params.id; // user who sent the request

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.pendingFollowRequests.includes(requesterId)) {
      return res
        .status(400)
        .json({ message: "No pending request from this user" });
    }

    // ✅ Accept: update both
    currentUser.followers.push(requesterId);
    requesterUser.following.push(currentUserId);

    // Remove request
    currentUser.pendingFollowRequests =
      currentUser.pendingFollowRequests.filter(
        (id) => id.toString() !== requesterId
      );

    await currentUser.save();
    await requesterUser.save();

    return res.status(200).json({ message: "Follow request accepted" });
  } catch (err) {
    console.error("Accept follow error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Helper function to remove follow request
const removeFollowRequest = async (receiverUserId, senderUserId) => {
  const receiverUser = await User.findById(receiverUserId);
  
  if (!receiverUser) {
    throw new Error("Receiver user not found");
  }

  if (!receiverUser.pendingFollowRequests.includes(senderUserId)) {
    throw new Error("No pending request found");
  }

  receiverUser.pendingFollowRequests = receiverUser.pendingFollowRequests.filter(
    (id) => id.toString() !== senderUserId.toString()
  );

  await receiverUser.save();
  return receiverUser;
};

const rejectFollowRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id; // receiver (private user)
    const requesterId = req.params.id; // sender of the request

    await removeFollowRequest(currentUserId, requesterId);
    return res.status(200).json({ message: "Follow request rejected" });
  } catch (err) {
    console.error("Reject follow error:", err);
    
    if (err.message === "Receiver user not found") {
      return res.status(404).json({ message: "User not found" });
    }
    if (err.message === "No pending request found") {
      return res.status(400).json({ message: "No pending request from this user" });
    }
    
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel a follow request (for the user who sent the request)
const cancelFollowRequest = async (req, res) => {
  try {
    const targetUserId = req.params.id; // receiver (private user)
    const currentUserId = req.user._id; // sender of the request

    await removeFollowRequest(targetUserId, currentUserId);
    return res.status(200).json({ message: "Follow request cancelled" });
  } catch (err) {
    console.error("Cancel follow request error:", err);
    
    if (err.message === "Receiver user not found") {
      return res.status(404).json({ message: "User not found" });
    }
    if (err.message === "No pending request found") {
      return res.status(400).json({ message: "No pending request to this user" });
    }
    
    return res.status(500).json({ message: "Server error" });
  }
};

// Get following list
const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId)
      .populate("following", "nameFirst nameLast email avatar")
      .select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      following: user.following,
      count: user.following.length,
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
      .populate("followers", "nameFirst nameLast email avatar")
      .select("followers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followers: user.followers,
      count: user.followers.length,
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
      $push: { blockedUsers: id },
    });

    // Remove from following/followers if they exist
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: id },
    });

    await User.findByIdAndUpdate(id, {
      $pull: { followers: currentUserId },
    });

    // Remove current user from blocked user's following/followers
    await User.findByIdAndUpdate(id, {
      $pull: { following: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followers: id },
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
      $pull: { blockedUsers: id },
    });

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Unblock user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUserData,
  getUserById,
  updateUserProfile,
  followUser,
  unFollowUser,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser,
};
