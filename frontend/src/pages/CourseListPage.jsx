import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="stack">
      <h2>Available Courses</h2>
      <div className="grid">
        {courses.map((course) => (
          <article key={course.id} className="card">
            <h3>{course.title}</h3>
            <p>{course.category} · {course.level}</p>
            <p>{course.instructor}</p>
            <p>{course.duration_minutes} minutes</p>
            <Link className="button" to={`/courses/${course.id}`}>View Details</Link>
          </article>
        ))}
      </div>
    </div>
  );
}

