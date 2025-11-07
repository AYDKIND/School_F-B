// Export all models for easy importing
const User = require('./User');
const Student = require('./Student');
const Faculty = require('./Faculty');
const Admission = require('./Admission');
const { FeeStructure, FeePayment, FeeDue } = require('./Fee');
const Course = require('./Course');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const Grade = require('./Grade');
const AcademicCalendar = require('./AcademicCalendar');
const { Route, Vehicle, TransportAllocation } = require('./Transport');

module.exports = {
  User,
  Student,
  Faculty,
  Admission,
  FeeStructure,
  FeePayment,
  FeeDue,
  Course,
  Subject,
  Attendance,
  Grade,
  AcademicCalendar,
  Route,
  Vehicle,
  TransportAllocation
};