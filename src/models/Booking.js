const {
  Schema: BookingSchemaCtor,
  model: bookingModel,
  Types,
} = require("mongoose");

// We store half-open intervals [from, to) => checkout day not occupied
const BookingSchema = new BookingSchemaCtor(
  {
    userId: {
      type: BookingSchemaCtor.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: BookingSchemaCtor.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    from: { type: Date, required: true, index: true },
    to: { type: Date, required: true, index: true },
    nights: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    idempotencyKey: { type: String, index: true },
  },
  { timestamps: true }
);

BookingSchema.index({ roomId: 1, from: 1, to: 1 });

BookingSchema.statics.hasOverlap = async function ({
  roomId,
  from,
  to,
  excludeId = null,
  session = null,
}) {
  const query = {
    roomId: roomId,
    status: "confirmed", // Only check confirmed bookings
    $or: [
      { from: { $lte: from }, to: { $gt: from } },
      { from: { $lt: to }, to: { $gte: to } },
      { from: { $gte: from }, to: { $lte: to } },
      { from: { $lte: from }, to: { $gte: to } },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const queryBuilder = this.findOne(query);

  // Add session if provided
  if (session) {
    queryBuilder.session(session);
  }

  const conflict = await queryBuilder;
  return !!conflict; // Return boolean
};

module.exports = bookingModel("Booking", BookingSchema);
