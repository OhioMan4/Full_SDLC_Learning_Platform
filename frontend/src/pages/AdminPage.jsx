import { useEffect, useState } from 'react';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getCourses(),
      api.getEnrollments(),
      api.getCertificates(STUDENT_ID),
      api.getStudentProgress(STUDENT_ID),
      api.getAuditEvents(),
    ])
      .then(([courses, enrollments, certificates, progress, auditEvents]) => {
        setStats({
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          completedCourses: progress.filter((item) => item.status === 'COMPLETED').length,
          generatedCertificates: certificates.length,
        });
        setEvents(auditEvents.slice(0, 5));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!stats) return <div className="card loading-panel"><div className="pulse" /><div className="pulse" /></div>;

  return (
    <div className="stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">Admin / System</p>
          <h2>Platform status</h2>
        </div>
        <p className="muted">Live summary</p>
      </div>

      <div className="stat-grid">
        <article className="card stat-card"><h3>{stats.totalCourses}</h3><p>Total Courses</p></article>
        <article className="card stat-card"><h3>{stats.totalEnrollments}</h3><p>Total Enrollments</p></article>
        <article className="card stat-card"><h3>{stats.completedCourses}</h3><p>Completed Courses</p></article>
        <article className="card stat-card"><h3>{stats.generatedCertificates}</h3><p>Generated Certificates</p></article>
      </div>

      <section className="card stack">
        <div className="section-title">
          <h3>Recent Audit Events</h3>
          <span className="muted">{events.length} shown</span>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No audit events yet</h3>
            <p className="muted">Events will appear as users enroll and complete lessons.</p>
          </div>
        ) : (
          <div className="stack">
            {events.map((event) => (
              <article key={event.id} className="card">
                <div className="meta">
                  <span className="badge info">{event.event_type}</span>
                  <span>{event.entity_type}</span>
                  <span>{new Date(event.created_at).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

