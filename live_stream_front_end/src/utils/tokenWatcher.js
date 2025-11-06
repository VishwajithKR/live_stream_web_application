// src/utils/tokenWatcher.js
import { jwtDecode } from "jwt-decode";

/**
 * Starts a timer that automatically logs out when the JWT expires.
 * @param {string} token - The JWT token to monitor.
 * @param {Function} handleLogout - Function to call when token expires or invalid.
 * @returns {Function | undefined} Cleanup function to stop watching.
 */
export const setupTokenExpiryWatcher = (token, handleLogout) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return;

    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeLeft = expiryTime - currentTime;

    if (timeLeft <= 0) {
      handleLogout();
      return;
    }

    const timer = setTimeout(() => {
      console.log("🔒 Token expired, logging out...");
      handleLogout();
    }, timeLeft);

    return () => clearTimeout(timer);
  } catch (err) {
    console.error("Token decode error:", err);
    handleLogout();
  }
};
