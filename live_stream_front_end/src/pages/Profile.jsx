import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLogout } from "../redux/slice/userSlice";


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <>
          <p className="mb-2">
            <strong>Name:</strong> {profile?.name}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {profile?.email}
          </p>
          <button
          onClick={dispatch(setLogout())}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
    </div>
  );
}
