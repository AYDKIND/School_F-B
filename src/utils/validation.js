/**
 * Comprehensive form validation utilities
 */

// Validation rules
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(value.replace(/\s+/g, ''));
  },

  minLength: (min) => (value) => {
    return value && value.length >= min;
  },

  maxLength: (max) => (value) => {
    return !value || value.length <= max;
  },

  pattern: (regex) => (value) => {
    return !value || regex.test(value);
  },

  number: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  positiveNumber: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },

  integer: (value) => {
    return Number.isInteger(Number(value));
  },

  date: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  futureDate: (value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  },

  pastDate: (value) => {
    const date = new Date(value);
    const today = new Date();
    return date < today;
  },

  age: (min, max) => (value) => {
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= min && age <= max;
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  strongPassword: (value) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(value);
  },

  confirmPassword: (originalPassword) => (value) => {
    return value === originalPassword;
  },

  fileSize: (maxSizeInMB) => (file) => {
    if (!file) return true;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return true;
    return allowedTypes.includes(file.type);
  }
};

// Error messages
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid 10-digit mobile number',
  minLength: (min) => `Minimum ${min} characters required`,
  maxLength: (max) => `Maximum ${max} characters allowed`,
  pattern: 'Invalid format',
  number: 'Please enter a valid number',
  positiveNumber: 'Please enter a positive number',
  integer: 'Please enter a whole number',
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  age: (min, max) => `Age must be between ${min} and ${max} years`,
  url: 'Please enter a valid URL',
  strongPassword: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  confirmPassword: 'Passwords do not match',
  fileSize: (maxSizeInMB) => `File size must be less than ${maxSizeInMB}MB`,
  fileType: (allowedTypes) => `Allowed file types: ${allowedTypes.join(', ')}`
};

// Field validator class for proper method chaining
class FieldValidator {
  constructor(schema, fieldName) {
    this.schema = schema;
    this.fieldName = fieldName;
  }

