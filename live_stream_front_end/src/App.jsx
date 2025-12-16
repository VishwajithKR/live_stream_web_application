// src/App.js
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Profile from "./pages/Profile";
import UserList from "./pages/UserList";
import { initializeSocketConnection } from "./utils/socketManager";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const cleanup = initializeSocketConnection(token, handleLogout, setSocket);
      return () => cleanup && cleanup();
    }
  }, [token]);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    setSocket(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <Routes>
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route
            path="/profile"
            element={
              token ? <Profile token={token} onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/users"
            element={
              token ? <UserList token={token} /> : <Navigate to="/login" />
            }
          />
          <Route path="*" element={<Navigate to={token ? "/profile" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}
