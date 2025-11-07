const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  phone: body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  name: (field) => body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${field} must contain only letters and spaces`),
  
  objectId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  
  academicYear: body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY')
    .custom((value) => {
      const [startYear, endYear] = value.split('-').map(Number);
      if (endYear !== startYear + 1) {
        throw new Error('Academic year end year must be exactly one year after start year');
      }
      return true;
    }),
  
  class: body('class')
    .isIn(['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    .withMessage('Invalid class selection'),
  
  pincode: body('pincode')
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be exactly 6 digits')
};

// User registration validation
const validateUserRegistration = [
  commonValidations.name('firstName'),
  commonValidations.name('lastName'),
  commonValidations.email,
  commonValidations.phone,
  commonValidations.password,
  body('role')
    .isIn(['admin', 'faculty', 'student', 'parent'])
    .withMessage('Invalid role selection'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 100) {
        throw new Error('Age must be between 3 and 100 years');
      }
      return true;
    }),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender selection'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  commonValidations.email,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Student creation validation
const validateStudentCreation = [
  commonValidations.class,
  body('section')
    .trim()
    .isLength({ min: 1, max: 2 })
    .withMessage('Section must be 1-2 characters')
    .matches(/^[A-Z]+$/)
    .withMessage('Section must contain only uppercase letters'),
  commonValidations.academicYear,
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required'),
  body('admissionDate')
    .isISO8601()
    .withMessage('Admission date must be a valid date'),
  body('father.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Father name must be between 2 and 50 characters'),
  body('father.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Father phone number must be exactly 10 digits'),
  body('mother.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Mother name must be between 2 and 50 characters'),
  handleValidationErrors
];

// Faculty creation validation
const validateFacultyCreation = [
  body('designation')
    .isIn([
      'Principal', 'Vice Principal', 'Head Teacher', 'Senior Teacher', 
      'Teacher', 'Assistant Teacher', 'PGT', 'TGT', 'PRT', 
      'Lab Assistant', 'Librarian', 'Sports Teacher', 'Music Teacher',
      'Art Teacher', 'Computer Teacher', 'Counselor'
    ])
    .withMessage('Invalid designation'),
  body('department')
    .isIn([
      'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
      'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Physical Education', 'Arts', 'Music', 'Library',
      'Administration', 'Counseling'
    ])
    .withMessage('Invalid department'),
  body('joiningDate')
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('employmentType')
    .isIn(['permanent', 'temporary', 'contract', 'guest'])
    .withMessage('Invalid employment type'),
  body('salary.basic')
    .isNumeric()
    .withMessage('Basic salary must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Basic salary cannot be negative');
      }
      return true;
    }),
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject must be assigned'),
  handleValidationErrors
];

// Admission application validation
const validateAdmissionApplication = [
  body('studentInfo.fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student full name must be between 2 and 100 characters'),
  body('studentInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('studentInfo.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender selection'),
  body('academicInfo.applyingForClass')
    .isIn(['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    .withMessage('Invalid class selection'),
  commonValidations.academicYear.withMessage('Academic year is required'),
  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('contactInfo.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('contactInfo.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('contactInfo.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('contactInfo.address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('contactInfo.address.pincode')
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('parentInfo.father.name')
    .trim()
    .notEmpty()
    .withMessage('Father name is required'),
  body('parentInfo.father.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Father phone number must be exactly 10 digits'),
  body('parentInfo.mother.name')
    .trim()
    .notEmpty()
    .withMessage('Mother name is required'),
  body('feeInfo.paymentMethod')
    .isIn(['online', 'bank_transfer', 'demand_draft', 'cash'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  commonValidations.email,
  handleValidationErrors
];

// Password update validation
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  commonValidations.password,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  commonValidations.name('firstName').optional(),
  commonValidations.name('lastName').optional(),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender selection'),
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
        });
      }
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validateUserRegistration,
  validateUserLogin,
  validateStudentCreation,
  validateFacultyCreation,
  validateAdmissionApplication,
  validatePasswordReset,
  validatePasswordUpdate,
  validateProfileUpdate,
  validatePagination,
  validateDateRange,
  validateFileUpload
};