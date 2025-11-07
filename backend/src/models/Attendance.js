const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true
  },
  timeIn: {
    type: String, // "09:15"
    required: function() {
      return this.status === 'Present' || this.status === 'Late';
    }
  },
  timeOut: {
    type: String // "10:00"
  },
  remarks: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
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
  }
}, {
  timestamps: true
});

// Compound indexes to prevent duplicate entries
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, academicYear: 1, session: 1 });
attendanceSchema.index({ faculty: 1, date: 1 });

// Virtual for attendance percentage
attendanceSchema.virtual('attendancePercentage').get(function() {
  // This would be calculated at the application level
  return this._attendancePercentage;
});

// Static method to calculate attendance percentage
attendanceSchema.statics.calculateAttendancePercentage = async function(studentId, courseId, academicYear, session) {
  const totalClasses = await this.countDocuments({
    student: studentId,
    course: courseId,
    academicYear,
    session
  });
  
  const presentClasses = await this.countDocuments({
    student: studentId,
    course: courseId,
    academicYear,
    session,
    status: { $in: ['Present', 'Late'] }
  });
  
  return totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
};

module.exports = mongoose.model('Attendance', attendanceSchema);