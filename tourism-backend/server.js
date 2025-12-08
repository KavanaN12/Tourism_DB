// =========================================================
//  FINAL COMPLETE SERVER.JS FOR TOURISM APP
//  Compatible with PostgreSQL + React + Firebase Auth
// =========================================================

const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL Pool

const app = express();
app.use(cors());
app.use(express.json());

const PAGE_SIZE = 20;

// ---------------------------------------------------------
// ADMIN CHECK (Temporary until Firebase Admin SDK is added)
// ---------------------------------------------------------
function isAdmin(req) {
  return req.headers["x-admin"] === "true"; 
}

// ---------------------------------------------------------
// ERROR HANDLER
// ---------------------------------------------------------
function handleError(res, err, where = "server") {
  console.error(`❌ Error in ${where}:`, err);
  return res.status(500).json({ error: err?.message || "Server Error" });
}

// ---------------------------------------------------------
// TEST ENDPOINT
// ---------------------------------------------------------
app.get("/", (req, res) => res.json({ ok: true }));

// =========================================================
// STATES
// =========================================================
app.get("/api/states", async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT state_id, state_name, region
      FROM states
      ORDER BY state_name;
    `);
    res.json(q.rows);
  } catch (err) {
    return handleError(res, err, "fetch-states");
  }
});

// =========================================================
// CATEGORIES
// =========================================================
app.get("/api/categories", async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT category_id, name
      FROM categories
      ORDER BY name;
    `);
    res.json(q.rows);
  } catch (err) {
    return handleError(res, err, "fetch-categories");
  }
});

// =========================================================
// GET ALL PLACES (Pagination + Search)
// =========================================================
app.get("/api/places", async (req, res) => {
  try {
    const { q = "", page = 1, page_size = PAGE_SIZE, state_id, category } =
      req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * page_size;

    let params = [];
    let where = [];

    if (q) {
      params.push(`%${q}%`);
      where.push(`tp.place_name ILIKE $${params.length}`);
    }

    if (state_id) {
      params.push(state_id);
      where.push(`tp.state_id = $${params.length}`);
    }

    if (category) {
      params.push(category);
      where.push(`c.name = $${params.length}`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Count total
    const countQuery = `
      SELECT COUNT(*)
      FROM tourist_places tp
      LEFT JOIN categories c ON tp.category_id = c.category_id
      ${whereSQL};
    `;
    const totalRes = await pool.query(countQuery, params);
    const total = parseInt(totalRes.rows[0].count, 10);

    // Fetch rows
    params.push(page_size, offset);
    const dataQuery = `
      SELECT tp.place_id,
             tp.place_name,
             s.state_name,
             c.name AS category,
             tp.best_time,
             tp.description
      FROM tourist_places tp
      JOIN states s ON tp.state_id = s.state_id
      LEFT JOIN categories c ON tp.category_id = c.category_id
      ${whereSQL}
      ORDER BY tp.place_id ASC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const rows = await pool.query(dataQuery, params);

    res.json({
      meta: { total, page: Number(page), page_size: Number(page_size) },
      data: rows.rows,
    });
  } catch (err) {
    return handleError(res, err, "get-places");
  }
});

// =========================================================
// ADD NEW PLACE (Admin Only)
// =========================================================
app.post("/api/places", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });

    const { place_name, state_id, category, best_time, description, added_by } =
      req.body;

    if (!place_name || !state_id)
      return res
        .status(400)
        .json({ error: "place_name and state_id required" });

    /// Find or create category_id
    let category_id = null;
    if (category?.trim()) {
      const found = await pool.query(
        `SELECT category_id FROM categories WHERE name = $1`,
        [category]
      );

      if (found.rows.length > 0) {
        category_id = found.rows[0].category_id;
      } else {
        const added = await pool.query(
          `INSERT INTO categories (name) VALUES ($1) RETURNING category_id`,
          [category]
        );
        category_id = added.rows[0].category_id;
      }
    }

    const insert = await pool.query(
      `INSERT INTO tourist_places
       (place_name, state_id, category_id, best_time, description, added_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING place_id`,
      [place_name, state_id, category_id, best_time, description, added_by]
    );

    res.json({
      message: "Place added",
      place_id: insert.rows[0].place_id,
    });
  } catch (err) {
    return handleError(res, err, "add-place");
  }
});

// =========================================================
// DELETE PLACE (Admin)
// =========================================================
app.delete("/api/places/:id", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });

    const placeId = Number(req.params.id);
    await pool.query(`DELETE FROM tourist_places WHERE place_id = $1`, [
      placeId,
    ]);

    res.json({ message: "Place deleted" });
  } catch (err) {
    return handleError(res, err, "delete-place");
  }
});

// =========================================================
// REGISTER USER (Firebase → SQL)
// REQUIRED FOR SIGNUP + PROFILE SETUP
// =========================================================
app.post("/api/register", async (req, res) => {
  try {
    const { firebase_uid, full_name, email } = req.body;

    if (!firebase_uid || !email)
      return res
        .status(400)
        .json({ error: "firebase_uid and email required" });

    // Check if already exists
    const existing = await pool.query(
      `SELECT user_id, firebase_uid, full_name, email, is_admin
       FROM users
       WHERE firebase_uid = $1`,
      [firebase_uid]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    const inserted = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email, is_admin)
       VALUES ($1, $2, $3, false)
       RETURNING user_id, firebase_uid, full_name, email, is_admin`,
      [firebase_uid, full_name, email]
    );

    res.json(inserted.rows[0]);
  } catch (err) {
    return handleError(res, err, "register-user");
  }
});

// =========================================================
// GET USER BY FIREBASE UID
// =========================================================
app.get("/api/users/by-uid/:firebase_uid", async (req, res) => {
  try {
    const { firebase_uid } = req.params;

    const q = await pool.query(
      `SELECT user_id, firebase_uid, full_name, email, is_admin
       FROM users
       WHERE firebase_uid = $1`,
      [firebase_uid]
    );

    if (q.rows.length === 0)
      return res.status(404).json({ error: "User not found in SQL" });

    res.json(q.rows[0]);
  } catch (err) {
    return handleError(res, err, "users-by-uid");
  }
});

// =========================================================
// FAVOURITES
// =========================================================
app.post("/api/favourites", async (req, res) => {
  try {
    const { user_id, place_id } = req.body;

    if (!user_id || !place_id)
      return res.status(400).json({ error: "user_id & place_id required" });

    await pool.query(
      `INSERT INTO user_favourites (user_id, place_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, place_id) DO NOTHING`,
      [user_id, place_id]
    );

    res.json({ message: "Favourite added" });
  } catch (err) {
    return handleError(res, err, "add-favourite");
  }
});

app.get("/api/favourites/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const q = await pool.query(
      `SELECT tp.place_name, c.name AS category, tp.best_time
       FROM user_favourites uf
       JOIN tourist_places tp ON uf.place_id = tp.place_id
       LEFT JOIN categories c ON tp.category_id = c.category_id
       WHERE uf.user_id = $1`,
      [user_id]
    );

    res.json(q.rows);
  } catch (err) {
    return handleError(res, err, "get-favourites");
  }
});

