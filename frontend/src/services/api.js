import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('baymax_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/signup', data),
};
export const counselorAuth = {
  login: (data) => API.post('/counselor/auth/login', data),
};
export const screening = {
  submitPHQ9: (data) => API.post('/assessment/phq9/submit', data),
  submitGAD7: (data) => API.post('/assessment/gad7/submit', data),
  history: () => API.get('/assessment/history'),
  getResult: (id) => API.get(`/assessment/result/${id}`)
};
export const chat = {
  send: (data) => API.post('/chat/message', data),
  getHistory: () => API.get('/chat/history'),
  createSession: () => API.post('/chat/sessions'),
  getSessions: () => API.get('/chat/sessions'),
  getSessionMessages: (sessionId) => API.get(`/chat/sessions/${sessionId}/messages`),
};
export const appointments = {
  book: (data) => API.post('/appointments', data),
  getMine: () => API.get('/appointments/student'),
  getCounselors: () => API.get('/appointments/counselors'),
  getCounselorAppointments: () => API.get('/appointments/counselor'),
  updateStatus: (id, data) => API.put(`/appointments/${id}`, data)
};
export const users = {
  getProfile: () => API.get('/users/profile')
};
export const notifications = {
  getMine: () => API.get('/notifications')
};
export const counselor = {
  getDashboard: () => API.get('/counselor/dashboard'),
  getAllStudents: () => API.get('/counselor/students'),
  getCrisisStudents: () => API.get('/counselor/crisis-students'),
  getStudentProfile: (id) => API.get(`/counselor/student/${id}`),
  getStudentHistory: (id) => API.get(`/counselor/student/${id}/history`),
};
export const aerp = {
  getRecord: (collegeId) => API.get(`/aerp/student/${collegeId}`),
  getAttendanceLogs: (collegeId) => API.get(`/aerp/attendance/${collegeId}`),
};
export const resources = {
  getAll: () => API.get('/resources'),
  getByType: (type) => API.get(`/resources?type=${encodeURIComponent(type)}`),
  add: (data) => API.post('/resources', data),
  remove: (id) => API.delete(`/resources/${id}`),
};
export const admin = {
  getUsers: () => API.get('/admin/users'),
  getCounselors: () => API.get('/admin/counselors'),
  addCounselor: (data) => API.post('/admin/counselor', data),
  removeCounselor: (id) => API.delete(`/admin/counselor/${id}`),
  blockUser: (id) => API.put(`/admin/block/${id}`),
  unblockUser: (id) => API.put(`/admin/unblock/${id}`),
  getAnalytics: () => API.get('/admin/analytics'),
};
export const sessionNotes = {
  create: (data) => API.post('/session-notes', data),
  getAll: () => API.get('/session-notes'),
};
export default API;