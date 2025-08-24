const Room = require("../models/Room");

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
