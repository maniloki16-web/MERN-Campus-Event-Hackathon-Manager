const express = require("express");
const router = express.Router();

const Event = require("../models/Event");

// Create Event
router.post("/", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message
    });
  }
});

// Get All Events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load events",
      error: error.message
    });
  }
});

// Delete Event
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);

    res.json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message
    });
  }
});

module.exports = router;