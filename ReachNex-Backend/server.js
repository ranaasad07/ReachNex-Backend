const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./Mongo_Connection/connectdb");
require("dotenv").config();

const postRoute = require("./Routes/postRoute");
const authRoute = require("./Routes/authenticationRoute");
const profileRoute = require("./Routes/profileRoute");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB(process.env.MONGODB_URI);

// Create HTTP Server and Attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// Middleware to inject io in req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/ReachNex", authRoute);
app.use("/ReachNex", postRoute);
app.use("/ReachNex", profileRoute);

// Socket Setup
io.on("connection", (socket) => {
  console.log("🔌 User connected to socket.io");

  socket.on("disconnect", () => {
    console.log("User disconnected from socket.io");
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});