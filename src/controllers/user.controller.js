const user = require("../models/user.model");

const getUserData = async (req, res) => {
  try {

    if (!req.user) {
      return res
        .status(404)
        .json({
          message:
            "User data not found in request. Authentication might have failed.",
        });
    }

    res.status(200).json({
      _id: req.user._id,
      firstName: req.user.nameFirst,
      lastName: req.user.nameLast,
      email: req.user.email,
      gender: req.user.gender,
      avatar: req.user.avatar,
      age: req.user.age,
      bio: req.user.bio,
      isPrivate: req.user.isPrivate,
      followers: req.user.followers,
      following: req.user.following,
      blockedUsers: req.user.blockedUsers,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.log("Getting UserData Error :", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {getUserData}