import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="card hero stack">
      <div className="hero-grid">
        <div className="stack">
          <p className="eyebrow">Learning platform</p>
          <h1>Develop in-demand cloud and DevOps skills</h1>
          <p className="lead">
            Explore guided courses, follow lesson-by-lesson progress, and earn completion certificates.
          </p>

          <div className="actions">
            <Link className="button" to="/courses">Explore Catalog</Link>
            <Link className="button secondary" to="/my-courses">Continue Learning</Link>
          </div>

          <div className="stat-strip">
            <div className="stat-pill">25+ learning modules</div>
            <div className="stat-pill">Progress tracking</div>
            <div className="stat-pill">Certificates</div>
          </div>
        </div>

        <aside className="stack">
          <div className="hero-visual" />
          <div className="card stack">
            <p className="eyebrow">Included</p>
            <h3>What you get</h3>
            <ul className="list">
              <li>Structured catalog and course detail pages</li>
              <li>Enrollment and learning workflow</li>
              <li>Notifications, certificates, and activity auditing</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

