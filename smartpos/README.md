# SmartPOS — Retail Checkout & Inventory Suite

SmartPOS is a student-friendly full-stack point-of-sale application for retail staff. This enhanced edition builds on the uploaded project and retains its React/Vite + Express + MongoDB stack so existing data and workflows are easier to preserve.

## Features

### Checkout
- Search products by name, SKU, category or barcode.
- Barcode-scanner keyboard workflow: scan into the search field and press Enter to add an exact barcode/SKU match.
- Cart quantity controls and stock limits.
- Percentage discounts, configurable tax, Cash/Card/UPI payment selection.
- Cash received and change-due calculation for cash sales.
- Printable receipts with invoice reference, discount and tax breakdown.
- Server-side discount validation and stock checks.

### Products & inventory
- Create, edit, search and delete products.
- SKU uniqueness validation, barcode, category, price, stock and low-stock thresholds.
- Expiry-date tracking.
- Dashboard indicators for low-stock products, items expiring within 30 days, and expired stock.

### Sales & reporting
- Sales history with payment-method and text filters.
- Revenue totals for filtered transactions.
- Reports dashboard with today's revenue, transaction count, average bill and unit count.
- Payment mix visualization and inventory-health summary.
- Export sales and inventory data to CSV for Excel/Google Sheets.

### Engineering & deployment
- JWT authentication and admin-protected product management.
- Dockerfiles and Docker Compose for the client, API and MongoDB.
- MongoDB volume persistence.
- API health endpoint at `/api/health`.

## Stack
- Frontend: React 18, Vite, React Router, Axios, CSS
- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Database: MongoDB
- Containerization: Docker and Docker Compose

> Note: The uploaded baseline is JavaScript + MongoDB, not TypeScript + PostgreSQL + Redis. This version upgrades the existing code without silently replacing its database or rewriting it into a different stack. PostgreSQL/Redis migration can be treated as a separate follow-up.

## Run locally

Requirements: Node.js 20+ and MongoDB Community Server or MongoDB Atlas.

### Backend
```bash
cd server
npm install
cp .env.example .env
# On Windows PowerShell, use: Copy-Item .env.example .env
npm run seed
npm run dev
```

Edit `server/.env` as needed:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartpos
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

### Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`.

### Demo login
- Email: `admin@smartpos.com`
- Password: `admin123`

Change demo credentials and the JWT secret before any public deployment. This is a learning/demo application; do not process real payment-card data. Cash/Card/UPI selection records the chosen method and does not integrate a payment gateway.

## Run with Docker
From the project root:
```bash
docker compose up --build
```
Then open:
- Frontend: `http://localhost:8080`
- API health: `http://localhost:5000/api/health`

The Docker environment starts a fresh MongoDB volume. Seed demo data by running the seed script inside the server container after startup:
```bash
docker compose exec server npm run seed
```

## Project layout
```text
smartpos/
├── client/
│   ├── src/App.jsx
│   ├── src/api.js
│   ├── src/styles.css
│   ├── Dockerfile
│   └── nginx.conf
├── server/
│   ├── src/routes/
│   ├── src/models/
│   ├── src/middleware/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
