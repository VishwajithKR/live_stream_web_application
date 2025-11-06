import { useState } from "react";
import { getPrivateSocket, publicSocket } from "../socket";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    publicSocket.emit("auth:login", form, (res) => {
      setLoading(false);
      setMessage(res.message);
      if (res.status) {
        const privateSocket = getPrivateSocket(res.token);
        onLogin(res.token, privateSocket);
        navigate("/profile");
      }
    });
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && <p className="text-center text-sm mt-3 text-gray-700">{message}</p>}
      <p className="text-center mt-4 text-sm">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
