const expressRooms = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const roomsController = require("../controllers/roomsController");
const multer = require("multer");

// Configure multer for excel file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

// Admin: bulk upload rooms using Excel file
routerRooms.post(
  "/bulk-upload",
  requireAuth,
  requireAdmin,
  upload.single('file'),
  roomsController.bulkUpload
);

module.exports = routerRooms;
