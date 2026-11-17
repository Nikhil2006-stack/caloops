/**
 * CALOOPS v2.0 — Universal Full-Stack API & Cloud Persistence Client
 * Debloated via Ponytail Rung 2: Reuses backend/engine/caloopsEngine.js directly
 * instead of duplicating 535 lines of calculation engine logic.
 */

import engineModule from "../../backend/engine/caloopsEngine.js";

const { executeOperation: executeLocalOperation, QUIZ_QUESTIONS } = engineModule;
const STORAGE_KEY = "caloops_cloud_db_v2";

function getCloudStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const initial = {
    users: [
      {
        _id: "user-demo-1",
        username: "Nikhil",
        email: "nikhil@caloops.dev",
        mobile: "9876543210",
        password: "password123",
        otpCode: null,
      },
    ],
    calculations: [],
    quizScores: [
      { _id: "s1", username: "AdaLovelace", score: 5, total: 5, percentage: 100 },
      { _id: "s2", username: "EdsgerDijkstra", score: 5, total: 5, percentage: 100 },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveCloudStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizeMobile(m) {
  const d = String(m || "").replace(/\D/g, "");
  return d.length > 10 && d.startsWith("91") ? d.slice(2) : d;
}

function findCloudUser(store, identifier) {
  const id = String(identifier || "").trim().toLowerCase();
  const mob = normalizeMobile(identifier);
  return store.users.find(
    (x) =>
      x.username.toLowerCase() === id ||
      x.email.toLowerCase() === id ||
      (mob.length >= 7 && normalizeMobile(x.mobile) === mob)
  );
}

function makeCloudAuthResponse(u) {
  const safe = { _id: u._id, username: u.username, email: u.email, mobile: u.mobile };
  return { user: safe, token: btoa(JSON.stringify(safe)) };
}

async function handleCloudFallback(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const store = getCloudStore();

  if (path === "/api/auth/login" && method === "POST") {
    const u = findCloudUser(store, body.identifier);
    if (!u) throw new Error("No account found with that username, email, or mobile number.");
    if (u.password !== body.password) {
      throw new Error("Invalid password. Try 'password123' for Nikhil or use Mobile OTP.");
    }
    return makeCloudAuthResponse(u);
  }

  if (path === "/api/auth/register" && method === "POST") {
    const cleanUser = String(body.username || "").trim();
    const cleanEmail = String(body.email || "").trim().toLowerCase();
    const cleanMobile = normalizeMobile(body.mobile);
    if (!cleanUser || !cleanEmail || cleanMobile.length < 10 || !body.password) {
      throw new Error("Please fill valid username, email, 10-digit mobile number, and password.");
    }
    const u = {
      _id: "u-" + Date.now(),
      username: cleanUser,
      email: cleanEmail,
      mobile: cleanMobile,
      password: body.password,
    };
    store.users.push(u);
    saveCloudStore(store);
    return makeCloudAuthResponse(u);
  }

  if (path === "/api/auth/send-otp" && method === "POST") {
    const cleanMobile = normalizeMobile(body.mobile);
    if (cleanMobile.length < 10) throw new Error("Please enter a valid 10-digit mobile number.");
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    let u = store.users.find((x) => normalizeMobile(x.mobile) === cleanMobile);
    if (!u) {
      u = {
        _id: "u-" + Date.now(),
        username: `user_${cleanMobile.slice(-4)}`,
        email: `mobile_${cleanMobile}@caloops.dev`,
        mobile: cleanMobile,
        password: "otp_user",
      };
      store.users.push(u);
    }
    u.otpCode = otpCode;
    saveCloudStore(store);
    return {
      message: `6-digit OTP sent to +91 ${cleanMobile}`,
      mobile: cleanMobile,
      user: u,
      smsReceipt: {
        delivered: true,
        channel: "CALOOPS Cloud Mobile SMS Gateway",
        mobile: cleanMobile,
        messageText: `[CALOOPS] Your Login OTP for mobile ${cleanMobile} is ${otpCode}. Valid for 5 minutes.`,
        otpPreview: otpCode,
      },
    };
  }

  if (path === "/api/auth/verify-otp" && method === "POST") {
    const cleanMobile = normalizeMobile(body.mobile);
    const u = store.users.find((x) => normalizeMobile(x.mobile) === cleanMobile);
    if (!u || !u.otpCode) throw new Error("Please click Send OTP first.");
    if (String(u.otpCode) !== String(body.otp || "").trim()) {
      throw new Error("Invalid 6-digit OTP entered.");
    }
    u.otpCode = null;
    saveCloudStore(store);
    return makeCloudAuthResponse(u);
  }

  if (path === "/api/auth/send-email-otp" && method === "POST") {
    const cleanEmail = String(body.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid registered email address.");
    }
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    let u = store.users.find((x) => x.email.toLowerCase() === cleanEmail);
    if (!u) {
      const baseName = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "user";
      u = {
        _id: "u-" + Date.now(),
        username: `${baseName}_${Math.floor(100 + Math.random() * 900)}`,
        email: cleanEmail,
        mobile: "9876543210",
        password: "email_otp_user",
      };
      store.users.push(u);
    }
    u.otpCode = otpCode;
    saveCloudStore(store);
    const origin =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : "https://nikhil2006-stack.github.io/caloops/";
    const magicLink = `${origin.replace(/\/$/, "")}/?action=email_login&email=${encodeURIComponent(
      cleanEmail
    )}&otp=${encodeURIComponent(otpCode)}`;
    return {
      message: `6-digit Email OTP sent to registered email ${cleanEmail}`,
      email: cleanEmail,
      user: u,
      emailReceipt: {
        delivered: true,
        channel: "CALOOPS Registered Email Inbox Gateway",
        to: cleanEmail,
        subject: `[CALOOPS] Your Email Login OTP is ${otpCode} (Click to Login)`,
        otpPreview: otpCode,
        magicLink,
        purpose: "login",
        textBody: `Your CALOOPS Login OTP for ${cleanEmail} is ${otpCode}. Click the OTP button in this email message to log straight into the app!`,
      },
    };
  }

  if (path === "/api/auth/verify-email-otp" && method === "POST") {
    const cleanEmail = String(body.email || "").trim().toLowerCase();
    const u = store.users.find((x) => x.email.toLowerCase() === cleanEmail);
    if (!u || !u.otpCode) throw new Error("Please click Send Email OTP first.");
    if (String(u.otpCode) !== String(body.otp || "").trim()) {
      throw new Error("Invalid 6-digit Email OTP entered.");
    }
    u.otpCode = null;
    saveCloudStore(store);
    return makeCloudAuthResponse(u);
  }

  if (path === "/api/auth/forgot-password" && method === "POST") {
    let u = findCloudUser(store, body.identifier);
    const rawId = String(body.identifier || "").trim().toLowerCase();
    if (!u && rawId.includes("@")) {
      const baseName = rawId.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "user";
      u = {
        _id: "u-" + Date.now(),
        username: `${baseName}_${Math.floor(100 + Math.random() * 900)}`,
        email: rawId,
        mobile: "9876543210",
        password: "reset_user",
      };
      store.users.push(u);
    }
    if (!u) throw new Error("Account not found.");
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    u.otpCode = otpCode;
    saveCloudStore(store);
    const origin =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : "https://nikhil2006-stack.github.io/caloops/";
    const magicLink = `${origin.replace(/\/$/, "")}/?action=reset_password&email=${encodeURIComponent(
      u.email
    )}&otp=${encodeURIComponent(otpCode)}`;
    return {
      message: `Password reset email sent to ${u.email}. Click the email message to create & update your new password!`,
      mobile: u.mobile,
      email: u.email,
      emailReceipt: {
        delivered: true,
        channel: "CALOOPS Registered Email Inbox Gateway",
        to: u.email,
        subject: `[CALOOPS] Create or Update Your New Password (OTP: ${otpCode})`,
        otpPreview: otpCode,
        magicLink,
        purpose: "reset_password",
        textBody: `Click this email message to create a new password and update your password for ${u.email}.`,
      },
      smsReceipt: {
        delivered: true,
        channel: "CALOOPS Cloud SMS",
        mobile: u.mobile,
        messageText: `[CALOOPS] Your Password Reset OTP is ${otpCode}.`,
        otpPreview: otpCode,
      },
    };
  }

  if (path === "/api/auth/reset-password" && method === "POST") {
    const u = findCloudUser(store, body.identifier);
    if (!u || String(u.otpCode) !== String(body.otp || "").trim()) {
      throw new Error("Invalid Reset OTP.");
    }
    u.password = body.newPassword;
    u.otpCode = null;
    saveCloudStore(store);
    return makeCloudAuthResponse(u);
  }

  if (path === "/api/auth/me") {
    const tok = (options.headers?.Authorization || "").replace("Bearer ", "");
    return { user: JSON.parse(atob(tok)) };
  }

  if (path === "/api/calculate" && method === "POST") {
    const computed = executeLocalOperation(body.category, body.operation, body.inputs);
    const rec = { _id: "c-" + Date.now(), favorite: false, createdAt: new Date().toISOString(), ...computed };
    store.calculations.unshift(rec);
    saveCloudStore(store);
    return rec;
  }

  if (path.startsWith("/api/history")) {
    if (method === "GET") {
      return path.includes("favoriteOnly=true")
        ? store.calculations.filter((c) => c.favorite)
        : store.calculations;
    }
    if (method === "PATCH") {
      const id = path.split("/")[3];
      const item = store.calculations.find((c) => c._id === id);
      if (item) item.favorite = !item.favorite;
      saveCloudStore(store);
      return item;
    }
    if (method === "DELETE") {
      const id = path.split("/")[3];
      store.calculations = id ? store.calculations.filter((c) => c._id !== id) : [];
      saveCloudStore(store);
      return { deleted: true };
    }
  }

  if (path === "/api/stats") {
    const totalStepsTraced = store.calculations.reduce((s, c) => s + (c.steps?.length || 0), 0);
    return {
      totalCalculations: store.calculations.length,
      totalStepsTraced,
      dbStatus: { dbMode: "Cloud Browser DB + MERN Sync" },
    };
  }

  if (path === "/api/quiz" && method === "GET") {
    return { questions: QUIZ_QUESTIONS, leaderboard: store.quizScores };
  }

  if (path === "/api/quiz/submit" && method === "POST") {
    let score = 0;
    const review = QUIZ_QUESTIONS.map((q, idx) => {
      const userChoice = Array.isArray(body.answers) ? Number(body.answers[idx]) : -1;
      const isCorrect = userChoice === q.correctIndex;
      if (isCorrect) score++;
      return { id: q.id, question: q.question, userChoice, correctIndex: q.correctIndex, isCorrect, explanation: q.explanation };
    });
    const entry = {
      _id: "q-" + Date.now(),
      username: body.username || "Nikhil",
      score,
      total: QUIZ_QUESTIONS.length,
      percentage: Math.round((score / QUIZ_QUESTIONS.length) * 100),
    };
    store.quizScores.push(entry);
    store.quizScores.sort((a, b) => b.percentage - a.percentage);
    saveCloudStore(store);
    return { entry, review, leaderboard: store.quizScores };
  }

  return {};
}

export async function apiRequest(path, options = {}) {
  try {
    const res = await fetch(path, options);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    }
    return await handleCloudFallback(path, options);
  } catch (err) {
    if (
      err.message &&
      !err.message.includes("Failed to fetch") &&
      !err.message.includes("NetworkError") &&
      !err.message.includes("JSON")
    ) {
      throw err;
    }
    return await handleCloudFallback(path, options);
  }
}
