const user = require("../models/user.model");

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

module.exports = { getUserData };
