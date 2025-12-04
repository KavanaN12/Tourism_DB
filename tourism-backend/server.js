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

/* =========================
   1. PLACES (SQL)
   ========================= */

// GET ALL PLACES (JOIN with states)
app.get("/api/places", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.place_id,
             tp.place_name,
             s.state_name,
             tp.category,
             tp.best_time
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
  const { place_name, state_id, category, best_time, description, added_by } = req.body;

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

// DELETE A PLACE (optional)
app.delete("/api/places/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM tourist_places WHERE place_id = $1`, [id]);
    res.json({ message: "Deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   2. VISITOR STATS (SQL)
   ========================= */

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

/* =========================
   3. USERS (SQL, linked to Firebase UID)
   ========================= */

// SQL users table is used for profile & analytics
// Structure: user_id, firebase_uid, full_name, email, created_at

// Check if user exists by Firebase UID
app.get("/api/users/by-uid/:firebase_uid", async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const result = await pool.query(
      `SELECT user_id, firebase_uid, full_name, email
       FROM users
       WHERE firebase_uid = $1`,
      [firebase_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found in SQL" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// REGISTER FIREBASE USER INTO SQL
// =========================

app.post("/api/register", async (req, res) => {
  const { firebase_uid, full_name, email } = req.body;

  try {
    // Check if already exists
    const existingUser = await pool.query(
      `SELECT user_id FROM users WHERE firebase_uid = $1`,
      [firebase_uid]
    );

    if (existingUser.rows.length > 0) {
      return res.json(existingUser.rows[0]); // don't duplicate
    }

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email)
       VALUES ($1, $2, $3)
       RETURNING user_id, firebase_uid, full_name, email`,
      [firebase_uid, full_name, email]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("🔥 SQL REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// (Optional) Get all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, firebase_uid, full_name, email FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   4. FAVOURITES (SQL)
   ========================= */

app.post("/api/favourites", async (req, res) => {
  const { user_id, place_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO user_favourites (user_id, place_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, place_id) DO NOTHING`,
      [user_id, place_id]
    );
    res.json({ message: "Favourite added." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/favourites/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT tp.place_name, tp.category, tp.best_time
       FROM user_favourites uf
       JOIN tourist_places tp ON uf.place_id = tp.place_id
       WHERE uf.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user-stats/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const favCount = await pool.query(
      `SELECT COUNT(*) FROM user_favourites WHERE user_id=$1`,
      [user_id]
    );

    res.json({
      favourites: favCount.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/top-favourites", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.place_name, COUNT(*) AS fav_count
      FROM user_favourites uf
      JOIN tourist_places tp ON uf.place_id = tp.place_id
      GROUP BY tp.place_name
      ORDER BY fav_count DESC
      LIMIT 5;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.listen(5000, () => console.log("Server running on http://localhost:5000"));
