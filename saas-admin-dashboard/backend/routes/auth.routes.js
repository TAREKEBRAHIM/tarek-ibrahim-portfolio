const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB, saveDB, nextId, logActivity } = require("../db/store");
const { authenticate, SECRET } = require("../middleware/auth");

const router = express.Router();

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function issueToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

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
    role: "member",
    seed: name,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  logActivity(db, `${name} created a new account`, "info");
  saveDB(db);

  res.status(201).json({ token: issueToken(user), user: sanitize(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email || "").toLowerCase());

  if (!user || !bcrypt.compareSync(String(password || ""), user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ token: issueToken(user), user: sanitize(user) });
});

router.get("/me", authenticate, (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: sanitize(user) });
});

module.exports = router;
