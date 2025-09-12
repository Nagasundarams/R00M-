const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logsController");

// POST /logs - Create a new log entry
router.post("/", logsController.createLog);

// GET /logs - Retrieve all logs (optionally filter by level)
router.get("/", logsController.getLogs);

module.exports = router;
