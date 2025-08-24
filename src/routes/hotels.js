const expressHotels = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const hotelsController = require("../controllers/hotelsController");

const rHotels = expressHotels.Router();

// List all hotels (public)
rHotels.get("/", hotelsController.list);

// Get single hotel
rHotels.get("/:id", hotelsController.getById);

// Admin create/update/delete
rHotels.post("/", requireAuth, requireAdmin, hotelsController.create);

rHotels.put("/:id", requireAuth, requireAdmin, hotelsController.update);

rHotels.delete("/:id", requireAuth, requireAdmin, hotelsController.remove);

module.exports = rHotels;
