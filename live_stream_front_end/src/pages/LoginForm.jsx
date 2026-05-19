import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setLogin } from "../redux/slice/userSlice";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axiosInstance";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  // const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   // setLoading(true);
  //   setMessage("");
  //   dispatch(setLogin({
  //     token:"passed_token_12345",
  //     user: "John Doe",
  //     id: "user_12345",
  //   }));
  //   console.log("first")
  // };

   const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/api/login", form);

      // assuming backend returns token + user data
      dispatch(
        setLogin({
          token: res.data.token,
          user: res.data.user,
          id: res.data.user._id,
        })
      );

      // optional: persist login
      localStorage.setItem(
        "userData",
        JSON.stringify({
          token: res.data.token,
          user: res.data.user,
          id: res.data.user._id,
        })
      );
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }
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
        >
          Login
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
