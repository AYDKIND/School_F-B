const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Course, User } = require('../models');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { class: className, department, academicYear, session, semester, isActive } = req.query;
    
    let query = {};
    
    if (className) query.class = className;
    if (department) query.department = department;
    if (academicYear) query.academicYear = academicYear;
    // Prefer new 'session' param; fallback to 'semester' for backward compatibility
    const effectiveSession = session || semester;
    if (effectiveSession) query.session = effectiveSession;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // If user is faculty, only show courses assigned to them
    if (req.user.role === 'faculty') {
      query.faculty = req.user.id;
    }
    
    const courses = await Course.find(query)
      .populate('faculty', 'firstName lastName email')
      .populate('enrolledStudents', 'firstName lastName admissionNumber')
      .sort({ class: 1, courseName: 1 });
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'firstName lastName email phone')
      .populate('enrolledStudents', 'firstName lastName admissionNumber email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'faculty' && course.faculty._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin only)
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('courseCode').trim().isLength({ min: 1 }).withMessage('Course code is required'),
  body('courseName').trim().isLength({ min: 1 }).withMessage('Course name is required'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department is required'),
  body('class').isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']).withMessage('Invalid class'),
  body('faculty').isMongoId().withMessage('Valid faculty ID is required'),
  body('maxStudents').isInt({ min: 1 }).withMessage('Max students must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Check if faculty exists and is active
    const faculty = await User.findOne({ 
      _id: req.body.faculty, 
      role: 'faculty', 
      status: 'active' 
    });
    
    if (!faculty) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty selected'
      });
    }
    
    // Check if course code already exists for the same class and academic year
    const existingCourse = await Course.findOne({
      courseCode: req.body.courseCode,
      class: req.body.class,
      academicYear: req.body.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists for this class and academic year'
      });
    }
    
    const course = new Course(req.body);
    await course.save();
    
    await course.populate('faculty', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin only)
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('courseCode').optional().trim().isLength({ min: 1 }).withMessage('Course code cannot be empty'),
  body('courseName').optional().trim().isLength({ min: 1 }).withMessage('Course name cannot be empty'),
  body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('faculty').optional().isMongoId().withMessage('Valid faculty ID is required'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('Max students must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // If faculty is being updated, check if it exists and is active
    if (req.body.faculty) {
      const faculty = await User.findOne({ 
        _id: req.body.faculty, 
        role: 'faculty', 
        status: 'active' 
      });
      
      if (!faculty) {
        return res.status(400).json({
          success: false,
          message: 'Invalid faculty selected'
        });
      }
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in course
// @access  Private (Admin only)
router.post('/:id/enroll', [
  authenticateToken,
  requireRole(['admin']),
  body('studentId').isMongoId().withMessage('Valid student ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student exists and is active
    const student = await User.findOne({ 
      _id: req.body.studentId, 
      role: 'student', 
      status: 'active' 
    });
    
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student selected'
      });
    }
    
    // Check if student is already enrolled
    if (course.enrolledStudents.includes(req.body.studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }
    
    // Check if course is full
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }
    
    course.enrolledStudents.push(req.body.studentId);
    await course.save();
    
    await course.populate('enrolledStudents', 'firstName lastName admissionNumber');
    
    res.json({
      success: true,
      message: 'Student enrolled successfully',
      data: course
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll student'
    });
  }
});

// @route   DELETE /api/courses/:id/unenroll/:studentId
// @desc    Unenroll student from course
// @access  Private (Admin only)
router.delete('/:id/unenroll/:studentId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student is enrolled
    const studentIndex = course.enrolledStudents.indexOf(req.params.studentId);
    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }
    
    course.enrolledStudents.splice(studentIndex, 1);
    await course.save();
    
    await course.populate('enrolledStudents', 'firstName lastName admissionNumber');
    
    res.json({
      success: true,
      message: 'Student unenrolled successfully',
      data: course
    });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll student'
    });
  }
});

module.exports = router;