import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(
    () => courses.filter((c) => `${c.title} ${c.category} ${c.level}`.toLowerCase().includes(query.toLowerCase())),
    [courses, query],
  );

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">Catalog</p>
        <div className="pulse" />
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
          <p className="eyebrow">Catalog</p>
          <h2>Explore courses</h2>
        </div>
        <p className="muted">{courses.length} course{courses.length === 1 ? '' : 's'}</p>
      </div>

      <div className="catalog-toolbar">
        <input
          className="input"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <span className="chip">DevOps</span>
        <span className="chip">Platform Engineering</span>
        <span className="chip">Observability</span>
        <span className="chip">Architecture</span>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="card empty-state">
          <h3>No matching courses</h3>
          <p className="muted">Try another keyword.</p>
        </div>
      ) : (
        <div className="grid">
          {filteredCourses.map((course) => (
            <article key={course.id} className="card stack">
              <div className="meta">
                <span className="badge info">{course.category}</span>
                <span>{course.level}</span>
              </div>
              <h3>{course.title}</h3>
              <p className="muted">{course.description}</p>
              <div className="course-card-footer">
                <div className="meta">
                  <span>{course.instructor}</span>
                  <span>• {course.duration_minutes} min</span>
                </div>
                <Link className="button" to={`/courses/${course.id}`}>View</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

