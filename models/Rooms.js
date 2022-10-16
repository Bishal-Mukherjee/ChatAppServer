const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  primaryEmail: {
    type: String,
  },
  secondaryEmail: {
    type: String,
  },
  roomId: {
    type: String,
    unique: true,
  },
  messages: [
    {
      _id: false,
      email: {
        type: String,
      },
      text: {
        type: String,
      },
      time: {
        type: Date,
      },
    },
  ],
  lastMessage: {
    text: {
      type: String,
    },
    email: {
      type: String,
    },
    time: {
      type: Date,
    },
  },
  participants: {
    type: Array,
  },
});

module.exports = Rooms = mongoose.model("rooms", roomSchema);
