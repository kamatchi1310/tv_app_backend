const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const { generateToken } = require("../jwtUtils.js");

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length > 0)
        return res.status(409).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ error: err });
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    }
  );
});

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      const token = generateToken(user);
      if (!match) return res.status(401).json({ message: "Invalid password" });

      res.status(200).json({
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email },
        token: token,
      });
    }
  );
});

module.exports = router;
