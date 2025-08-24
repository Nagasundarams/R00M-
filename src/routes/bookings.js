const expressBookings = require("express");
const { requireAuth } = require("../middleware/auth");
const bookingsController = require("../controllers/bookingsController");
// added imports
const mongoose = require("mongoose");

const rBookings = expressBookings.Router();

// helper to sanitize and validate ObjectId-like strings
function sanitizeObjectId(input) {
  const s = String(input || "")
    .trim()
    .replace(/^:+/, "");
  return mongoose.Types.ObjectId.isValid(s) ? s : null;
}

// Create booking for a room (conflict-safe via overlap query)
rBookings.post("/", requireAuth, bookingsController.create);

// move this availability route ABOVE any '/:id' routes
rBookings.get("/availability/:roomId", bookingsController.availability);

// Read booking (own)
rBookings.get("/:id", requireAuth, bookingsController.getOwnById);

// Update booking (own)
rBookings.patch("/:id", requireAuth, bookingsController.update);

// Cancel booking (own)
rBookings.delete("/:id", requireAuth, bookingsController.cancel);

module.exports = rBookings;
