import { useEffect, useState } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);

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
