const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: [
      'Holiday',
      'Exam',
      'Assignment Due',
      'Parent Meeting',
      'Sports Event',
      'Cultural Event',
      'Academic Event',
      'Administrative',
      'Fee Due Date',
      'Admission',
      'Result Declaration',
      'Vacation'
    ],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  isAllDay: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: String, // "09:00"
    required: function() {
      return !this.isAllDay;
    }
  },
  endTime: {
    type: String, // "17:00"
    required: function() {
      return !this.isAllDay;
    }
  },
  location: {
    type: String,
    trim: true
  },
  targetAudience: {
    type: [String],
    enum: ['All', 'Students', 'Faculty', 'Parents', 'Admin', 'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10', 'Class-11', 'Class-12'],
    default: ['All']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  color: {
    type: String,
    default: '#3498db' // Blue color for events
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly']
    },
    interval: Number, // Every X days/weeks/months/years
    endRecurrence: Date
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 1 // Remind 1 day before
    }
  }
}, {
  timestamps: true
});

// Indexes
academicCalendarSchema.index({ startDate: 1, endDate: 1 });
academicCalendarSchema.index({ eventType: 1 });
academicCalendarSchema.index({ targetAudience: 1 });
academicCalendarSchema.index({ academicYear: 1 });
academicCalendarSchema.index({ createdBy: 1 });

// Virtual for event duration
academicCalendarSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to get events for a date range
academicCalendarSchema.statics.getEventsInRange = function(startDate, endDate, targetAudience = 'All') {
  const query = {
    isActive: true,
    $or: [
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  };
  
  if (targetAudience !== 'All') {
    query.targetAudience = { $in: [targetAudience, 'All'] };
  }
  
  return this.find(query).sort({ startDate: 1 });
};

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);