const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ["info", "warn", "error"], default: "info" },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
