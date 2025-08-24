const express = require("express");
const authController = require("../controllers/authController");

const r = express.Router();

r.post("/register", authController.register);

r.post("/login", authController.login);

r.get("/me", authController.me);

module.exports = r;
