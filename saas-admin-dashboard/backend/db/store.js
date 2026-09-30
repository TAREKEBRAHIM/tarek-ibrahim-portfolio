const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function seedData() {
  const now = Date.now();
  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

  return {
    users: [
      {
        id: 1,
        name: "Alex Morgan",
        email: "admin@saasly.com",
        passwordHash: bcrypt.hashSync("Admin@123", 10),
        role: "admin",
        seed: "Alex Morgan",
        createdAt: daysAgo(120),
      },
      {
        id: 2,
        name: "Priya Sharma",
        email: "member@saasly.com",
        passwordHash: bcrypt.hashSync("Member@123", 10),
        role: "member",
        seed: "Priya Sharma",
        createdAt: daysAgo(60),
      },
    ],
    customers: [
      { id: 1, name: "Nova Studio", email: "hello@novastudio.io", company: "Nova Studio", plan: "Pro", status: "active", mrr: 79, joinedAt: daysAgo(200) },
      { id: 2, name: "Brightline Labs", email: "team@brightline.dev", company: "Brightline Labs", plan: "Enterprise", status: "active", mrr: 299, joinedAt: daysAgo(180) },
      { id: 3, name: "PixelForge", email: "hi@pixelforge.co", company: "PixelForge", plan: "Starter", status: "trial", mrr: 0, joinedAt: daysAgo(5) },
      { id: 4, name: "Northwind Co", email: "contact@northwind.co", company: "Northwind Co", plan: "Pro", status: "active", mrr: 79, joinedAt: daysAgo(150) },
      { id: 5, name: "Vertex Analytics", email: "ops@vertexanalytics.com", company: "Vertex Analytics", plan: "Enterprise", status: "active", mrr: 299, joinedAt: daysAgo(300) },
      { id: 6, name: "Cloudnest", email: "support@cloudnest.app", company: "Cloudnest", plan: "Starter", status: "churned", mrr: 0, joinedAt: daysAgo(220) },
      { id: 7, name: "Lumen Works", email: "team@lumenworks.io", company: "Lumen Works", plan: "Pro", status: "active", mrr: 79, joinedAt: daysAgo(90) },
      { id: 8, name: "Datastream", email: "hello@datastream.ai", company: "Datastream", plan: "Enterprise", status: "active", mrr: 299, joinedAt: daysAgo(45) },
      { id: 9, name: "Fern & Co", email: "info@fernco.com", company: "Fern & Co", plan: "Starter", status: "trial", mrr: 0, joinedAt: daysAgo(2) },
      { id: 10, name: "Skyline Retail", email: "biz@skylineretail.com", company: "Skyline Retail", plan: "Pro", status: "active", mrr: 79, joinedAt: daysAgo(400) },
    ],
    invoices: [
      { id: 1, customerId: 1, amount: 79, status: "paid", date: daysAgo(28) },
      { id: 2, customerId: 2, amount: 299, status: "paid", date: daysAgo(25) },
      { id: 3, customerId: 4, amount: 79, status: "paid", date: daysAgo(20) },
      { id: 4, customerId: 5, amount: 299, status: "overdue", date: daysAgo(40) },
      { id: 5, customerId: 7, amount: 79, status: "pending", date: daysAgo(3) },
      { id: 6, customerId: 8, amount: 299, status: "paid", date: daysAgo(10) },
      { id: 7, customerId: 10, amount: 79, status: "paid", date: daysAgo(55) },
      { id: 8, customerId: 2, amount: 299, status: "pending", date: daysAgo(1) },
    ],
    activity: [
      { id: 1, message: "Vertex Analytics invoice marked overdue", type: "warning", createdAt: daysAgo(1) },
      { id: 2, message: "Fern & Co started a free trial", type: "info", createdAt: daysAgo(2) },
      { id: 3, message: "Datastream upgraded to Enterprise", type: "success", createdAt: daysAgo(5) },
      { id: 4, message: "Cloudnest subscription churned", type: "danger", createdAt: daysAgo(15) },
      { id: 5, message: "Priya Sharma joined the team", type: "info", createdAt: daysAgo(60) },
    ],
    nextIds: { users: 3, customers: 11, invoices: 9, activity: 6 },
  };
}

function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData(), null, 2));
  }
}

function getDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function nextId(db, key) {
  const id = db.nextIds[key];
  db.nextIds[key] += 1;
  return id;
}

function logActivity(db, message, type = "info") {
  const id = nextId(db, "activity");
  db.activity.unshift({ id, message, type, createdAt: new Date().toISOString() });
  db.activity = db.activity.slice(0, 50);
}

module.exports = { getDB, saveDB, nextId, logActivity };
