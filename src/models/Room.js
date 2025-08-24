const { Schema: RoomSchemaCtor, model: roomModel } = require("mongoose");

const RoomSchema = new RoomSchemaCtor(
  {
    hotelId: {
      type: RoomSchemaCtor.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    number: { type: String, required: true },
    type: {
      type: String,
      enum: ["single", "double", "suite"],
      default: "single",
    },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, required: true },
    tags: [String],
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// prevent duplicate room number within the same hotel
RoomSchema.index({ hotelId: 1, number: 1 }, { unique: true });

module.exports = roomModel("Room", RoomSchema);
