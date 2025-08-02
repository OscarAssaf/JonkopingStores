const express = require("express");
const cors = require("cors");
const path = require("path");
const client = require("./db"); 
const methodOverride = require("method-override"); // For handling PUT and DELETE via POST
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const SECRET = 'mySecretCookieToken'; 
const sessions = {}; // In-memory session store mapping tokens to user data.

const app = express();
app.use(cookieParser(SECRET));

const PORT = 3001;

// Middleware to allow CORS and parse JSON body
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(methodOverride("_method")); // Enabled for PUT and DELETE


app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend to make requests
  credentials: true
}));


app.get("/", (req, res) => {
  const token = req.signedCookies.authToken;
  const user = token && sessions[token] ? sessions[token].username : null;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jönköping City Stores</title>
      <link rel="stylesheet" href="/styles.css">
      <script>
        window.user = ${user ? `"${user}"` : "null"};
      </script>
    </head>
    <body>
      <script src="/script.js"></script>
    </body>
    </html>
  `);
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
  const token = req.signedCookies.authToken; // Read the token from the cookies

  // Check if the token exists and is valid
  if (token && sessions[token]) {
    const { name, url, district, phone_number, opening_hours, price_range } = req.body;

    try {
      const result = await client.query(
        "INSERT INTO stores (name, url, district, phone_number, opening_hours, price_range) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, url, district, phone_number, opening_hours, price_range]
      );
      // Redirect home after adding the store
      res.redirect("/");
    } catch (err) {
      console.error("Error adding store:", err);
      res.status(500).json({ error: "Unable to add store" });
    }
  } else {
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
});


// API endpoint to update a store by ID (protected route)
app.put("/api/stores/:id", async (req, res) => {
  const token = req.signedCookies.authToken; // Read the token from the cookies

  // Check if the token exists and is valid
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

      // Redirect home after updating the store
      res.redirect("/");
    } catch (err) {
      console.error("Error updating store:", err);
      res.status(500).json({ error: "Unable to update store" });
    }
  } else {
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
});

// API endpoint to delete a store by ID (protected route)
app.delete("/api/stores/:id", async (req, res) => {
  const token = req.signedCookies.authToken; // Read the token from the cookies

  // Check if the token exists and is valid
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
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
});

// Serve the add store form (protected route)
app.get("/add", (req, res) => {
  const token = req.signedCookies.authToken; // Read the token from the cookies

  // Check if the token exists and is valid
  if (token && sessions[token]) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Add Store</title>
        <link rel="stylesheet" href="/styles.css"> <!-- Link to styles.css -->
      </head>
      <body>
        <h1>Add a Store</h1>
        <form method="POST" action="/api/stores">
          <label for="store-name">Store Name:</label>
          <input type="text" id="store-name" name="name" required><br><br>

          <label for="store-url">Store URL:</label>
          <input type="text" id="store-url" name="url"><br><br>

          <label for="store-district">Store District:</label>
          <input type="text" id="store-district" name="district"><br><br>

          <label for="store-phone">Phone Number:</label>
          <input type="text" id="store-phone" name="phone_number"><br><br>

          <label for="store-opening-hours">Opening Hours:</label>
          <input type="text" id="store-opening-hours" name="opening_hours"><br><br>

          <label for="store-price-range">Price Range:</label>
          <input type="text" id="store-price-range" name="price_range"><br><br>

          <button type="submit">Add Store</button>
        </form>
        <p><a href="/">Back to Home</a></p>
      </body>
      </html>
    `);
  } else {
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
});

// Serve the edit store form (protected route)
app.get("/edit/:id", async (req, res) => {
  const token = req.signedCookies.authToken; // Read the token from the cookies

  // Check if the token exists and is valid
  if (token && sessions[token]) {
    const { id } = req.params;

    try {
      const result = await client.query("SELECT * FROM stores WHERE id = $1", [id]);
      if (result.rowCount === 0) {
        return res.status(404).send("Store not found");
      }

      const store = result.rows[0];
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Edit Store</title>
           <link rel="stylesheet" href="/styles.css"> <!-- Link to styles.css -->
        </head>
        <body>
          <h1>Edit Store</h1>
          <form method="POST" action="/api/stores/${id}?_method=PUT">
            <label for="store-name">Store Name:</label>
            <input type="text" id="store-name" name="name" value="${store.name}" required><br><br>

            <label for="store-url">Store URL:</label>
            <input type="text" id="store-url" name="url" value="${store.url || ''}"><br><br>

            <label for="store-district">Store District:</label>
            <input type="text" id="store-district" name="district" value="${store.district || ''}"><br><br>

            <label for="store-phone">Phone Number:</label>
            <input type="text" id="store-phone" name="phone_number" value="${store.phone_number || ''}"><br><br>

            <label for="store-opening-hours">Opening Hours:</label>
            <input type="text" id="store-opening-hours" name="opening_hours" value="${store.opening_hours || ''}"><br><br>

            <label for="store-price-range">Price Range:</label>
            <input type="text" id="store-price-range" name="price_range" value="${store.price_range || ''}"><br><br>

            <button type="submit">Update Store</button>
          </form>
          <p><a href="/">Back to Home</a></p>
        </body>
        </html>
      `);
    } catch (err) {
      console.error("Error fetching store:", err);
      res.status(500).send("Error fetching store data");
    }
  } else {
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
});


// Login page with a simple form
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login</title>
                <link rel="stylesheet" href="/styles.css"> <!-- Link to styles.css -->
      </head>
      <body>
        <h1>Login</h1>
        <form method="POST" action="/login">
          <label for="username">Username:</label>
          <input type="text" name="username" id="username" required /><br/><br/>
          <label for="password">Password:</label>
          <input type="password" name="password" id="password" required /><br/><br/>
          <button type="submit">Login</button>
        </form>
        <p><a href="/">Home</a></p>
      </body>
    </html>
  `);
});

// POST /login route
app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    const token = crypto.randomBytes(64).toString('hex'); 
    sessions[token] = { username }; 
    res.cookie('authToken', token, { signed: true, httpOnly: true }); 
    
    res.redirect('/'); // Redirect to home instead of /isLoggedIn
  } else {
    res.status(401).send('Login Error: Invalid credentials. Please try again.');
  }
});




// Logout route: clears the cookie, removes the session, and redirects to the default route
app.get('/logout', (req, res) => {
  const token = req.signedCookies.authToken;

  if (token) {
    delete sessions[token];
  }

  res.clearCookie('authToken');
  res.redirect('/');
});


// Serve the index.html file when visiting the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});