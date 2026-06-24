const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'learning_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  me: () => request('/auth/me'),
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
