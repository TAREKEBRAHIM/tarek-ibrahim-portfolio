const express = require("express");
const { getDB, saveDB, nextId, logActivity } = require("../db/store");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  const db = getDB();
  res.json({ customers: db.customers });
});

router.post("/", (req, res) => {
  const { name, email, company, plan, status, mrr } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

  const db = getDB();
  const id = nextId(db, "customers");
  const customer = {
    id,
    name,
    email,
    company: company || name,
    plan: plan || "Starter",
    status: status || "trial",
    mrr: Number(mrr) || 0,
    joinedAt: new Date().toISOString(),
  };
  db.customers.push(customer);
  logActivity(db, `New customer added: ${name}`, "success");
  saveDB(db);
  res.status(201).json({ customer });
});

router.put("/:id", (req, res) => {
  const db = getDB();
  const customer = db.customers.find((c) => c.id === Number(req.params.id));
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  const { name, email, company, plan, status, mrr } = req.body;
  if (name !== undefined) customer.name = name;
  if (email !== undefined) customer.email = email;
  if (company !== undefined) customer.company = company;
  if (plan !== undefined) customer.plan = plan;
  if (status !== undefined) customer.status = status;
  if (mrr !== undefined) customer.mrr = Number(mrr) || 0;

  logActivity(db, `Customer updated: ${customer.name}`, "info");
  saveDB(db);
  res.json({ customer });
});

router.delete("/:id", requireAdmin, (req, res) => {
  const db = getDB();
  const customer = db.customers.find((c) => c.id === Number(req.params.id));
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  db.customers = db.customers.filter((c) => c.id !== customer.id);
  db.invoices = db.invoices.filter((i) => i.customerId !== customer.id);
  logActivity(db, `Customer removed: ${customer.name}`, "danger");
  saveDB(db);
  res.json({ message: "Customer deleted" });
});

module.exports = router;
