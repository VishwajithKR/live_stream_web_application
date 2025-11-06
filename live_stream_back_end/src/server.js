// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
// import { socketAuth } from "./middleware/middlewareSo.js";
import { handleAuthSocket, handleProfileSocket } from "./controllers/authControllerSo.js";
import { handleUserSocket } from "./controllers/friendControllerSo.js";
import { socketAuth } from "./middleWare/authMiddlewareSo.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const publicNamespace = io.of("/public");
publicNamespace.on("connection", (socket) => {
  console.log(`🌍 Public socket connected: ${socket.id}`);
  handleAuthSocket(publicNamespace, socket);
});

const privateNamespace = io.of("/private");

privateNamespace.use(socketAuth);

privateNamespace.on("connection", (socket) => {
  console.log(`🔐 Authenticated socket connected: ${socket.user.name}`);
  handleUserSocket(privateNamespace, socket);
  handleProfileSocket(privateNamespace, socket);
});

// Server start
server.listen(process.env.PORT, () => {
  console.log(`🚀 Socket server running on port ${process.env.PORT}`);
});
