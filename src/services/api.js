import axios from 'axios';
import config from '../config/config.js';

// Base API configuration
const API_BASE_URL = config.API_BASE_URL;

// Loading state management
let loadingRequests = new Set();
let loadingCallbacks = new Set();

export const apiLoadingState = {
  addCallback: (callback) => {
    loadingCallbacks.add(callback);
  },
  removeCallback: (callback) => {
    loadingCallbacks.delete(callback);
  },
  isLoading: () => loadingRequests.size > 0,
  getActiveRequests: () => loadingRequests.size
};

// Notify loading state changes
const notifyLoadingChange = () => {
  const isLoading = loadingRequests.size > 0;
  loadingCallbacks.forEach(callback => callback(isLoading, loadingRequests.size));
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and track loading
api.interceptors.request.use(
  (config) => {
    // Add request to loading tracker
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
    config.metadata = { requestId };
    loadingRequests.add(requestId);
    notifyLoadingChange();

    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for performance monitoring
    config.metadata.startTime = Date.now();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and loading tracking
api.interceptors.response.use(
  (response) => {
    // Remove request from loading tracker
    if (response.config.metadata?.requestId) {
      loadingRequests.delete(response.config.metadata.requestId);
      notifyLoadingChange();
    }

    // Log performance in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  (error) => {
    // Remove request from loading tracker
    if (error.config?.metadata?.requestId) {
      loadingRequests.delete(error.config.metadata.requestId);
      notifyLoadingChange();
    }

    // Enhanced error handling
    if (error.response?.status === 401) {
      // Token expired or invalid
      // In E2E mode, do not clear or redirect to avoid interfering with tests
      if (!config.IS_E2E) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        // Redirect to app root to ensure consistent routing in production
        window.location.href = '/';
      }
    }

    // Add user-friendly error messages
    const enhancedError = {
      ...error,
      userMessage: getUserFriendlyErrorMessage(error),
      isNetworkError: !error.response,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString()
    };

    return Promise.reject(enhancedError);
  }
);

// Helper function to get user-friendly error messages
const getUserFriendlyErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const status = error.response.status;
  const message = error.response.data?.message || error.message;
  const detailsArray = error.response.data?.errors;
  const detailString = Array.isArray(detailsArray) && detailsArray.length
    ? `: ${detailsArray.map(d => `${d.path}: ${d.message}`).join('; ')}`
    : (error.response.data?.error ? `: ${error.response.data.error}` : '');

  switch (status) {
    case 400:
      return (message || 'Invalid request. Please check your input.') + detailString;
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return message || 'Conflict with existing data.';
    case 422:
      return (message || 'Validation error. Please check your input.') + detailString;
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
};

// Retry logic for failed requests
const retryRequest = async (originalRequest, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      return await api(originalRequest);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error.response?.status < 500) throw error; // Don't retry client errors
    }
  }
};

// Enhanced API wrapper with loading states and retry logic
const createAPIMethod = (method, url, options = {}) => {
  return async (data, config = {}) => {
    const { retry = false, retryCount = 3, ...restConfig } = config;
    
    try {
      let response;
      if (method === 'get' || method === 'delete') {
        response = await api[method](url, { ...restConfig, ...options });
      } else {
        response = await api[method](url, data, { ...restConfig, ...options });
      }
      return response;
    } catch (error) {
      if (retry && error.response?.status >= 500) {
        return retryRequest({ method, url, data, ...restConfig }, retryCount);
      }
      throw error;
    }
  };
};

// Authentication API calls
export const authAPI = {
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
};

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboard: (config) => api.get('/admin/dashboard', config),

  // Students
  getStudents: (config) => api.get('/admin/students', config),
  getStudentById: (id, config) => api.get(`/admin/students/${id}`, config),
  addStudent: (studentData, config) => api.post('/admin/students', studentData, config),
  updateStudent: (id, studentData, config) => api.put(`/admin/students/${id}`, studentData, config),
  deleteStudent: (id, config) => api.delete(`/admin/students/${id}`, config),

  // Faculty
  getFaculty: (config) => api.get('/admin/faculty', config),
  addFaculty: (facultyData, config) => api.post('/admin/faculty', facultyData, config),
  updateFaculty: (id, facultyData, config) => api.put(`/admin/faculty/${id}`, facultyData, config),
  deleteFaculty: (id, config) => api.delete(`/admin/faculty/${id}`, config),

  // Reports
  getReports: (config) => api.get('/admin/reports', config),

  // Assignments (Faculty-course-class assignments)
  getAssignments: (config) => api.get('/admin/assignments', config),
  createAssignment: (assignmentData, config) => api.post('/admin/assignments', assignmentData, config),
  updateAssignment: (id, assignmentData, config) => api.put(`/admin/assignments/${id}`, assignmentData, config),
  deleteAssignment: (id, config) => api.delete(`/admin/assignments/${id}`, config),

  // Schedules (Timetable management)
  getSchedules: (config) => api.get('/admin/schedules', config),
  createSchedule: (scheduleData, config) => api.post('/admin/schedules', scheduleData, config),
  updateSchedule: (id, scheduleData, config) => api.put(`/admin/schedules/${id}`, scheduleData, config),
  deleteSchedule: (id, config) => api.delete(`/admin/schedules/${id}`, config),

  // Admissions
  getAdmissions: (config) => api.get('/admin/admissions', config),
  approveAdmission: (id, payload, config) => api.put(`/admin/admissions/${id}/approve`, payload, config),
  rejectAdmission: (id, payload, config) => api.put(`/admin/admissions/${id}/reject`, payload, config),

  // Fees
  getFees: (config) => api.get('/admin/fees', config),
  createFeeStructure: (feeStructureData, config) => api.post('/admin/fees/structure', feeStructureData, config),
  recordPayment: (paymentData, config) => api.post('/admin/fees/payment', paymentData, config),
};

