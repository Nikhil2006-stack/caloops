require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const {
  connectDB,
  getDbStatus,
  registerUser,
  loginWithPassword,
  createAndSaveOtpForMobile,
  verifyMobileOtpAndLogin,
  createAndSaveOtpForEmail,
  verifyEmailOtpAndLogin,
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
} = require("./config/db");
const { sendOtpSms } = require("./services/smsService");
const { sendEmailOtp } = require("./services/emailService");
const { executeOperation, QUIZ_QUESTIONS } = require("./engine/caloopsEngine");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================================================
// AUTHENTICATION & MOBILE OTP ROUTES
// ============================================================================

// Register with Username, Email, Mobile No, and Password
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body || {};
    const result = await registerUser({ username, email, mobile, password });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Registration failed." });
  }
});

// Login with Username, Email, OR Mobile No + Password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const result = await loginWithPassword({ identifier, password });
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Login failed." });
  }
});

// Send 6-Digit OTP to Mobile Number
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body || {};
    const { user, otpCode, mobile: cleanMobile } = await createAndSaveOtpForMobile(mobile);
    const smsReceipt = await sendOtpSms(cleanMobile, otpCode, "Login");
    return res.json({
      message: `6-digit OTP sent to mobile number ${cleanMobile}`,
      mobile: cleanMobile,
      user,
      smsReceipt,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to send OTP." });
  }
});

// Verify Mobile OTP & Login to Project
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body || {};
    const result = await verifyMobileOtpAndLogin({ mobile, otp });
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message || "OTP verification failed." });
  }
});

// Send 6-Digit OTP & One-Click Login Link to Registered Email ID
app.post("/api/auth/send-email-otp", async (req, res) => {
  try {
    const { email, baseUrl } = req.body || {};
    const { user, otpCode, email: cleanEmail } = await createAndSaveOtpForEmail(email);
    const emailReceipt = await sendEmailOtp(cleanEmail, otpCode, "login", baseUrl);
    return res.json({
      message: `6-digit Email OTP sent to registered email ${cleanEmail}`,
      email: cleanEmail,
      user,
      emailReceipt,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to send Email OTP." });
  }
});

// Verify Registered Email OTP & Login to Project
app.post("/api/auth/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    const result = await verifyEmailOtpAndLogin({ email, otp });
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Email OTP verification failed." });
  }
});

// Forgot Password — Send "Create / Update New Password" Link & OTP to Registered Email ID
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier, baseUrl } = req.body || {};
    const { otpCode, mobile, email } = await createPasswordResetOtp(identifier);
    const emailReceipt = await sendEmailOtp(email, otpCode, "reset_password", baseUrl);
    const smsReceipt = await sendOtpSms(mobile, otpCode, "Password Reset");
    return res.json({
      message: `Password reset email sent to ${email}. Click the email message to create & update your new password!`,
      mobile,
      email,
      emailReceipt,
      smsReceipt,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Could not send reset code." });
  }
});

// Reset Password with OTP & Auto-Login
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body || {};
    const result = await resetPasswordWithOtp({ identifier, otp, newPassword });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Password reset failed." });
  }
});

// Verify Session Token
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired session token." });
    }
    const user = await findUserByIdentifier(decoded.username);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    return res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

// ============================================================================
// CALCULATOR, DATABASE HISTORY & QUIZ ROUTES
// ============================================================================

// 1. Health & Database Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CALOOPS v2.0 MERN Backend",
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Execute Calculation & Persist to Database
app.post("/api/calculate", async (req, res) => {
  try {
    const { category, operation, inputs } = req.body || {};
    if (!operation) {
      return res.status(400).json({ error: "Missing 'operation' field in request body." });
    }
    const computed = executeOperation(category, operation, inputs);
    const saved = await createCalculation(computed);
    return res.json(saved);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Calculation failed." });
  }
});

// 3. Get Calculation History from Database
app.get("/api/history", async (req, res) => {
  try {
    const { category, favoriteOnly, limit } = req.query;
    const items = await getCalculations({
      category,
      favoriteOnly: favoriteOnly === "true",
      limit: Number(limit) || 50,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Toggle Favorite on a Calculation
app.patch("/api/history/:id/favorite", async (req, res) => {
  try {
    const updated = await toggleFavorite(req.params.id);
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Single History Record
app.delete("/api/history/:id", async (req, res) => {
  try {
    const ok = await deleteCalculation(req.params.id);
    res.json({ deleted: ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Clear All Calculation History
app.delete("/api/history", async (req, res) => {
  try {
    await clearCalculations();
    res.json({ cleared: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Database Analytics & Loop Trace Stats
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Quiz Questions & Leaderboard
app.get("/api/quiz", async (req, res) => {
  try {
    const leaderboard = await getLeaderboard(10);
    res.json({ questions: QUIZ_QUESTIONS, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quiz/submit", async (req, res) => {
  try {
    const { username, answers } = req.body || {};
    let score = 0;
    const review = QUIZ_QUESTIONS.map((q, idx) => {
      const userChoice = Array.isArray(answers) ? Number(answers[idx]) : -1;
      const isCorrect = userChoice === q.correctIndex;
      if (isCorrect) score++;
      return {
        id: q.id,
        question: q.question,
        userChoice,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const entry = await saveQuizScore({
      username: username || "Anonymous Coder",
      score,
      total: QUIZ_QUESTIONS.length,
    });
    const leaderboard = await getLeaderboard(10);
    res.json({ entry, review, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static production React build if available
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDist, "index.html"));
    }
  });
}

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[CALOOPS MERN Server] Running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
