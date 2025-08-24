const { Schema: HotelSchemaCtor, model: hotelModel } = require("mongoose");

const HotelSchema = new HotelSchemaCtor(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    amenities: [{ type: String }],
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

HotelSchema.index({ name: 1, location: 1 }, { unique: true });

module.exports = hotelModel("Hotel", HotelSchema);
