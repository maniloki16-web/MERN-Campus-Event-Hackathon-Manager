const express = require("express");
const Team = require("../models/Team");

const router = express.Router();

// Create Team
router.post("/", async (req, res) => {
  try {
    const team = new Team(req.body);
    const savedTeam = await team.save();

    res.status(201).json({
      message: "Team created successfully",
      team: savedTeam
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create team",
      error: error.message
    });
  }
});

// Get all Teams
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("eventId");

    res.json(teams);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message
    });
  }
});

module.exports = router;