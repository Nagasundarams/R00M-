const Log = require("../models/Log");

// Create a new log entry
exports.createLog = async (req, res) => {
  try {
    const { message, level, meta } = req.body;
    const log = new Log({ message, level, meta });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all logs (optionally filter by level)
exports.getLogs = async (req, res) => {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};
    const logs = await Log.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
