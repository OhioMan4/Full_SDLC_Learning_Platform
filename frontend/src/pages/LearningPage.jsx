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
    setError('');
    setMessage('');

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

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">Learning</p>
        <div className="pulse" />
        <div className="pulse" />
        <div className="pulse" />
      </div>
    );
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!course || !progress) return null;

  return (
    <div className="stack">
      <section className="card stack">
        <div className="section-title">
          <div>
            <p className="eyebrow">Course learning</p>
            <h2>{course.title}</h2>
          </div>
          <span className={`badge ${progress.status === 'COMPLETED' ? 'success' : 'neutral'}`}>
            {progress.status}
          </span>
        </div>

        <div className="meta">
          <span>{progress.completed_lessons}/{progress.total_lessons} lessons completed</span>
          <span>• {progress.progress_percentage}% progress</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress.progress_percentage}%` }} />
        </div>

        {message && <p className="muted">{message}</p>}
      </section>

      <section className="card stack">
        <div className="section-title">
          <h3>Course content</h3>
          <span className="muted">{lessons.length} lesson{lessons.length === 1 ? '' : 's'}</span>
        </div>

        {lessons.length === 0 ? (
          <div className="empty-state">
            <h3>No lessons found</h3>
            <p className="muted">This course is empty for now.</p>
          </div>
        ) : (
          <div className="stack">
            {lessons.map((lesson) => (
              <article key={lesson.id} className="lesson-row">
                <div>
                  <strong>{lesson.order_index}. {lesson.title}</strong>
                  <p className="muted">{lesson.content}</p>
                </div>
                {completed.has(lesson.id) ? (
                  <span className="badge success">Completed</span>
                ) : (
                  <button className="button" onClick={() => markCompleted(lesson.id)}>Mark Completed</button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

