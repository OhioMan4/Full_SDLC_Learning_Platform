import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function LearningPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getCourse(courseId),
      api.getLessons(courseId),
      api.getCourseProgress(STUDENT_ID, courseId),
    ])
      .then(([courseData, lessonData, progressData]) => {
        setCourse(courseData);
        setLessons(lessonData);
        setProgress(progressData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const completed = new Set(progress?.completed_lesson_ids || []);

  const markCompleted = async (lessonId) => {
    try {
      await api.completeLesson(STUDENT_ID, courseId, lessonId);
      setMessage('Lesson completed.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <p>Loading learning view...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!course || !progress) return null;

  return (
    <div className="stack">
      <section className="card">
        <h2>{course.title}</h2>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress.progress_percentage}%` }} /></div>
        <p>{progress.progress_percentage}% complete · {progress.status}</p>
        {message && <p className="muted">{message}</p>}
      </section>
      <section className="card">
        <h3>Lessons in order</h3>
        <div className="stack">
          {lessons.map((lesson) => (
            <article key={lesson.id} className="lesson-row">
              <div>
                <strong>{lesson.order_index}. {lesson.title}</strong>
                <p>{lesson.content}</p>
              </div>
              {completed.has(lesson.id) ? (
                <span className="badge success">Completed</span>
              ) : (
                <button className="button" onClick={() => markCompleted(lesson.id)}>Mark Completed</button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

