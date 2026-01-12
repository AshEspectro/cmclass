import React, { useEffect, useState } from 'react';

export default function UsersDemo() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('http://localhost:3000/users')
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (mounted) setUsers(data ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Fetch error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Users demo</h3>
      {users.length === 0 ? (
        <div>No users found</div>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id} className="mb-2">
              <strong>{u.username}</strong> — {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
