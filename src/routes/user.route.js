const express = require('express');
const {getUserData} = require("../controllers/user.controller");
const authMiddleware = require('../middleware/authmiddleware');
const router = express.Router();

router.get("/userdata" , authMiddleware, getUserData);

module.exports = router;