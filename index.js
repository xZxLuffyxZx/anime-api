const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const animeRoutes = require("./routes/anime");

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Anime API is running" });
});

app.get("/test-db", (req, res) => {
  db.query("SELECT * FROM anime", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database connection failed",
        error: err.message
      });
    }

    res.json({
      message: "Database connected successfully",
      data: results
    });
  });
});

app.use("/api/anime", animeRoutes);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;