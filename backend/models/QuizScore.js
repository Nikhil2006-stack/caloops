const mongoose = require("mongoose");

const QuizScoreSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous Coder",
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizScore", QuizScoreSchema);
