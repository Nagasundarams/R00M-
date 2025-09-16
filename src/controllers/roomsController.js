const Room = require("../models/Room");
const ExcelJS = require("exceljs");
const fs = require("fs");
// Bulk upload rooms via Excel
exports.bulkUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Invalid file format",
      error: "Please upload a valid Excel file (.xlsx/.xls)",
    });
  }
  const filePath = req.file.path;
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({
      success: false,
      message: "Invalid file format",
      error: "Please upload a valid Excel file (.xlsx/.xls)",
    });
  }
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      rows.push({ row, rowNumber });
    });
    const results = {
      totalProcessed: rows.length,
      successCount: 0,
      failedCount: 0,
      failedEntries: [],
    };
    const validRooms = [];
    const seenNumbers = new Set();
    for (const { row, rowNumber } of rows) {
      const [
        number,
        type,
        capacity,
        pricePerNight,
        description,
        amenities,
        status,
        floorNumber,
      ] = row.values.slice(1); // skip first empty cell
      // Basic validation
      if (
        !number ||
        !type ||
        !capacity ||
        !pricePerNight ||
        !status
      ) {
        results.failedCount++;
        results.failedEntries.push({
          rowNumber,
          error: "Missing required fields",
        });
        continue;
      }
      if (seenNumbers.has(number)) {
        results.failedCount++;
        results.failedEntries.push({
          rowNumber,
          error: "Duplicate room number in file",
        });
        continue;
      }
      seenNumbers.add(number);
      validRooms.push({
        hotelId: req.body.hotelId,
        number: String(number),
        type: String(type).toLowerCase(),
        capacity: Number(capacity),
        pricePerNight: Number(pricePerNight),
        description: description || "",
        tags: amenities ? String(amenities).split(",") : [],
        isActive: status === "Available",
        floorNumber: floorNumber ? Number(floorNumber) : undefined,
      });
    }
    // Check for duplicates in DB
    const dbNumbers = validRooms.map((r) => r.number);
    const existing = await Room.find({
      hotelId: req.body.hotelId,
      number: { $in: dbNumbers },
    }).lean();
    const existingNumbers = new Set(existing.map((r) => r.number));
    const toInsert = [];
    validRooms.forEach((room, idx) => {
      if (existingNumbers.has(room.number)) {
        results.failedCount++;
        results.failedEntries.push({
          rowNumber: rows[idx].rowNumber,
          error: "Duplicate room number in database",
        });
      } else {
        toInsert.push(room);
      }
    });
    if (toInsert.length > 0) {
      await Room.insertMany(toInsert);
      results.successCount = toInsert.length;
    }
    fs.unlinkSync(filePath);
    return res.json({
      success: true,
      message: "Rooms uploaded successfully",
      data: results,
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: err.message,
    });
  }
};

exports.listByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({
      hotelId: req.params.hotelId,
      isActive: true,
    }).lean();
    res.json(rooms);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list rooms" });
  }
};

exports.create = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Create room failed" });
  }
};

exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update room failed" });
  }
};

exports.softDelete = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Delete room failed" });
  }
};
