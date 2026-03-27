const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all anime
router.get("/", (req, res) => {
  const sql = "SELECT * FROM anime ORDER BY id ASC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch anime",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// GET anime by id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM anime WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch anime",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    res.status(200).json(results[0]);
  });
});

// POST create new anime
router.post("/", (req, res) => {
  const { title, genre, episodes, rating, comment, image_url } = req.body;

  if (!title || !genre || episodes == null || !image_url) {
    return res.status(400).json({
      message: "title, genre, episodes, and image_url are required"
    });
  }

  const sql = `
    INSERT INTO anime (title, genre, episodes, rating, comment, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, genre, episodes, rating || 0.0, comment || "", image_url],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to create anime",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Anime created successfully",
        id: result.insertId
      });
    }
  );
});

// PUT update rating
router.put("/:id/rating", (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating == null) {
    return res.status(400).json({
      message: "rating is required"
    });
  }

  const sql = "UPDATE anime SET rating = ? WHERE id = ?";

  db.query(sql, [rating, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to update rating",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    res.status(200).json({
      message: "Rating updated successfully"
    });
  });
});

// PUT update comment
router.put("/:id/comment", (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (comment == null) {
    return res.status(400).json({
      message: "comment is required"
    });
  }

  const sql = "UPDATE anime SET comment = ? WHERE id = ?";

  db.query(sql, [comment, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to update comment",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    res.status(200).json({
      message: "Comment updated successfully"
    });
  });
});

// DELETE anime
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM anime WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete anime",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    res.status(200).json({
      message: "Anime deleted successfully"
    });
  });
});

module.exports = router;