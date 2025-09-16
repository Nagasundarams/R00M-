const expressRooms = require("express");
const multer = require("multer");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const roomsController = require("../controllers/roomsController");

const routerRooms = expressRooms.Router();
const upload = multer({ dest: "uploads/" });
// Admin: bulk upload rooms via Excel
routerRooms.post(
  "/bulk-upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  roomsController.bulkUpload
);

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
