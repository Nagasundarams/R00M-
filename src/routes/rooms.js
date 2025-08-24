const expressRooms = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const roomsController = require("../controllers/roomsController");

const rRooms = expressRooms.Router();

// Public: list rooms for a hotel
rRooms.get("/by-hotel/:hotelId", roomsController.listByHotel);

// Admin: create room for a hotel
rRooms.post("/", requireAuth, requireAdmin, roomsController.create);

rRooms.put("/:id", requireAuth, requireAdmin, roomsController.update);

rRooms.delete("/:id", requireAuth, requireAdmin, roomsController.softDelete);

module.exports = rRooms;
