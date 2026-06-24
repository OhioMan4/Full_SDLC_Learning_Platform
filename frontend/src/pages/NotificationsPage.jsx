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

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">Notifications</p>
        <div className="pulse" />
        <div className="pulse" />
      </div>
    );
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;

  return (
    <div className="stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Alerts & updates</h2>
        </div>
        <p className="muted">{notifications.length} item{notifications.length === 1 ? '' : 's'}</p>
      </div>

      {notifications.length === 0 ? (
        <div className="card empty-state">
          <h3>No notifications yet</h3>
          <p className="muted">New course and progress events will appear here.</p>
        </div>
      ) : (
        <div className="stack">
          {notifications.map((notification) => (
            <article key={notification.id} className="card stack">
              <div className="meta">
                <span className="badge info">{notification.type}</span>
                <span>{new Date(notification.created_at).toLocaleString()}</span>
              </div>
              <p>{notification.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

