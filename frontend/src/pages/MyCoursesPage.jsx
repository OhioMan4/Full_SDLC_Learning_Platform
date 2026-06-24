import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getStudentEnrollments(STUDENT_ID), api.getStudentProgress(STUDENT_ID), api.getCourses()])
      .then(([enrollments, progressData, courseList]) => {
        setCourses(enrollments);
        setProgress(progressData);
        setCourseMap(courseList.reduce((acc, course) => ({ ...acc, [course.id]: course.title }), {}));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">My courses</p>
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
          <p className="eyebrow">Learning</p>
          <h2>My Courses</h2>
        </div>
        <p className="muted">{courses.length} enrollment{courses.length === 1 ? '' : 's'}</p>
      </div>

      {courses.length === 0 ? (
        <div className="card empty-state">
          <h3>No active courses yet</h3>
          <p className="muted">Browse the catalog and enroll in a course to start tracking progress.</p>
          <Link className="button" to="/courses">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid">
          {courses.map((enrollment) => {
            const courseProgress = progress.find((item) => item.course_id === enrollment.course_id);
            const progressValue = courseProgress?.progress_percentage ?? 0;

            return (
              <article key={enrollment.id} className="card stack">
                <div className="section-title">
                  <h3>{courseMap[enrollment.course_id] || enrollment.course_id}</h3>
                  <span className={`badge ${enrollment.status === 'COMPLETED' ? 'success' : 'neutral'}`}>
                    {enrollment.status}
                  </span>
                </div>

                <div className="meta">
                  <span>{progressValue}% complete</span>
                  <span>• {courseProgress?.completed_lessons ?? 0} lesson(s) completed</span>
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressValue}%` }} />
                </div>

                <div className="actions">
                  <Link className="button" to={`/learn/${enrollment.course_id}`}>Continue</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
