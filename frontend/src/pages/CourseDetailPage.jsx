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
    setError('');
    setMessage('');

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

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">Course detail</p>
        <div className="pulse" />
        <div className="pulse" />
        <div className="pulse" />
      </div>
    );
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!course) return null;

  return (
    <div className="course-layout">
      <section className="card stack">
        <div className="section-title">
          <div>
            <p className="eyebrow">Course overview</p>
            <h2>{course.title}</h2>
          </div>
          <span className={`badge ${enrolled ? 'success' : 'neutral'}`}>
            {enrolled ? 'Enrolled' : 'Not enrolled'}
          </span>
        </div>

        <p className="lead">{course.description}</p>

        <div className="meta">
          <span>{course.category}</span>
          <span>• {course.level}</span>
          <span>• {course.instructor}</span>
          <span>• {course.duration_minutes} min</span>
        </div>

        <div className="actions">
          {enrolled ? (
            <Link className="button" to={`/learn/${course.id}`}>Go to Learning</Link>
          ) : (
            <button className="button" onClick={handleEnroll}>Enroll</button>
          )}
        </div>

        {message && <p className="muted">{message}</p>}
      </section>

      <aside className="card stack">
        <div className="section-title">
          <h3>Syllabus</h3>
          <span className="muted">{lessons.length} lessons</span>
        </div>
        <ol className="syllabus-list">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="syllabus-item">
              {lesson.order_index}. {lesson.title}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

