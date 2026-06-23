import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="card hero">
      <p className="eyebrow">Demo learning platform</p>
      <h1>Browse courses, enroll, learn, and earn certificates.</h1>
      <p>This local-first app shows the core student journey and a lightweight admin view.</p>
      <div className="actions">
        <Link className="button" to="/courses">Browse Courses</Link>
        <Link className="button secondary" to="/my-courses">My Courses</Link>
      </div>
    </section>
  );
}

