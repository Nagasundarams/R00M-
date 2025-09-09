const express = require("express");
const { requireAuth } = require("../middleware/auth");
const bookController = require("../controllers/bookingsController");

const router = express.Router();

// Create booking for a room
router.post("/", requireAuth, bookController.create);

// checking availability for a room
router.get("/availability/:roomId", requireAuth, bookController.availability);

// Read booking
router.get("/:id", requireAuth, bookController.getOwnById);

// Update booking
router.patch("/:id", requireAuth, bookController.update);

// Cancel booking
router.delete("/:id", requireAuth, bookController.cancel);

module.exports = router;
