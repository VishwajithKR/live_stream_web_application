// src/pages/RegisterForm.js
import { useState } from "react";
import { publicSocket } from "../socket";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    publicSocket.emit("auth:register", form, (res) => {
      setLoading(false);
      setMessage(res.message);
      if (res.status) navigate("/login");
    });
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
      <form onSubmit={handleRegister} className="space-y-3">
        {["name", "email", "mobile", "password", "confirmPassword"].map((field) => (
          <input
            key={field}
            type={field.includes("password") ? "password" : "text"}
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={form[field]}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p className="text-center text-sm mt-3 text-gray-700">{message}</p>}
      <p className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-green-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
