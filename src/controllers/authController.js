const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Booking = require("../models/Booking");
require("dotenv").config();
const signToken = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET || "secret", {
    subject: String(user.id),
    expiresIn: "2h",
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const user = new User({
      name,
      email,
      role: role === "admin" ? "admin" : "customer",
    });

    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    res.status(201).json({ id: user.id, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const bookings = await Booking.find({ userId: user.id })
      .populate({ path: "roomId", populate: { path: "hotelId" } })
      .lean();
    const token = signToken(user);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
      bookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.me = async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(payload.sub).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};
