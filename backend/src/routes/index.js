const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const facultyRoutes = require('./faculty');
const studentRoutes = require('./student');
const generalRoutes = require('./general');
const calendarRoutes = require('./calendar');
const coursesRoutes = require('./courses');
const transportRoutes = require('./transport');
const subjectsRoutes = require('./subjects');
const paymentsRoutes = require('./payments');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'School Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'School Management System API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        base_url: '/api/auth',
        endpoints: [
          'POST /login - User login',
          'POST /register - User registration',
          'POST /logout - User logout',
          'POST /forgot-password - Request password reset',
          'POST /reset-password - Reset password',
          'GET /profile - Get user profile'
        ]
      },
      admin: {
        base_url: '/api/admin',
        endpoints: [
          'GET /dashboard - Admin dashboard',
          'GET /students - Get all students',
          'POST /students - Add new student',
          'PUT /students/:id - Update student',
          'DELETE /students/:id - Delete student',
          'GET /faculty - Get all faculty',
          'POST /faculty - Add new faculty',
          'GET /admissions - Get admission applications',
          'PUT /admissions/:id/approve - Approve admission',
          'PUT /admissions/:id/reject - Reject admission',
          'GET /fees - Get fee management',
          'GET /reports - Get system reports'
        ]
      },
      faculty: {
        base_url: '/api/faculty',
        endpoints: [
          'GET /dashboard - Faculty dashboard',
          'GET /classes - Get assigned classes',
          'GET /students - Get students in classes',
          'GET /attendance - Get attendance records',
          'POST /attendance - Mark attendance',
          'POST /assignments - Create assignment',
          'GET /assignments - Get assignments',
          'PUT /assignments/:id - Update assignment',
          'GET /submissions - Get assignment submissions',
          'PUT /submissions/:id/grade - Grade submission',
          'POST /online-classes - Schedule online class',
          'GET /online-classes - Get online classes',
          'GET /profile - Get faculty profile',
          'PUT /profile - Update faculty profile'
        ]
      },
      student: {
        base_url: '/api/student',
        endpoints: [
          'GET /dashboard - Student dashboard',
          'GET /profile - Get student profile',
          'PUT /profile - Update student profile',
          'GET /assignments - Get assignments',
          'POST /assignments/:id/submit - Submit assignment',
          'GET /grades - Get grades',
          'GET /attendance - Get attendance',
          'GET /schedule - Get class schedule',
          'GET /online-classes - Get online classes',
          'POST /online-classes/:id/join - Join online class',
          'GET /fees - Get fee information',
          'POST /fees/payment - Process fee payment',
          'GET /library - Get library information',
          'POST /library/request - Request book',
          'GET /notifications - Get notifications',
          'PUT /notifications/:id/read - Mark notification as read'
        ]
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>'
    },
    response_format: {
      success: 'boolean',
      message: 'string',
      data: 'object (optional)',
      error: 'string (on error)'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);
router.use('/general', generalRoutes);
router.use('/calendar', calendarRoutes);
router.use('/courses', coursesRoutes);
router.use('/transport', transportRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/payments', paymentsRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested_url: req.originalUrl,
    available_endpoints: '/api/docs'
  });
});

module.exports = router;