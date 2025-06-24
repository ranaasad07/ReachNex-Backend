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

// ✅ DB Connection
connectDB(process.env.MONGODB_URI);

// ✅ Create HTTP server and socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// ✅ Inject io in each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.use("/ReachNex", authRoute);
app.use("/ReachNex", postRoute);
app.use("/ReachNex", profileRoute);

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("✅ User connected");

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// ✅ Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
