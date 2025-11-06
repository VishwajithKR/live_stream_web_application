import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../lib/db.js";

dotenv.config();

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authorization token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id, name, email, mobile, current_token FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new Error("User not found"));
    }

    const user = rows[0];

    if (user.current_token !== token) {
      return next(new Error("Session expired or logged in from another device"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("🔴 Socket auth error:", error.message);
    next(new Error("Invalid or expired token"));
  }
};
