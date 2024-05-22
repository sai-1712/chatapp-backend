const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const {sendMessageNats} = require("./controllers/messageControllers");
const path = require("path");
globalThis.WebSocket = require("websocket").w3cwebsocket;
const { connect, StringCodec } = require("nats.ws");

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("API is running..");
});

app.use(notFound);
app.use(errorHandler);


const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

// NATS 
let natsConnection;
let key = "sk.*";
let sub;
(async () => {
  try {
    natsConnection = await connect({
      servers: "ws://localhost:5050",
    })
    console.log("Connected to nats");
    sub = natsConnection.subscribe(key);
    console.log("connected as subscriber");
    for await (const m of sub) {
      const msg = StringCodec().decode(m.data);
      const natsobject = JSON.parse(msg)
      // console.log("recieved msg: ", natsobject);
      sendMessageNats(natsobject);
    }
    console.log("subscription closed");
  } catch (err) {
    console.log("Error connecting");
    console.error(err);
  }
})();

(async () => {
  
})();

// socket io 

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//     // credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");
//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     console.log("User Joined Room: " + room);
//   });
//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(userData._id);
//   });
// });
