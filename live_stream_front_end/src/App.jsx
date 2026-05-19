// src/App.js
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Profile from "./pages/Profile";
import UserList from "./pages/UserList";
import { useSelector } from "react-redux";
// import { initializeSocketConnection } from "./utils/socketManager";

export default function App() {
  const { token } = useSelector((state) => state.user);
  console.log("==========", token);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/profile" /> : <LoginForm />} />
          <Route path="/register" element={token ? <Navigate to="/profile" /> :  <RegisterForm />} />

          <Route
            path="/profile"
            element={
              token ? <Profile /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/users"
            element={
              token ? <UserList /> : <Navigate to="/login" />
            }
          />
          <Route
            path="*"
            element={<Navigate to={token ? "/profile" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}
