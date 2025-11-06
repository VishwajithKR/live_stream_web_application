// src/utils/socketManager.js
import { getPrivateSocket } from "../socket";
import { setupTokenExpiryWatcher } from "./tokenWatcher";

/**
 * Initializes a private socket connection and token watcher.
 * @param {string} token - JWT token for authentication.
 * @param {Function} handleLogout - Called if socket disconnects or token expires.
 * @param {Function} setSocket - React state setter for socket.
 * @returns {Function} Cleanup function for socket + watcher.
 */
export const initializeSocketConnection = (token, handleLogout, setSocket) => {
  const privateSocket = getPrivateSocket(token, handleLogout);
  setSocket(privateSocket);

  const cleanupWatcher = setupTokenExpiryWatcher(token, handleLogout);

  return () => {
    if (cleanupWatcher) cleanupWatcher();
    privateSocket.disconnect();
  };
};
