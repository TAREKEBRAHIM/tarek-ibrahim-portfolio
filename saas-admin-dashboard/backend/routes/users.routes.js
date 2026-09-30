const express = require("express");
const bcrypt = require("bcryptjs");
const { getDB, saveDB, nextId, logActivity } = require("../db/store");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.get("/", (req, res) => {
  const db = getDB();
  res.json({ users: db.users.map(sanitize) });
});

router.post("/", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });

  const db = getDB();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const id = nextId(db, "users");
  const user = {
    id,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === "admin" ? "admin" : "member",
    seed: name,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  logActivity(db, `Team member added: ${name}`, "success");
  saveDB(db);
  res.status(201).json({ user: sanitize(user) });
});

router.put("/:id", (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, role } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role === "admin" ? "admin" : "member";

  saveDB(db);
  res.json({ user: sanitize(user) });
});

router.delete("/:id", (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.id === req.user.id) return res.status(400).json({ message: "You cannot delete your own account" });

  db.users = db.users.filter((u) => u.id !== user.id);
  logActivity(db, `Team member removed: ${user.name}`, "danger");
  saveDB(db);
  res.json({ message: "User deleted" });
});

module.exports = router;
