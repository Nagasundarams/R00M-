const dayjs = require("dayjs");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const mongoose = require("mongoose");

function normalizeRange(fromStr, toStr) {
  const from = dayjs(fromStr).startOf("day").toDate();
  const to = dayjs(toStr).startOf("day").toDate();
  if (!(from < to)) throw new Error("Invalid range");
  return { from, to };
}

async function create(req, res) {
  const session = await mongoose.startSession();
  try {
    // comment for research git
    const { roomId, from: fromStr, to: toStr, guests, hotelId } = req.body;
    const { from, to } = normalizeRange(fromStr, toStr);

    let booking;
    await session.withTransaction(async () => {
      const room = await Room.findById(roomId);
      if (!room || !room.isActive)
        return res.status(404).json({ message: "Room not found" });
      const conflict = await Booking.hasOverlap({ roomId, from, to, session });
      if (conflict) {
        throw new Error("Room not available");
      }

      const nights = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * room.pricePerNight;

      const idemKey = req.header("Idempotency-Key") || undefined;
      if (idemKey) {
        const existing = await Booking.findOne({
          idempotencyKey: idemKey,
          userId: req.user.id,
        }).session(session);
        if (existing) return res.status(200).json(existing);
      }

      const newbooking = await Booking.create(
        [
          {
            userId: req.user.id,
            roomId,
            from,
            to,
            nights,
            totalPrice,
            guests,
            hotelId,
            status: "confirmed",
            idempotencyKey: idemKey,
          },
        ],
        { session }
      );

      booking = newbooking[0];
    });

    res.status(201).json(booking);
  } catch (e) {
    if (e.message === "Invalid range")
      return res.status(400).json({ message: e.message });
    console.error(e);
    res.status(500).json({ message: "Create booking failed" });
  } finally {
    await session.endSession();
  }
}

async function getOwnById(req, res) {
  const userId = req.params.id;
  try {
    const bookings = await Booking.find({
      userId: userId,
    })
      .populate({ path: "roomId", populate: { path: "hotelId" } })
      .lean();

    if (!bookings || bookings.length === 0) {
      return res
        .status(200)
        .json({ message: "No bookings found for this user" });
    }

    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Get bookings failed" });
  }
}

async function availability(req, res) {
  try {
    const roomId = req.params.roomId;

    const { from: fromStr, to: toStr } = req.query;
    const { from, to } = normalizeRange(fromStr, toStr);

    const conflict = await Booking.hasOverlap({ roomId, from, to });
    res.json({ available: !conflict });
  } catch (e) {
    return res.status(400).json({ message: "Bad date range" });
  }
}

async function update(req, res) {
  let session;
  try {
    const { checkIn: fromStr, checkOut: toStr } = req.body;
    const { from, to } = normalizeRange(fromStr, toStr);

    session = await mongoose.startSession();
    session.startTransaction();

    const bookingID = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingID,
    }).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    const conflict = await Booking.hasOverlap({
      roomId: booking.roomId,
      from,
      to,
      excludeId: booking._id,
    });
    if (conflict) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Room not available" });
    }

    const room = await Room.findById(booking.roomId).session(session);
    const nights = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    booking.from = from;
    booking.to = to;
    booking.nights = nights;
    booking.totalPrice = nights * room.pricePerNight;

    await booking.save({ session });
    await session.commitTransaction();
    res.json(booking);
  } catch (e) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}
    }
    if (e instanceof RangeError) {
      return res.status(400).json({ message: "Bad date range" });
    }
    console.error(e);
    res.status(500).json({ message: "Update failed" });
  } finally {
    if (session) session.endSession();
  }
}

async function cancel(req, res) {
  try {
    const BookingID = req.params.id;
    const b = await Booking.findOneAndUpdate(
      { _id: BookingID },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    if (!b) return res.status(404).json({ message: "Not found" });
    res.json(b);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Cancel failed" });
  }
}

module.exports = {
  create,
  getOwnById,
  availability,
  update,
  cancel,
};
