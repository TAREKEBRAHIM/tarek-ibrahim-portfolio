const express = require("express");
const { getDB } = require("../db/store");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  const db = getDB();
  res.json({ activity: db.activity });
});

module.exports = router;
