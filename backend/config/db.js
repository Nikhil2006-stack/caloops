const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Calculation = require("../models/Calculation");
const QuizScore = require("../models/QuizScore");
const User = require("../models/User");

const DATA_DIR = path.join(__dirname, "..", "data");
const JSON_DB_PATH = path.join(DATA_DIR, "caloops_db.json");
const TOKEN_SECRET = process.env.JWT_SECRET || "caloops-mern-secret-key-2026";

let isMongoConnected = false;
let dbMode = "initializing";

function hashPassword(password) {
  const salt = "caloops_salt_v2";
  return crypto.pbkdf2Sync(String(password), salt, 10000, 32, "sha256").toString("hex");
}

function verifyPassword(password, storedHash) {
  const candidate = Buffer.from(hashPassword(password), "utf-8");
  const expected = Buffer.from(String(storedHash || ""), "utf-8");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function normalizeMobile(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

function signAuthToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const dataB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(dataB64).digest("base64url");
  return `${dataB64}.${sig}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [dataB64, sig] = token.split(".");
  const expectedSig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(dataB64)
    .digest("base64url");
  const sigBuf = Buffer.from(String(sig || ""), "utf-8");
  const expBuf = Buffer.from(expectedSig, "utf-8");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function sanitizeUser(u) {
  if (!u) return null;
  return {
    _id: u._id,
    username: u.username,
    email: u.email,
    mobile: u.mobile,
    createdAt: u.createdAt,
  };
}

function ensureLocalStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    const initial = {
      users: [
        {
          _id: "user-demo-1",
          username: "Nikhil",
          email: "nikhil@caloops.dev",
          mobile: "9876543210",
          passwordHash: hashPassword("password123"),
          otpCode: null,
          otpExpiresAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
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
    const parsed = JSON.parse(fs.readFileSync(JSON_DB_PATH, "utf-8"));
    if (!Array.isArray(parsed.users)) {
      parsed.users = [
        {
          _id: "user-demo-1",
          username: "Nikhil",
          email: "nikhil@caloops.dev",
          mobile: "9876543210",
          passwordHash: hashPassword("password123"),
          otpCode: null,
          otpExpiresAt: null,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    if (!Array.isArray(parsed.calculations)) parsed.calculations = [];
    if (!Array.isArray(parsed.quizScores)) parsed.quizScores = [];
    return parsed;
  } catch {
    return { users: [], calculations: [], quizScores: [] };
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

// ============================================================================
// USER AUTHENTICATION & MOBILE OTP REPOSITORY METHODS
// ============================================================================

async function findUserByIdentifier(identifier) {
  const raw = String(identifier || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const normMob = normalizeMobile(raw);

  if (isMongoConnected) {
    const orConditions = [{ username: raw }, { email: lower }];
    if (normMob.length >= 7) {
      orConditions.push({ mobile: normMob }, { mobile: raw });
    }
    return User.findOne({ $or: orConditions }).lean();
  }

  const store = readLocalStore();
  return (
    store.users.find(
      (u) =>
        u.username.toLowerCase() === lower ||
        u.email.toLowerCase() === lower ||
        (normMob.length >= 7 && normalizeMobile(u.mobile) === normMob)
    ) || null
  );
}

async function registerUser({ username, email, mobile, password }) {
  const cleanUser = String(username || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanMobile = normalizeMobile(mobile);

  if (!cleanUser || !cleanEmail || !cleanMobile || !password) {
    throw new Error("Username, email, mobile number, and password are all required.");
  }
  if (cleanMobile.length < 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }
  if (String(password).length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const existingUser = await findUserByIdentifier(cleanUser);
  if (existingUser) throw new Error("Username is already registered.");
  const existingEmail = await findUserByIdentifier(cleanEmail);
  if (existingEmail) throw new Error("Email is already registered.");
  const existingMobile = await findUserByIdentifier(cleanMobile);
  if (existingMobile) throw new Error("Mobile number is already registered.");

  const passwordHash = hashPassword(password);

  if (isMongoConnected) {
    const doc = await User.create({
      username: cleanUser,
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash,
    });
    const obj = doc.toObject();
    return { user: sanitizeUser(obj), token: signAuthToken(obj) };
  }

  const store = readLocalStore();
  const newUser = {
    _id: crypto.randomUUID(),
    username: cleanUser,
    email: cleanEmail,
    mobile: cleanMobile,
    passwordHash,
    otpCode: null,
    otpExpiresAt: null,
    createdAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  writeLocalStore(store);
  return { user: sanitizeUser(newUser), token: signAuthToken(newUser) };
}

async function loginWithPassword({ identifier, password }) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new Error("No account found with that username, email, or mobile number.");
  }
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid password. Please try again or use Forgot Password / Mobile OTP.");
  }
  return { user: sanitizeUser(user), token: signAuthToken(user) };
}

async function createAndSaveOtpForMobile(mobileInput) {
  const cleanMobile = normalizeMobile(mobileInput);
  if (cleanMobile.length < 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  const otpCode = String(crypto.randomInt(100000, 999999));
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  if (isMongoConnected) {
    let user = await User.findOne({ mobile: cleanMobile });
    if (!user) {
      // Auto-provision mobile user account so any mobile number can log in via OTP immediately
      user = await User.create({
        username: `user_${cleanMobile.slice(-4)}`,
        email: `mobile_${cleanMobile}@caloops.dev`,
        mobile: cleanMobile,
        passwordHash: hashPassword(crypto.randomUUID()),
        otpCode,
        otpExpiresAt,
      });
    } else {
      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    }
    return { user: sanitizeUser(user.toObject()), otpCode, mobile: cleanMobile };
  }

  const store = readLocalStore();
  let user = store.users.find((u) => normalizeMobile(u.mobile) === cleanMobile);
  if (!user) {
    user = {
      _id: crypto.randomUUID(),
      username: `user_${cleanMobile.slice(-4)}`,
      email: `mobile_${cleanMobile}@caloops.dev`,
      mobile: cleanMobile,
      passwordHash: hashPassword(crypto.randomUUID()),
      otpCode,
      otpExpiresAt,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  } else {
    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
  }
  writeLocalStore(store);
  return { user: sanitizeUser(user), otpCode, mobile: cleanMobile };
}

async function verifyMobileOtpAndLogin({ mobile, otp }) {
  const cleanMobile = normalizeMobile(mobile);
  const cleanOtp = String(otp || "").trim();
  if (!cleanMobile || !cleanOtp) {
    throw new Error("Mobile number and 6-digit OTP are required.");
  }

  if (isMongoConnected) {
    const user = await User.findOne({ mobile: cleanMobile });
    if (!user || !user.otpCode) {
      throw new Error("No active OTP found for this mobile number. Please click Send OTP first.");
    }
    if (new Date() > new Date(user.otpExpiresAt)) {
      throw new Error("OTP has expired. Please request a new OTP.");
    }
    if (user.otpCode !== cleanOtp) {
      throw new Error("Invalid OTP code entered. Please check the 6-digit code and try again.");
    }
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();
    const obj = user.toObject();
    return { user: sanitizeUser(obj), token: signAuthToken(obj) };
  }

  const store = readLocalStore();
  const user = store.users.find((u) => normalizeMobile(u.mobile) === cleanMobile);
  if (!user || !user.otpCode) {
    throw new Error("No active OTP found for this mobile number. Please click Send OTP first.");
  }
  if (new Date() > new Date(user.otpExpiresAt)) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }
  if (user.otpCode !== cleanOtp) {
    throw new Error("Invalid OTP code entered. Please check the 6-digit code and try again.");
  }
  user.otpCode = null;
  user.otpExpiresAt = null;
  writeLocalStore(store);
  return { user: sanitizeUser(user), token: signAuthToken(user) };
}

async function createPasswordResetOtp(identifier) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new Error("No account found matching that username, email, or mobile number.");
  }
  const otpCode = String(crypto.randomInt(100000, 999999));
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  if (isMongoConnected) {
    await User.updateOne({ _id: user._id }, { $set: { otpCode, otpExpiresAt } });
  } else {
    const store = readLocalStore();
    const target = store.users.find((u) => u._id === user._id);
    if (target) {
      target.otpCode = otpCode;
      target.otpExpiresAt = otpExpiresAt;
      writeLocalStore(store);
    }
  }
  return { user: sanitizeUser(user), otpCode, mobile: user.mobile, email: user.email };
}

async function resetPasswordWithOtp({ identifier, otp, newPassword }) {
  const user = await findUserByIdentifier(identifier);
  if (!user || !user.otpCode) {
    throw new Error("No active reset OTP found. Please request a reset code first.");
  }
  if (new Date() > new Date(user.otpExpiresAt)) {
    throw new Error("Reset OTP has expired. Please request a new one.");
  }
  if (String(user.otpCode) !== String(otp || "").trim()) {
    throw new Error("Invalid reset OTP code.");
  }
  if (!newPassword || String(newPassword).length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }
  const newHash = hashPassword(newPassword);

  if (isMongoConnected) {
    const doc = await User.findById(user._id);
    doc.passwordHash = newHash;
    doc.otpCode = null;
    doc.otpExpiresAt = null;
    await doc.save();
    const obj = doc.toObject();
    return { user: sanitizeUser(obj), token: signAuthToken(obj) };
  }

  const store = readLocalStore();
  const target = store.users.find((u) => u._id === user._id);
  target.passwordHash = newHash;
  target.otpCode = null;
  target.otpExpiresAt = null;
  writeLocalStore(store);
  return { user: sanitizeUser(target), token: signAuthToken(target) };
}

// ============================================================================
// CALCULATION & QUIZ REPOSITORY METHODS
// ============================================================================

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
  registerUser,
  loginWithPassword,
  createAndSaveOtpForMobile,
  verifyMobileOtpAndLogin,
  createPasswordResetOtp,
  resetPasswordWithOtp,
  verifyAuthToken,
  findUserByIdentifier,
  createCalculation,
  getCalculations,
  toggleFavorite,
  deleteCalculation,
  clearCalculations,
  getStats,
  saveQuizScore,
  getLeaderboard,
};
