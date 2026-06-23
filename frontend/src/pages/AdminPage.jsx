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

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading platform status...</p>;

  return (
    <div className="stack">
      <h2>Admin / System</h2>
      <div className="grid">
        <article className="card"><h3>{stats.totalCourses}</h3><p>Total Courses</p></article>
        <article className="card"><h3>{stats.totalEnrollments}</h3><p>Total Enrollments</p></article>
        <article className="card"><h3>{stats.completedCourses}</h3><p>Completed Courses</p></article>
        <article className="card"><h3>{stats.generatedCertificates}</h3><p>Generated Certificates</p></article>
      </div>
      <section className="card">
        <h3>Recent Audit Events</h3>
        {events.map((event) => (
          <p key={event.id}>{event.event_type} · {event.entity_type} · {new Date(event.created_at).toLocaleString()}</p>
        ))}
      </section>
    </div>
  );
}

