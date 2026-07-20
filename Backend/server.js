const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const client = require("./db"); 
const methodOverride = require("method-override");
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const SECRET = 'mySecretCookieToken'; 
const sessions = {};

const app = express();
app.use(cookieParser(SECRET));

const PORT = 3001;
const FRONTEND_DIR = path.join(__dirname, "../Frontend");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const STATIC_DIR = fs.existsSync(path.join(DIST_DIR, "index.html")) ? DIST_DIR : FRONTEND_DIR;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

function getCurrentUser(req) {
  const token = req.signedCookies.authToken;
  return token && sessions[token] ? sessions[token].username : null;
}

function serveSpa(req, res) {
  const user = getCurrentUser(req);
  const indexPath = path.join(STATIC_DIR, "index.html");

  fs.readFile(indexPath, "utf8", (err, html) => {
    if (err) {
      return res.status(500).send("Frontend not built. Run npm run build in the Frontend folder.");
    }

    const injected = html.replace(
      "<head>",
      `<head>\n    <script>window.__USER__ = ${user ? JSON.stringify(user) : "null"};</script>`
    );

    res.send(injected);
  });
}

app.use(express.static(STATIC_DIR));

app.get("/api/auth", (req, res) => {
  res.json({ user: getCurrentUser(req) });
});

// API endpoint to gather all stores
app.get("/api/stores", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM stores");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stores:", err);
    res.status(500).json({ error: "Unable to fetch stores data" });
  }
});

// API endpoint to add a new store (protected route)
app.post("/api/stores", async (req, res) => {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    const { name, url, district, phone_number, opening_hours, price_range } = req.body;

    try {
      const result = await client.query(
        "INSERT INTO stores (name, url, district, phone_number, opening_hours, price_range) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, url, district, phone_number, opening_hours, price_range]
      );
      res.redirect("/");
    } catch (err) {
      console.error("Error adding store:", err);
      res.status(500).json({ error: "Unable to add store" });
    }
  } else {
    res.redirect('/login');
  }
});

// API endpoint to update a store by ID (protected route)
app.put("/api/stores/:id", async (req, res) => {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    const { id } = req.params;
    const { name, url, district, phone_number, opening_hours, price_range } = req.body;

    try {
      const result = await client.query(
        "UPDATE stores SET name = $1, url = $2, district = $3, phone_number = $4, opening_hours = $5, price_range = $6 WHERE id = $7 RETURNING *",
        [name, url, district, phone_number, opening_hours, price_range, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.redirect("/");
    } catch (err) {
      console.error("Error updating store:", err);
      res.status(500).json({ error: "Unable to update store" });
    }
  } else {
    res.redirect('/login');
  }
});

// API endpoint to delete a store by ID (protected route)
app.delete("/api/stores/:id", async (req, res) => {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    const { id } = req.params;

    try {
      const result = await client.query("DELETE FROM stores WHERE id = $1 RETURNING *", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json({ message: "Store deleted successfully" });
    } catch (err) {
      console.error("Error deleting store:", err);
      res.status(500).json({ error: "Unable to delete store" });
    }
  } else {
    res.redirect('/login');
  }
});

// POST /login route
app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    const token = crypto.randomBytes(64).toString('hex'); 
    sessions[token] = { username }; 
    res.cookie('authToken', token, { signed: true, httpOnly: true }); 
    
    res.redirect('/');
  } else {
    res.status(401).send('Login Error: Invalid credentials. Please try again.');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  const token = req.signedCookies.authToken;

  if (token) {
    delete sessions[token];
  }

  res.clearCookie('authToken');
  res.redirect('/');
});

// SPA fallback — serve Vue app for all frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  serveSpa(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${STATIC_DIR}`);
});
