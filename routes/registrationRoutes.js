const express = require("express");
const router = express.Router();

const Registration = require("../models/Registration");

// Register participant
router.post("/", async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();

    res.status(201).json({
      message: "Registration successful",
      registration
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// View all participants
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("eventId");

    res.json(registrations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load participants",
      error: error.message
    });
  }
});

module.exports = router;