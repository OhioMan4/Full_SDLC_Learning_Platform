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

  if (loading) return <p>Loading your courses...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="stack">
      <h2>My Courses</h2>
      <div className="stack">
        {courses.map((enrollment) => {
          const courseProgress = progress.find((item) => item.course_id === enrollment.course_id);
          return (
            <article key={enrollment.id} className="card">
              <h3>{courseMap[enrollment.course_id] || enrollment.course_id}</h3>
              <p>Status: {enrollment.status}</p>
              <p>Progress: {courseProgress?.progress_percentage ?? 0}%</p>
              <Link className="button" to={`/learn/${enrollment.course_id}`}>Open Course</Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
