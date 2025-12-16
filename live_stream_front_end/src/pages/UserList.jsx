import { useEffect, useState } from "react";
import { getPrivateSocket } from "../socket";

export default function UserList({ token }) {
  const [users, setUsers] = useState([]);
 const socket = getPrivateSocket(token);
  useEffect(() => {
     if ( !token) return;
    socket.emit("user:all", { token }, (res) => {
      if (res.status) setUsers(res.users);
    });

    socket.on("user:new", (newUser) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    return () => {
      socket.off("user:new");
    };
  }, [token]);

  return (
    <div className="mt-6 bg-white shadow rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-2">All Users</h3>
      <ul className="divide-y divide-gray-200">
        {users.map((u) => (
          <li key={u.id} className="py-2">{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
