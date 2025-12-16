import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../lib/db.js";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    // 🧩 1. Extract the token safely
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 🧹 2. Handle "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token missing from header" });
    }

    // ⚙️ 3. Ensure JWT secret is loaded
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // 🔍 4. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch (err) {
      console.error("🔴 Token verify failed:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token format or signature" });
      }
      throw err;
    }

    // 🧠 5. Validate decoded payload
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload (missing user ID)" });
    }

    // 🗂️ 6. Check if user exists
    const [rows] = await db.query(
      "SELECT id, name, email, mobile, current_token FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 🔐 7. Ensure session token matches (if you use multi-device restriction)
    if (user.current_token && user.current_token !== token) {
      return res.status(403).json({
        message: "Session expired or logged in from another device",
      });
    }

    // ✅ 8. Attach user to request and continue
    req.user = user;
    next();

  } catch (error) {
    console.error("🚨 Middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
