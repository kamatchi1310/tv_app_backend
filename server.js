const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const tvShowRoutes = require("./routes/tvshows");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();

const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use(bodyParser.json());
app.use(cors()); // Allow frontend access
app.use(express.json()); // Parse JSON bodies
app.use("/api/auth", authRoutes); // ✅ Mount the route
app.use("/uploads", express.static("uploads"));
app.use("/api/tvshows", tvShowRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
