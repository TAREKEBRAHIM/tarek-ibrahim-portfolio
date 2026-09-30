const express = require("express");
const { getDB, saveDB, nextId, logActivity } = require("../db/store");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  const db = getDB();
  const invoices = db.invoices.map((inv) => {
    const customer = db.customers.find((c) => c.id === inv.customerId);
    return { ...inv, customerName: customer ? customer.name : "Unknown" };
  });
  res.json({ invoices });
});

router.post("/", (req, res) => {
  const { customerId, amount, status } = req.body;
  const db = getDB();
  const customer = db.customers.find((c) => c.id === Number(customerId));
  if (!customer) return res.status(400).json({ message: "Invalid customer" });

  const id = nextId(db, "invoices");
  const invoice = {
    id,
    customerId: customer.id,
    amount: Number(amount) || 0,
    status: status || "pending",
    date: new Date().toISOString(),
  };
  db.invoices.push(invoice);
  logActivity(db, `Invoice created for ${customer.name}`, "info");
  saveDB(db);
  res.status(201).json({ invoice: { ...invoice, customerName: customer.name } });
});

router.put("/:id", (req, res) => {
  const db = getDB();
  const invoice = db.invoices.find((i) => i.id === Number(req.params.id));
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const { amount, status } = req.body;
  if (amount !== undefined) invoice.amount = Number(amount) || 0;
  if (status !== undefined) invoice.status = status;

  saveDB(db);
  res.json({ invoice });
});

router.delete("/:id", requireAdmin, (req, res) => {
  const db = getDB();
  const invoice = db.invoices.find((i) => i.id === Number(req.params.id));
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  db.invoices = db.invoices.filter((i) => i.id !== invoice.id);
  saveDB(db);
  res.json({ message: "Invoice deleted" });
});

module.exports = router;
