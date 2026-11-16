const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Calculation = require("../models/Calculation");
const QuizScore = require("../models/QuizScore");

const DATA_DIR = path.join(__dirname, "..", "data");
const JSON_DB_PATH = path.join(DATA_DIR, "caloops_db.json");

let isMongoConnected = false;
let dbMode = "initializing";

function ensureLocalStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    const initial = {
      calculations: [],
      quizScores: [
        {
          _id: "seed-1",
          username: "AdaLovelace",
          score: 5,
          total: 5,
          percentage: 100,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "seed-2",
          username: "EdsgerDijkstra",
          score: 5,
          total: 5,
          percentage: 100,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function readLocalStore() {
  ensureLocalStore();
  try {
    return JSON.parse(fs.readFileSync(JSON_DB_PATH, "utf-8"));
  } catch {
    return { calculations: [], quizScores: [] };
  }
}

function writeLocalStore(data) {
  ensureLocalStore();
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/caloops";
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    dbMode = "MongoDB (Mongoose)";
    console.log(`[DB] Connected to MongoDB at ${uri}`);
  } catch (err) {
    isMongoConnected = false;
    dbMode = "Local JSON Persistent Store (MongoDB Fallback)";
    ensureLocalStore();
    console.log(
      `[DB] MongoDB not reachable at ${uri} (${err.message}). Using ${dbMode}.`
    );
  }
  return { isMongoConnected, dbMode };
}

function getDbStatus() {
  return {
    isMongoConnected,
    dbMode,
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/caloops",
  };
}

async function createCalculation(payload) {
  if (isMongoConnected) {
    const doc = await Calculation.create(payload);
    return doc.toObject();
  }
  const store = readLocalStore();
  const record = {
    _id: crypto.randomUUID(),
    category: payload.category,
    operation: payload.operation,
    loopType: payload.loopType || "for/while",
    complexity: payload.complexity || "O(n)",
    inputs: payload.inputs,
    result: payload.result,
    steps: payload.steps || [],
    executionTimeMs: payload.executionTimeMs || 0,
    favorite: Boolean(payload.favorite),
    createdAt: new Date().toISOString(),
  };
  store.calculations.unshift(record);
  if (store.calculations.length > 200) {
    store.calculations = store.calculations.slice(0, 200);
  }
  writeLocalStore(store);
  return record;
}

async function getCalculations({ category, favoriteOnly, limit = 50 } = {}) {
  if (isMongoConnected) {
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (favoriteOnly) filter.favorite = true;
    return Calculation.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }
  const store = readLocalStore();
  let list = store.calculations;
  if (category && category !== "all") {
    list = list.filter((c) => c.category === category);
  }
  if (favoriteOnly) {
    list = list.filter((c) => c.favorite);
  }
  return list.slice(0, limit);
}

async function toggleFavorite(id) {
  if (isMongoConnected) {
    const doc = await Calculation.findById(id);
    if (!doc) return null;
    doc.favorite = !doc.favorite;
    await doc.save();
    return doc.toObject();
  }
  const store = readLocalStore();
  const item = store.calculations.find((c) => c._id === id);
  if (!item) return null;
  item.favorite = !item.favorite;
  writeLocalStore(store);
  return item;
}

async function deleteCalculation(id) {
  if (isMongoConnected) {
    const res = await Calculation.findByIdAndDelete(id);
    return Boolean(res);
  }
  const store = readLocalStore();
  const prevLen = store.calculations.length;
  store.calculations = store.calculations.filter((c) => c._id !== id);
  writeLocalStore(store);
  return store.calculations.length < prevLen;
}

async function clearCalculations() {
  if (isMongoConnected) {
    await Calculation.deleteMany({});
    return true;
  }
  const store = readLocalStore();
  store.calculations = [];
  writeLocalStore(store);
  return true;
}

async function getStats() {
  const calcs = await getCalculations({ limit: 500 });
  const byCategory = {};
  let totalStepsTraced = 0;
  for (const c of calcs) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    totalStepsTraced += Array.isArray(c.steps) ? c.steps.length : 0;
  }
  return {
    totalCalculations: calcs.length,
    totalStepsTraced,
    favoritesCount: calcs.filter((c) => c.favorite).length,
    byCategory,
    dbStatus: getDbStatus(),
  };
}

async function saveQuizScore({ username, score, total }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  if (isMongoConnected) {
    const doc = await QuizScore.create({
      username: username || "Anonymous Coder",
      score,
      total,
      percentage,
    });
    return doc.toObject();
  }
  const store = readLocalStore();
  const entry = {
    _id: crypto.randomUUID(),
    username: username || "Anonymous Coder",
    score,
    total,
    percentage,
    createdAt: new Date().toISOString(),
  };
  store.quizScores.push(entry);
  store.quizScores.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
  writeLocalStore(store);
  return entry;
}

async function getLeaderboard(limit = 10) {
  if (isMongoConnected) {
    return QuizScore.find({})
      .sort({ percentage: -1, score: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }
  const store = readLocalStore();
  return [...store.quizScores]
    .sort((a, b) => b.percentage - a.percentage || b.score - a.score)
    .slice(0, limit);
}

module.exports = {
  connectDB,
  getDbStatus,
  createCalculation,
  getCalculations,
  toggleFavorite,
  deleteCalculation,
  clearCalculations,
  getStats,
  saveQuizScore,
  getLeaderboard,
};
