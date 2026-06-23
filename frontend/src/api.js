const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
}

export const api = {
  getCourses: () => request('/courses'),
  getCourse: (courseId) => request(`/courses/${courseId}`),
  getLessons: (courseId) => request(`/courses/${courseId}/lessons`),
  enroll: (studentId, courseId) => request('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, course_id: courseId }),
  }),
  getEnrollments: () => request('/enrollments'),
  getStudentEnrollments: (studentId) => request(`/students/${studentId}/enrollments`),
  cancelEnrollment: (enrollmentId) => request(`/enrollments/${enrollmentId}/cancel`, { method: 'POST' }),
  completeLesson: (studentId, courseId, lessonId) => request('/progress/lessons/complete', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, course_id: courseId, lesson_id: lessonId }),
  }),
  getCourseProgress: (studentId, courseId) => request(`/students/${studentId}/courses/${courseId}/progress`),
  getStudentProgress: (studentId) => request(`/students/${studentId}/progress`),
  getCertificates: (studentId) => request(`/students/${studentId}/certificates`),
  getNotifications: (studentId) => request(`/students/${studentId}/notifications`),
  getAuditEvents: () => request('/audit-events'),
};
