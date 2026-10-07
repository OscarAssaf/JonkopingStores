# Jönköping Stores, a better way to explore the city of Jönköping.

A full-stack, database-backed web application built for the **Advanced Web Development** course at Jönköping University. The application serves as an interactive city store directory for Jönköping, featuring dynamic client-side DOM manipulation with Vue 3, a RESTful Node.js/Express backend, persistent storage in PostgreSQL, session-based authentication with secure cookies, and containerized development via Docker.

---

## System Architecture

```text
+--------------------------------------------------------------+
|                        Client Browser                        |
|   Vue 3 SPA (Vite, Vue Router, Composables, Reactive DOM)    |
+------------------------------+-------------------------------+
                               |
               HTTP Requests (Port 3000 / 3001)
               CORS Enabled / Signed Cookies
                               v
+--------------------------------------------------------------+
|                    Node.js Express Backend                   |
|   - REST API (/api/stores, /api/auth)                        |
|   - Cookie-Parser & Crypto Session Auth                      |
|   - SPA Static Asset Delivery                                |
+------------------------------+-------------------------------+
                               |
                   PostgreSQL Client ('pg')
                   Parameterized SQL Queries
                               v
+--------------------------------------------------------------+
|                     PostgreSQL Database                      |
|   Table: stores (id, name, url, district, phone, hours, etc.)|
+--------------------------------------------------------------+
```

---

## Features

- **Store Directory & Search**: Real-time client-side search by name, filter by city district, and sorting by name or price range.
- **Responsive UI**: Custom modern styling with responsive design, grid layouts, and typography.
- **Administrative Portal**:
  - Secure `/login` and `/logout` flows.
  - Role-gated controls: Authenticated administrators can add new stores, update existing listings, or delete records.
- **Data Import & Seeding**: Automated seeding script (`importStores.js`) to parse raw JSON store datasets and populate the database with normalized records, operating hours, and contact details.

---

## REST API Specification

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth` | Public | Returns current authenticated user session |
| `GET` | `/api/stores` | Public | Retrieves all stores from the database |
| `POST` | `/api/stores` | **Admin Only** | Creates a new store record |
| `PUT` | `/api/stores/:id` | **Admin Only** | Updates an existing store by ID |
| `DELETE` | `/api/stores/:id` | **Admin Only** | Removes a store by ID |
| `POST` | `/login` | Public | Authenticates admin credentials and sets signed `authToken` cookie |
| `GET` | `/logout` | Public | Clears admin session and invalidates cookie |

---

## Project Structure

```text
.
├── Backend/
│   ├── Dockerfile            # Node.js Alpine container definition
│   ├── db.js                 # PostgreSQL connection pool configuration
│   ├── importStores.js       # Database migration & data seeding script
│   ├── package.json          # Backend dependencies (express, pg, cookie-parser, cors)
│   ├── server.js             # Express application, routes, and auth middleware
│   └── stores.json           # Raw seed data for Jönköping stores
├── Frontend/
│   ├── dockerfile            # Frontend production container definition
│   ├── index.html            # SPA entry point with Google Fonts
│   ├── package.json          # Frontend dependencies (Vue 3, Vue Router, Vite)
│   ├── vite.config.js        # Vite configuration & Vue plugin setup
│   └── src/
│       ├── main.js           # Vue application initialization
│       ├── App.vue           # Root layout component
│       ├── assets/           # Global styles and imagery
│       ├── components/       # Reusable UI components (StoreCard, HeroSection, StoreFilters, etc.)
│       ├── composables/      # Shared state & logic (useAuth.js, useStores.js)
│       ├── router/           # Client-side route definitions
│       └── views/            # Route views (HomeView, LoginView, AddStoreView, EditStoreView)
├── PostgreSQL/
│   └── dockerfile            # Database container with initial environment variables
└── README.md                 # Project documentation
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20 recommended)
- [PostgreSQL](https://www.postgresql.org/) (locally or via Docker)
- [Docker](https://www.docker.com/) (optional, for containerized execution)

---

### Running with Docker

You can build and run each service using the provided Dockerfiles:

1. **Start the Database**:
   ```bash
   cd PostgreSQL
   docker build -t jonkoping-db .
   docker run -d --name jonkoping-db -p 5432:5432 jonkoping-db
   ```

2. **Start the Backend**:
   ```bash
   cd ../Backend
   docker build -t jonkoping-backend .
   docker run -d --name jonkoping-backend -p 3001:3001 --link jonkoping-db:localhost jonkoping-backend
   ```

3. **Start the Frontend**:
   ```bash
   cd ../Frontend
   docker build -t jonkoping-frontend .
   docker run -d --name jonkoping-frontend -p 3000:3000 jonkoping-frontend
   ```

---

### Running Locally (Development Mode)

#### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432` with credentials matching `Backend/db.js` (default: user `postgres`, password `12345`, database `postgres`).

Seed the database with initial store listings:
```bash
cd Backend
npm install
node importStores.js
```

#### 2. Start Backend Server
```bash
# Inside /Backend
npm start
# Server starts at http://localhost:3001
```

#### 3. Start Frontend App
```bash
cd ../Frontend
npm install
npm run dev
# Vite dev server runs at http://localhost:3000
```

---

## Security Practices Implemented

- **SQL Injection Prevention**: All database queries in `server.js` and `importStores.js` utilize parameterized SQL queries (`$1, $2, ...`) via `pg`.
- **Signed HTTP-Only Cookies**: Authentication session tokens are transmitted with `httpOnly: true` (preventing access by malicious client-side scripts) and signed with a secret to detect tampering.
- **Cryptographic Tokens**: Session identifiers are generated using secure random bytes (`crypto.randomBytes(64)`).
- **CORS Protection**: Restricted Cross-Origin Resource Sharing allowing only trusted client origins with credential support.

