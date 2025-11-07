const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  department: {
    type: String,
    required: true,
    enum: ['Science', 'Mathematics', 'English', 'Social Studies', 'Physical Education', 'Arts', 'Computer Science', 'Languages']
  },
  class: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E']
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  syllabus: [{
    topic: String,
    description: String,
    duration: Number // in hours
  }],
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    timeSlot: {
      startTime: String, // "09:00"
      endTime: String    // "10:00"
    }
  },
  maxStudents: {
    type: Number,
    default: 40
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  academicYear: {
    type: String,
    required: true,
    default: () => {
      const year = new Date().getFullYear();
      return `${year}-${year + 1}`;
    }
  },
  session: {
    type: String,
    enum: ['1', '2'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ class: 1, section: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ academicYear: 1, session: 1 });

module.exports = mongoose.model('Course', courseSchema);