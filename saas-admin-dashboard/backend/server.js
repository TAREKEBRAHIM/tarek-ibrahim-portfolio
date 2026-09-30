const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customers.routes");
const invoiceRoutes = require("./routes/invoices.routes");
const userRoutes = require("./routes/users.routes");
const statsRoutes = require("./routes/stats.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/activity", activityRoutes);

app.use(express.static(FRONTEND_DIR));

// SPA-style fallback: unmatched non-API GET requests land on the login page
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "login.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SaaS Admin Dashboard running at http://localhost:${PORT}`);
});
