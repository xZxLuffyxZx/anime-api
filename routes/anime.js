const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all anime with average rating
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.title,
      a.genre,
      a.episodes,
      a.image_url,
      a.created_at,
      ROUND(AVG(r.rating), 1) AS average_rating
    FROM anime a
    LEFT JOIN ratings r ON a.id = r.anime_id
    GROUP BY a.id, a.title, a.genre, a.episodes, a.image_url, a.created_at
    ORDER BY a.id ASC
  `;

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

// GET all comments for one anime
router.get("/:id/comments", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, anime_id, comment, created_at
    FROM comments
    WHERE anime_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch comments",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// GET one anime with average rating
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      a.id,
      a.title,
      a.genre,
      a.episodes,
      a.image_url,
      a.created_at,
      ROUND(AVG(r.rating), 1) AS average_rating
    FROM anime a
    LEFT JOIN ratings r ON a.id = r.anime_id
    WHERE a.id = ?
    GROUP BY a.id, a.title, a.genre, a.episodes, a.image_url, a.created_at
  `;

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
  const { title, genre, episodes, image_url } = req.body;

  if (!title || !genre || episodes == null || !image_url) {
    return res.status(400).json({
      message: "title, genre, episodes, and image_url are required"
    });
  }

  const sql = `
    INSERT INTO anime (title, genre, episodes, image_url)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, genre, episodes, image_url], (err, result) => {
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
  });
});

// POST add one rating
router.post("/:id/rating", (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating == null) {
    return res.status(400).json({
      message: "rating is required"
    });
  }

  const checkAnimeSql = "SELECT id FROM anime WHERE id = ?";

  db.query(checkAnimeSql, [id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        message: "Failed to check anime",
        error: checkErr.message
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    const insertSql = `
      INSERT INTO ratings (anime_id, rating)
      VALUES (?, ?)
    `;

    db.query(insertSql, [id, rating], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add rating",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Rating added successfully",
        id: result.insertId
      });
    });
  });
});

// POST add one comment
router.post("/:id/comment", (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({
      message: "comment is required"
    });
  }

  const checkAnimeSql = "SELECT id FROM anime WHERE id = ?";

  db.query(checkAnimeSql, [id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        message: "Failed to check anime",
        error: checkErr.message
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        message: "Anime not found"
      });
    }

    const insertSql = `
      INSERT INTO comments (anime_id, comment)
      VALUES (?, ?)
    `;

    db.query(insertSql, [id, comment], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add comment",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Comment added successfully",
        id: result.insertId
      });
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