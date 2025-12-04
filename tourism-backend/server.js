const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// GET ALL PLACES (JOIN with states)
app.get("/api/places", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.place_id, tp.place_name, s.state_name, tp.category, tp.best_time
      FROM tourist_places tp
      JOIN states s ON tp.state_id = s.state_id;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW PLACE
app.post("/api/places", async (req, res) => {
  const { place_name, state_id, category, best_time, description } = req.body;

  try {
    await pool.query(
      `INSERT INTO tourist_places (place_name, state_id, category, best_time, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [place_name, state_id, category, best_time, description]
    );

    res.json({ message: "Place added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE A PLACE
app.delete("/api/places/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM tourist_places WHERE place_id = $1`, [id]);
    res.json({ message: "Deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VISITOR STATS PER PLACE
app.get("/api/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.place_name,
             SUM(v.domestic_visitors + v.foreign_visitors) AS total_visitors
      FROM visitor_statistics v
      JOIN tourist_places tp ON v.place_id = tp.place_id
      GROUP BY tp.place_name
      ORDER BY total_visitors DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(5000, () => console.log("Server running on http://localhost:5000"));
