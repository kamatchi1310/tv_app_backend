const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../config/db");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid token",
        });
      } else {
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Token is not provided",
    });
  }
};

// Create API with file
router.post("/", validateToken, async (req, res) => {
  try {
    const { title, type, director, budget, location, duration } = req.body;

    const [result] = await db.execute(
      "INSERT INTO tv_shows (title, type, director, budget, location, duration) VALUES (?, ?, ?, ?, ?, ?)",
      [title, type, director, budget, location, duration]
    );
    res
      .status(201)
      .json({ success: true, message: "TV Show added", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A TV Show with this title already exists.",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all TV shows
router.get("/", validateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tv_shows ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching tv shows:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Update a TV show by ID
router.put("/:id", validateToken, async (req, res) => {
  const tvShowId = req.params.id;
  const { title, type, director, budget, location, duration } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE tv_shows SET title = ?, type = ?, director = ?, budget = ?, location = ?, duration = ?
       WHERE id = ?`,
      [title, type, director, budget, location, duration, tvShowId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "TV Show not found" });
    }

    res.json({ success: true, message: "TV Show updated successfully" });
  } catch (err) {
    console.error("❌ Error updating TV show:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a TV show by ID
router.delete("/:id", validateToken, async (req, res) => {
  const tvShowId = req.params.id;

  try {
    const [result] = await db.execute(`DELETE FROM tv_shows WHERE id = ?`, [
      tvShowId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "TV Show not found" });
    }

    res.json({ success: true, message: "TV Show deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting TV show:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get a TV show by ID
router.get("/:id", validateToken, async (req, res) => {
  const tvShowId = req.params.id;

  try {
    const [rows] = await db.execute(`SELECT * FROM tv_shows WHERE id = ?`, [
      tvShowId,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "TV Show not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching TV show:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
