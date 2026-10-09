const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  leaderName: {
    type: String,
    required: true
  },
  members: [
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    }
  ]
});

module.exports = mongoose.model("Team", teamSchema);