// =========================================================
// USER STATS
// =========================================================
app.get("/api/user-stats/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const favCount = await pool.query(
      `SELECT COUNT(*) FROM user_favourites WHERE user_id = $1`,
      [user_id]
    );

    res.json({ favourites: Number(favCount.rows[0].count) });
  } catch (err) {
    return handleError(res, err, "user-stats");
  }
});

// =========================================================
// TOP FAVOURITES (Most liked places)
// =========================================================
app.get("/api/top-favourites", async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT tp.place_name, COUNT(*)::int AS fav_count
      FROM user_favourites uf
      JOIN tourist_places tp ON uf.place_id = tp.place_id
      GROUP BY tp.place_name
      ORDER BY fav_count DESC
      LIMIT 5;
    `);

    res.json(q.rows);
  } catch (err) {
    return handleError(res, err, "top-favourites");
  }
});

// =========================================================
// VISITOR STATS (Aggregated)
// =========================================================
app.get("/api/stats", async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT tp.place_name,
             SUM(v.domestic_visitors + v.foreign_visitors) AS total_visitors
      FROM visitor_statistics v
      JOIN tourist_places tp ON v.place_id = tp.place_id
      GROUP BY tp.place_name
      ORDER BY total_visitors DESC
      LIMIT 50;
    `);

    res.json(q.rows);
  } catch (err) {
    return handleError(res, err, "visitor-stats");
  }
});

// =========================================================
// SQL PLAYGROUND (ADMIN ONLY)
// =========================================================
app.post("/api/query/run", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });

    const { sql, params = [] } = req.body;

    if (!sql || typeof sql !== "string")
      return res.status(400).json({ error: "SQL required" });

    if (!sql.trim().toLowerCase().startsWith("select"))
      return res.status(400).json({ error: "Only SELECT allowed" });

    const q = await pool.query(sql, params);
    res.json({ rows: q.rows, rowCount: q.rowCount });
  } catch (err) {
    return handleError(res, err, "sql-playground");
  }
});

// =========================================================
// START SERVER
// =========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
