import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";

const ExpireTime = process.env.JWT_EXPIRES_IN;

export const handleAuthSocket = (io, socket) => {
  console.log("🔐 Auth socket initialized");

  // 🔹 Register
  socket.on("auth:register", async (data, callback) => {
    try {
      const { name, email, mobile, password, confirmPassword } = data;

      if (!name || !email || !mobile || !password || !confirmPassword)
        return callback({ status: false, message: "All fields are required" });

      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(name))
        return callback({ status: false, message: "Name must contain only alphabets" });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return callback({ status: false, message: "Invalid email format" });

      const mobileRegex = /^[0-9]{10,12}$/;
      if (!mobileRegex.test(mobile))
        return callback({ status: false, message: "Mobile number must be 10–12 digits" });

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(password))
        return callback({
          status: false,
          message:
            "Password must include uppercase, lowercase, number, and special character",
        });

      if (password !== confirmPassword)
        return callback({ status: false, message: "Passwords do not match" });

      const [existing] = await db.query(
        "SELECT * FROM users WHERE email = ? OR mobile = ?",
        [email, mobile]
      );

      if (existing.length > 0)
        return callback({ status: false, message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        `INSERT INTO users (name, email, mobile, password)
         VALUES (?, ?, ?, ?)`,
        [name, email, mobile, hashedPassword]
      );

      const newUser = { id: result.insertId, name };
      socket.broadcast.emit("user:new", newUser);

      callback({ status: true, message: "User registered successfully" });
    } catch (error) {
      console.error("Register error:", error);
      callback({ status: false, message: "Server error" });
    }
  });

  // 🔹 Login
  socket.on("auth:login", async (data, callback) => {
    try {
      const { email, password } = data;
      if (!email || !password)
        return callback({ status: false, message: "All fields are required" });

      const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (user.length === 0)
        return callback({ status: false, message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user[0].password);
      if (!isMatch)
        return callback({ status: false, message: "Invalid email or password" });

      const token = jwt.sign(
        { id: user[0].id, email: user[0].email, name: user[0].name },
        process.env.JWT_SECRET,
        { expiresIn: ExpireTime }
      );

      await db.query("UPDATE users SET current_token = ? WHERE id = ?", [
        token,
        user[0].id,
      ]);

      // Emit authenticated event so server can attach private handlers
      socket.emit("auth:authenticated");

      callback({
        status: true,
        message: "Login successful",
        token,
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      callback({ status: false, message: "Server error" });
    }
  });
};

// 🔹 Profile event handler
export const handleProfileSocket = (io, socket) => {
  socket.on("auth:profile", async (data, callback) => {
    try {
      const { token } = data;
      if (!token) return callback({ status: false, message: "Token required" });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [user] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [
          decoded.id,
        ]);

        if (user.length === 0)
          return callback({ status: false, message: "User not found" });

        callback({
          status: true,
          message: "Profile fetched successfully",
          user: user[0],
        });
      } catch {
        callback({ status: false, message: "Invalid or expired token" });
      }
    } catch (err) {
      console.error("Profile error:", err);
      callback({ status: false, message: "Server error" });
    }
  });
};