// Student API calls
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
  getAttendance: () => api.get('/student/attendance'),
  getGrades: () => api.get('/student/grades'),
  getFees: () => api.get('/student/fees'),
  payFees: (paymentData) => api.post('/student/fees/pay', paymentData),
  getClasses: () => api.get('/student/classes'),
};

// Faculty API calls
export const facultyAPI = {
  getDashboard: () => api.get('/faculty/dashboard'),
  getProfile: () => api.get('/faculty/profile'),
  updateProfile: (profileData) => api.put('/faculty/profile', profileData),
  getClasses: () => api.get('/faculty/classes'),
  getStudents: () => api.get('/faculty/students'),
  markAttendance: (attendanceData) => api.post('/faculty/attendance', attendanceData),
  // Fetch attendance records with optional query parameters
  // params can include: course, student, date_from, date_to, session
  getAttendance: (params = {}) => api.get('/faculty/attendance', { params }),
  addGrades: (gradeData) => api.post('/faculty/grades', gradeData),
  getGrades: (classId) => api.get(`/faculty/grades/${classId}`),
};

// Courses API calls
export const coursesAPI = {
  getCourses: (config) => api.get('/courses', config),
  getCourseById: (id, config) => api.get(`/courses/${id}`, config),
  createCourse: (courseData, config) => api.post('/courses', courseData, config),
  updateCourse: (id, courseData, config) => api.put(`/courses/${id}`, courseData, config),
  deleteCourse: (id, config) => api.delete(`/courses/${id}`, config),
  enrollStudent: (courseId, studentId, config) => api.post(`/courses/${courseId}/enroll`, { studentId }, config),
  unenrollStudent: (courseId, studentId, config) => api.delete(`/courses/${courseId}/unenroll/${studentId}`, config),
};

// Subjects API calls
export const subjectAPI = {
  // Managed subjects (private, requires auth)
  getSubjects: (params = {}, config = {}) => api.get('/subjects', { params, ...config }),
  getSubjectById: (id, config) => api.get(`/subjects/${id}`, config),
  createSubject: (subjectData, config) => api.post('/subjects', subjectData, config),
  updateSubject: (id, subjectData, config) => api.put(`/subjects/${id}`, subjectData, config),
  deleteSubject: (id, config) => api.delete(`/subjects/${id}`, config),
  addCurriculumUnit: (id, unitData, config) => api.post(`/subjects/${id}/curriculum/units`, unitData, config),
  assignFaculty: (id, payload, config) => api.post(`/subjects/${id}/faculty`, payload, config),
  updateApprovalStatus: (id, payload, config) => api.put(`/subjects/${id}/approval`, payload, config),
  getDepartmentStats: (config) => api.get('/subjects/departments/stats', config),
};

// General API calls
export const generalAPI = {
  sendOTP: (mobile) => api.post('/general/send-otp', { mobile }),
  verifyOTP: (mobile, otp) => api.post('/general/verify-otp', { mobile, otp }),
  sendEmailOTP: (email) => api.post('/general/send-email-otp', { email }),
  verifyEmailOTP: (email, otp) => api.post('/general/verify-email-otp', { email, otp }),
  submitAdmission: (admissionData) => api.post('/general/admissions', admissionData),
  getNotices: () => api.get('/general/notices'),
  // Academy updates (notices)
  createNotice: (noticeData, config) => api.post('/general/notices', noticeData, config),
  updateNotice: (id, noticeData, config) => api.put(`/general/notices/${id}`, noticeData, config),
  deleteNotice: (id, config) => api.delete(`/general/notices/${id}`, config),
  getEvents: () => api.get('/general/events'),
  // Public subjects (basic info only)
  getPublicSubjects: (params = {}) => api.get('/general/subjects/public', { params }),
  // Public courses (basic info only)
  getPublicCourses: (params = {}) => api.get('/general/courses/public', { params }),
};

export default api;