import { useEffect, useState } from "react";
import { getPrivateSocket } from "../socket";


export default function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
   const socket = getPrivateSocket(token);
  useEffect(() => {
     if (!token) return;
    setLoading(true);
    socket.emit("auth:profile", { token }, (res) => {
      setLoading(false);
      if (res.status) setProfile(res.user);
      else onLogout();
    });
  }, [token]);

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className="mb-2">
            <strong>Name:</strong> {profile?.name}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {profile?.email}
          </p>
          <button
            onClick={onLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
