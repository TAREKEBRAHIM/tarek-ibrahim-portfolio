const express = require("express");
const { getDB } = require("../db/store");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/overview", (req, res) => {
  const db = getDB();
  const { customers, invoices } = db;

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active");
  const trialCustomers = customers.filter((c) => c.status === "trial");
  const churnedCustomers = customers.filter((c) => c.status === "churned");
  const mrr = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
  const churnRate = totalCustomers ? Number(((churnedCustomers.length / totalCustomers) * 100).toFixed(1)) : 0;

  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  // Revenue trend for the last 6 months based on invoice dates
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear(), total: 0 });
  }
  invoices.forEach((inv) => {
    const d = new Date(inv.date);
    const bucket = months.find((m) => m.month === d.getMonth() && m.year === d.getFullYear());
    if (bucket) bucket.total += inv.amount;
  });

  const planCounts = customers.reduce((acc, c) => {
    acc[c.plan] = (acc[c.plan] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalCustomers,
    activeSubscriptions: activeCustomers.length,
    trialCount: trialCustomers.length,
    churnRate,
    mrr,
    paidRevenue,
    outstanding,
    revenueTrend: months.map((m) => ({ label: m.label, total: m.total })),
    plansBreakdown: Object.entries(planCounts).map(([plan, count]) => ({ plan, count })),
  });
});

module.exports = router;
