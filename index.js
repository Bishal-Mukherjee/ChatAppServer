const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const socket_connection = require("./socket");
require("dotenv").config();

app.use(express.json({ extended: false }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log("DATABASE CONNECTION ERROR");
    console.log(err);
  });

app.get("/", (req, res) => {
  return res.status(200).json({ message: "SERVER WORKING" });
});

app.use("/api/users", require("./routes/users"));
app.use("/api/rooms", require("./routes/rooms"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

server.listen(PORT);
server.on("listening", () => {
  console.log("SERVER WORKING ON", PORT);
  socket_connection({ io });
});
