import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import { createUserTable } from "./modals/userModel.js";
import { createFriendListTable } from "./modals/friendModel.js";
import { initializeDatabase } from "./lib/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

await initializeDatabase();
await createUserTable();
await createFriendListTable();

app.use("/api/auth", authRoutes);
app.use("/api/friend", friendRoutes);

server.listen(process.env.PORT, () => {
  console.log(`🚀 server running on port ${process.env.PORT}`);
});
