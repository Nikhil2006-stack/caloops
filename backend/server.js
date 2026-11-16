require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const {
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
} = require("./config/db");
const { executeOperation, QUIZ_QUESTIONS } = require("./engine/caloopsEngine");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
