const expressRooms = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const roomsController = require("../controllers/roomsController");

const routerRooms = expressRooms.Router();


// Public: list rooms for a hotel
routerRooms.get("/by-hotel/:hotelId", roomsController.listByHotel);

// Admin: create room for a hotel
routerRooms.post("/", requireAuth, requireAdmin, roomsController.create);

routerRooms.put("/:id", requireAuth, requireAdmin, roomsController.update);

routerRooms.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  roomsController.softDelete
);

module.exports = routerRooms;
