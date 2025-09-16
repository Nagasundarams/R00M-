const Room = require("../models/Room");
const ExcelJS = require('exceljs');
const fs = require('fs').promises;

exports.bulkUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
      error: "Please upload an Excel file"
    });
  }

  const workbook = new ExcelJS.Workbook();
  const results = {
    success: true,
    message: "Rooms upload processed",
    data: {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      failedEntries: []
    }
  };

  try {
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    
    // Validate worksheet structure
    const expectedHeaders = [
      'Room Number',
      'Room Type',
      'Capacity',
      'Price per Night',
      'Description',
      'Amenities',
      'Status',
      'Floor Number'
    ];

    const headers = worksheet.getRow(1).values.slice(1); // Skip first empty cell
    const isValidHeaders = expectedHeaders.every((header, index) => 
      headers[index]?.toLowerCase() === header.toLowerCase()
    );

    if (!isValidHeaders) {
      throw new Error('Invalid Excel format: Missing or incorrect column headers');
    }

    const rooms = [];
    const errors = [];

    // Process each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      try {
        const [, roomNumber, roomType, capacity, pricePerNight, description, amenitiesStr, status, floorNumber] = row.values;
        
        // Validate required fields
        if (!roomNumber || !roomType || !capacity || !pricePerNight) {
          throw new Error('Missing required fields');
        }

  // Parse amenities from comma-separated string
  const amenities = (amenitiesStr ?? '').split(',').map(item => item.trim());

        // Validate status
        const validStatus = ['Available', 'Maintenance'];
        if (!validStatus.includes(status)) {
          throw new Error('Invalid status. Must be either Available or Maintenance');
        }

        rooms.push({
          roomNumber: roomNumber.toString(),
          roomType,
          capacity: parseInt(capacity),
          pricePerNight: parseFloat(pricePerNight),
          description,
          amenities,
          status,
          floorNumber: parseInt(floorNumber),
          isActive: true
        });

      } catch (error) {
        errors.push({
          rowNumber,
          error: error.message
        });
      }
    });

    // Process valid rooms in batches
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < rooms.length; i += batchSize) {
      batches.push(rooms.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const createResults = await Promise.allSettled(batch.map(room => Room.create(room)));
      createResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.data.successCount++;
        } else {
          results.data.failedCount++;
          results.data.failedEntries.push({
            rowNumber: batch[index].rowNumber,
            error: result.reason.message
          });
        }
      });
    }

    results.data.totalProcessed = rooms.length;
    results.data.failedEntries.push(...errors);
    results.data.failedCount += errors.length;


    // Clean up the uploaded file
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path);
    }

    res.json(results);

  } catch (error) {
    // Clean up the uploaded file
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to process Excel file",
      error: error.message
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
