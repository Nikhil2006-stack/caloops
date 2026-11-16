const mongoose = require("mongoose");

const CalculationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },
    operation: {
      type: String,
      required: true,
      index: true,
    },
    loopType: {
      type: String,
      default: "for/while",
    },
    complexity: {
      type: String,
      default: "O(n)",
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    steps: {
      type: [String],
      default: [],
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Calculation", CalculationSchema);
