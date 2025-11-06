// src/socket.js
import { io } from "socket.io-client";

// Public namespace — no auth needed
export const publicSocket = io("http://localhost:5000/public");

// Private namespace — for authenticated users
export const getPrivateSocket = (customToken, onAuthError) => {
  const token = customToken || localStorage.getItem("token");

  const socket = io("http://localhost:5000/private", {
    auth: { token },
  });

  // Handle auth errors
  socket.on("connect_error", (err) => {
    const message = err.message;
    console.warn("Socket connect error:", message);

    if (
      message === "Invalid or expired token" ||
      message === "Session expired or logged in from another device"
    ) {
      localStorage.removeItem("token");
      if (onAuthError) onAuthError(message);
    }
  });

  return socket;
};


