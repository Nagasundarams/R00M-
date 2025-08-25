const expressHotels = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const hotelsController = require("../controllers/hotelsController");

const routerHotels = expressHotels.Router();

// List all hotels (public)
routerHotels.get("/", hotelsController.list);

// Get single hotel
routerHotels.get("/:id", hotelsController.getById);

// Admin create/update/delete
routerHotels.post("/", requireAuth, requireAdmin, hotelsController.create);

routerHotels.put("/:id", requireAuth, requireAdmin, hotelsController.update);

routerHotels.delete("/:id", requireAuth, requireAdmin, hotelsController.remove);

module.exports = routerHotels;
