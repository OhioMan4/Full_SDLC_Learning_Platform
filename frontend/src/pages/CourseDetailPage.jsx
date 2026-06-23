import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const enrolled = useMemo(
    () => enrollments.some((enrollment) => enrollment.course_id === courseId && enrollment.status !== 'CANCELLED'),
    [courseId, enrollments],
  );

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getCourse(courseId),
      api.getLessons(courseId),
      api.getStudentEnrollments(STUDENT_ID),
    ])
      .then(([courseData, lessonData, enrollmentData]) => {
        setCourse(courseData);
        setLessons(lessonData);
        setEnrollments(enrollmentData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      await api.enroll(STUDENT_ID, courseId);
      setMessage('Enrolled successfully.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <p>Loading course...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!course) return null;

  return (
    <div className="stack">
      <section className="card">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <p>{course.category} · {course.level} · {course.instructor}</p>
        <p>{course.duration_minutes} minutes</p>
        {enrolled ? (
          <Link className="button" to={`/learn/${course.id}`}>Go to Learning</Link>
        ) : (
          <button className="button" onClick={handleEnroll}>Enroll</button>
        )}
        {message && <p className="muted">{message}</p>}
      </section>
      <section className="card">
        <h3>Lessons</h3>
        <ol>
          {lessons.map((lesson) => (
            <li key={lesson.id}>{lesson.order_index}. {lesson.title}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

