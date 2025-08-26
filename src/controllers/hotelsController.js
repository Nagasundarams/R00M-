const Hotel = require("../models/Hotel");

exports.list = async (req, res) => {
  try {
    const { location } = req.query;
    const pipeline = [
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "hotelId",
          as: "rooms",
        },
      },
      {
        $addFields: {
          activeRoomCount: {
            $size: {
              $filter: {
                input: "$rooms",
                as: "room",
                cond: { $eq: ["$$room.isActive", true] },
              },
            },
          },
          matchesLocation: location
            ? {
                $regexMatch: {
                  input: "$location",
                  regex: location,
                  options: "i",
                },
              }
            : true,
        },
      },
      {
        $sort: {
          matchesLocation: -1,
          name: 1,
        },
      },
      {
        $unset: "matchesLocation",
      },
    ];
    const hotels = await Hotel.aggregate(pipeline);
    res.json(hotels);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list hotels" });
  }
};

exports.getById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get hotel" });
  }
};

exports.create = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Create hotel failed" });
  }
};

exports.update = async (req, res) => {
  try {
    const h = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!h) return res.status(404).json({ message: "Hotel not found" });
    res.json(h);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Update hotel failed" });
  }
};

exports.remove = async (req, res) => {
  try {
    const h = await Hotel.findByIdAndDelete(req.params.id);
    if (!h) return res.status(404).json({ message: "Hotel not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Delete hotel failed" });
  }
};
