const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
dotenv.config();
const connectDB = require("./config/db");
const authMiddleware = require("./middlewares/auth.middleware");
const Message = require("./models/chat.model");
const User = require("./models/user.model");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Service is healthy. Current time: " + new Date(Date.now()) });
});
require("./routes/auth.route")(app);
require("./routes/user.route")(app);
require("./routes/account.route")(app);
require("./routes/profile.route")(app);
require("./routes/master.route")(app);
require("./routes/chat.route")(app);

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server listening on port ${port}`));

console.log("hello");
io.use(async (socket, next) => {
  const token = socket.handshake.headers.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded._id);
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.user._id);
  socket.user.online = true;
  socket.user.save();

  socket.join(socket.user.id);

  socket.on("disconnect", async () => {
    console.log("user disconnected:", socket.user._id);
    socket.user.online = false;
    await socket.user.save();
  });

  socket.on("sendMessage", async (data) => {
    console.log("data--> ",data)
    const { receiver, message, mediaUrl, mediaType } = data;
    console.log("receiver-_>>",receiver,message);
    const newMessage = new Message({
      sender: socket.user._id,
      receiver,
      message,
      mediaUrl,
      mediaType,
    });
    await newMessage.save();
     
    io.to(receiver).emit("receiveMessage", newMessage);
    io.to(socket.user._id).emit("receiveMessage", newMessage);
  });
});
