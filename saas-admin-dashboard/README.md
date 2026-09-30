# Saasly — SaaS Admin Dashboard

A complete, ready-to-run SaaS admin dashboard with a real Node.js/Express backend (JWT auth, JSON file database) and a static HTML/CSS/JS frontend served by the same server.

## Features
- Email/password authentication (register + login) with JWT sessions
- Role-based access: `admin` vs `member` (only admins manage the Team page)
- Customers CRUD (plans, status, MRR)
- Invoices CRUD (linked to customers, status tracking)
- Live dashboard stats (MRR, active subscriptions, churn rate) and charts (Chart.js)
- Activity log feed
- Team management (admin only)
- Responsive UI with mobile sidebar

## Run it
```
cd backend
npm install
npm start
```
Then open **http://localhost:5000** in your browser.

## Demo login
- Email: `admin@saasly.com`
- Password: `Admin@123`

(Or register a new account from the login page — new accounts get the `member` role.)

## Project structure
```
saas-admin-dashboard/
  backend/        Express API + static file server
    routes/       auth, customers, invoices, users, stats, activity
    middleware/   JWT auth guard
    db/           JSON file "database" (auto-seeded on first run)
    server.js
  frontend/       Login page + dashboard (HTML/CSS/JS, no build step)
```

Data is stored in `backend/data/db.json`, created automatically the first time the server runs. Delete that file to reset to the seeded demo data.
