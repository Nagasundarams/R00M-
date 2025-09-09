require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../src/config/db");

const authRoutes = require("./routes/auth");
const hotelRoutes = require("./routes/hotels");
const roomRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/book");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/book", bookingRoutes);

(async () => {
  connectDB();
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`[api] listening on :${port}`));
})();
