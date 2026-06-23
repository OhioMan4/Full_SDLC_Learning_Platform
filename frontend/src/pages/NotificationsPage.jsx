import { useEffect, useState } from 'react';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getNotifications(STUDENT_ID)
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="stack">
      <h2>Notifications</h2>
      {notifications.map((notification) => (
        <article key={notification.id} className="card">
          <strong>{notification.type}</strong>
          <p>{notification.message}</p>
        </article>
      ))}
    </div>
  );
}

