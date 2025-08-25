const expressBookings = require("express");
const { requireAuth } = require("../middleware/auth");
const bookingsController = require("../controllers/bookingsController");

const routerBookings = expressBookings.Router();

// Create booking for a room
routerBookings.post("/", requireAuth, bookingsController.create);

// checking availability for a room
routerBookings.get(
  "/availability/:roomId",
  requireAuth,
  bookingsController.availability
);

// Read booking
routerBookings.get("/:id", requireAuth, bookingsController.getOwnById);

// Update booking
routerBookings.patch("/:id", requireAuth, bookingsController.update);

// Cancel booking
routerBookings.delete("/:id", requireAuth, bookingsController.cancel);

module.exports = routerBookings;
