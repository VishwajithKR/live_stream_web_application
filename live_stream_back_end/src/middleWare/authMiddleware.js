import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../lib/db.js";
dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const [rows] = await db.query(
      "SELECT id, name, email, mobile, current_token FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.current_token !== token) {
      return res.status(403).json({
        message: "Session expired or logged in from another device",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔴 Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
