const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.route");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.route");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/profile", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
