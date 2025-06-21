const express = require("express");
const { loginUser, registerUser, refreshAccessToken } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/refresh", refreshAccessToken);

module.exports = router;
