// // === 📁 backend/server.js ===
// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const connectDB = require("./Mongo_Connection/connectdb");
// require("dotenv").config();

// const postRoute = require("./Routes/postRoute");
// const authRoute = require("./Routes/authenticationRoute");
// const profileRoute = require("./Routes/profileRoute");
// const skillRoute = require("./Routes/skill");
// const AddExperience = require("./Routes/experience");
// const Jobs = require("./Routes/job");
// const messageRoute = require("./Routes/messageRoute");

// const app = express();

// // ✅ CORS setup
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// app.use(express.json());

// // ✅ Connect MongoDB
// connectDB(process.env.MONGODB_URI);

// // ✅ Create HTTP Server and Attach Socket.io
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   },
// });

// // ✅ Make io available to req
// app.set("io", io);

// // ✅ Middleware to inject io into req
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// // ✅ ONLINE USERS MAP
// const onlineUsers = new Map(); // <== Track login users
// app.set("onlineUsers", onlineUsers); // <== make globally accessible
// app.use((req, res, next) => {
//   req.onlineUsers = onlineUsers;
//   next();
// });
// // ✅ All Routes
// app.use("/ReachNex", authRoute);
// app.use("/ReachNex", postRoute);
// app.use("/ReachNex", profileRoute);
// app.use("/ReachNex", skillRoute);
// app.use("/ReachNex", AddExperience);
// app.use("/ReachNex", Jobs);
// app.use("/ReachNex", messageRoute);

// // ✅ SOCKET.IO EVENTS
// io.on("connection", (socket) => {
//   console.log("🔌 User connected to socket.io");

//   socket.on("join", (userId) => {
//     onlineUsers.set(userId, socket.id);
//     console.log("✅ Online users:", [...onlineUsers.keys()]);
//   });

//   socket.on("sendMessage", (message) => {
//     io.to(message.receiverId).emit("receiveMessage", message);
//   });

//   socket.on("disconnect", () => {
//     for (let [key, value] of onlineUsers.entries()) {
//       if (value === socket.id) {
//         onlineUsers.delete(key);
//         break;
//       }
//     }
//     console.log("❌ Disconnected:", [...onlineUsers.keys()]);
//   });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

















// === 📁 backend/server.js ===
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./Mongo_Connection/connectdb");
require("dotenv").config();

const postRoute = require("./Routes/postRoute");
const authRoute = require("./Routes/authenticationRoute");
const profileRoute = require("./Routes/profileRoute");
const skillRoute = require("./Routes/skill");
const AddExperience = require("./Routes/experience");
const Jobs = require("./Routes/job");
const messageRoute = require("./Routes/messageRoute");
const connectionRoute = require("./Routes/connectionRoute")

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ✅ Connect MongoDB
connectDB(process.env.MONGODB_URI);

// ✅ Create HTTP Server and Attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// ✅ Make io available to req
app.set("io", io);

// ✅ Middleware to inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ ONLINE USERS MAP
const onlineUsers = new Map(); // <== Track login users
app.set("onlineUsers", onlineUsers); // <== make globally accessible
app.use((req, res, next) => {
  req.onlineUsers = onlineUsers;
  next();
});

// ✅ All Routes
app.use("/ReachNex", authRoute);
app.use("/ReachNex", postRoute);
app.use("/ReachNex", profileRoute);
app.use("/ReachNex", skillRoute);
app.use("/ReachNex", AddExperience);
app.use("/ReachNex", Jobs);
app.use("/ReachNex", messageRoute);
app.use("/ReachNex", connectionRoute);

// ✅ SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("🔌 User connected to socket.io");

  // 🔹 User connected (track online)
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("✅ Online users:", [...onlineUsers.keys()]);
  });

  // 🔹 Join specific conversation room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("🟢 User joined room:", roomId);
  });

  // 🔹 Leave conversation room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log("🔴 User left room:", roomId);
  });

  // 🔹 Send message to specific conversation room
  socket.on("sendMessage", (message) => {
    // 🔥 Emit message to all sockets in the room (conversationId)
    io.to(message.conversation).emit("receiveMessage", message);
    console.log("📤 Message sent to room:", message.conversation);
  });

  // 🔹 Disconnect
  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
    console.log("❌ Disconnected:", [...onlineUsers.keys()]);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
