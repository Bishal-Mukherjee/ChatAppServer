const express = require("express");
const router = express.Router();
const { getAllActiveRooms } = require("../controllers/rooms");

router.post("/getAllActiveRooms", getAllActiveRooms);

module.exports = router;