  required(message = errorMessages.required) {
    this.schema.fields[this.fieldName].rules.push(validationRules.required);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  email(message = errorMessages.email) {
    this.schema.fields[this.fieldName].rules.push(validationRules.email);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  phone(message = errorMessages.phone) {
    this.schema.fields[this.fieldName].rules.push(validationRules.phone);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  minLength(min, message = errorMessages.minLength(min)) {
    this.schema.fields[this.fieldName].rules.push(validationRules.minLength(min));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  maxLength(max, message = errorMessages.maxLength(max)) {
    this.schema.fields[this.fieldName].rules.push(validationRules.maxLength(max));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  pattern(regex, message = errorMessages.pattern) {
    this.schema.fields[this.fieldName].rules.push(validationRules.pattern(regex));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  number(message = errorMessages.number) {
    this.schema.fields[this.fieldName].rules.push(validationRules.number);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  positiveNumber(message = errorMessages.positiveNumber) {
    this.schema.fields[this.fieldName].rules.push(validationRules.positiveNumber);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  integer(message = errorMessages.integer) {
    this.schema.fields[this.fieldName].rules.push(validationRules.integer);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  date(message = errorMessages.date) {
    this.schema.fields[this.fieldName].rules.push(validationRules.date);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  futureDate(message = errorMessages.futureDate) {
    this.schema.fields[this.fieldName].rules.push(validationRules.futureDate);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  pastDate(message = errorMessages.pastDate) {
    this.schema.fields[this.fieldName].rules.push(validationRules.pastDate);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  age(min, max, message = errorMessages.age(min, max)) {
    this.schema.fields[this.fieldName].rules.push(validationRules.age(min, max));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  url(message = errorMessages.url) {
    this.schema.fields[this.fieldName].rules.push(validationRules.url);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  strongPassword(message = errorMessages.strongPassword) {
    this.schema.fields[this.fieldName].rules.push(validationRules.strongPassword);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  confirmPassword(originalPassword, message = errorMessages.confirmPassword) {
    this.schema.fields[this.fieldName].rules.push(validationRules.confirmPassword(originalPassword));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  fileSize(maxSizeInMB, message = errorMessages.fileSize(maxSizeInMB)) {
    this.schema.fields[this.fieldName].rules.push(validationRules.fileSize(maxSizeInMB));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  fileType(allowedTypes, message = errorMessages.fileType(allowedTypes)) {
    this.schema.fields[this.fieldName].rules.push(validationRules.fileType(allowedTypes));
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }

  custom(rule, message) {
    this.schema.fields[this.fieldName].rules.push(rule);
    this.schema.fields[this.fieldName].messages.push(message);
    return this;
  }
}

// Validation schema builder
export class ValidationSchema {
  constructor() {
    this.fields = {};
  }

  field(name) {
    this.fields[name] = {
      rules: [],
      messages: []
    };
    return new FieldValidator(this, name);
  }

  validate(data) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, fieldConfig] of Object.entries(this.fields)) {
      const value = data[fieldName];
      
      for (let i = 0; i < fieldConfig.rules.length; i++) {
        const rule = fieldConfig.rules[i];
        const message = fieldConfig.messages[i];
        
        if (!rule(value)) {
          errors[fieldName] = message;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    }

    return { isValid, errors };
  }
}

// Predefined schemas for common forms
export const commonSchemas = {
  studentRegistration: () => {
    const schema = new ValidationSchema();
    
    schema.field('firstName').required().minLength(2).maxLength(50);
    schema.field('lastName').required().minLength(2).maxLength(50);
    schema.field('email').required().email();
    schema.field('phone').required().phone();
    schema.field('dateOfBirth').required().date().pastDate();
    schema.field('class').required();
    schema.field('rollNumber').required().pattern(/^[A-Z0-9]+$/, 'Roll number must contain only uppercase letters and numbers');
    schema.field('address').required().minLength(10).maxLength(200);
    schema.field('parentName').required().minLength(2).maxLength(100);
    schema.field('parentPhone').required().phone();
    
    return schema;
  },

  facultyRegistration: () => {
    const schema = new ValidationSchema();
    
    schema.field('firstName').required().minLength(2).maxLength(50);
    schema.field('lastName').required().minLength(2).maxLength(50);
    schema.field('email').required().email();
    schema.field('phone').required().phone();
    schema.field('dateOfBirth').required().date().pastDate();
    schema.field('employeeId').required().pattern(/^EMP[0-9]+$/, 'Employee ID must start with EMP followed by numbers');
    schema.field('department').required();
    schema.field('qualification').required().minLength(2).maxLength(100);
    schema.field('experience').required().positiveNumber();
    schema.field('salary').required().positiveNumber();
    
    return schema;
  },

  feePayment: () => {
    const schema = new ValidationSchema();
    
    schema.field('studentId').required();
    schema.field('amount').required().positiveNumber();
    schema.field('paymentMethod').required();
    schema.field('transactionId').required().minLength(5);
    
    return schema;
  },

  admission: () => {
    const schema = new ValidationSchema();
    
    schema.field('studentName').required().minLength(2).maxLength(100);
    schema.field('email').required().email();
    schema.field('phone').required().phone();
    schema.field('dateOfBirth').required().date().pastDate();
    schema.field('class').required();
    schema.field('previousSchool').required().minLength(2).maxLength(100);
    schema.field('parentName').required().minLength(2).maxLength(100);
    schema.field('parentPhone').required().phone();
    schema.field('address').required().minLength(10).maxLength(200);
    
    return schema;
  },

  login: () => {
    const schema = new ValidationSchema();
    
    schema.field('email').required().email();
    schema.field('password').required().minLength(6);
    
    return schema;
  },

  changePassword: () => {
    const schema = new ValidationSchema();
    
    schema.field('currentPassword').required();
    schema.field('newPassword').required().strongPassword();
    
    return schema;
  }
};

// Utility functions
export const validateField = (value, rules) => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true, error: null };
};

export const validateForm = (formData, schema) => {
  return schema.validate(formData);
};

// Real-time validation debouncer
export const createDebouncedValidator = (validator, delay = 300) => {
  let timeoutId;
  
  return (value, callback) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
};