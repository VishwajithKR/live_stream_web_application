// controllers/userController.js
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";

export const handleUserSocket = (io, socket) => {

  socket.on("user:all", async (data, callback) => {
    try {
      const { token } = data;
      if (!token) return callback({ status: false, message: "Token required" });

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return callback({ status: false, message: "Invalid or expired token" });
      }

      const currentUserId = decoded.id;
      const [rows] = await db.query(
        "SELECT id, name FROM users WHERE id != ?",
        [currentUserId]
      );

      callback({
        status: true,
        message: "All other users fetched successfully",
        users: rows,
      });
    } catch (error) {
      console.error("Fetch users error:", error);
      callback({ status: false, message: "Server error" });
    }
  });
};
