const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// In-memory store for E2E grade data
// This avoids DB dependencies while allowing full-stack validation
const state = {
  grades: [
    {
      id: 'g1', studentId: 'S001', name: 'Rahul Yadav', rollNumber: '001',
      class: '10-A', subject: 'Mathematics', assessment: 'Unit Test 1', assessmentType: 'Unit Test',
      marks: 42, totalMarks: 50, percentage: 84, grade: 'A',
      date: '2024-01-15', remarks: 'Good performance', weightage: 20, isPublished: false
    },
    {
      id: 'g2', studentId: 'S002', name: 'Priya Patel', rollNumber: '002',
      class: '10-A', subject: 'Mathematics', assessment: 'Unit Test 1', assessmentType: 'Unit Test',
      marks: 38, totalMarks: 50, percentage: 76, grade: 'B+',
      date: '2024-01-15', remarks: 'Can improve', weightage: 20, isPublished: false
    }
  ],
  nextId: 3
};

const calculate = (marks, totalMarks) => {
  const percentage = Math.round((marks / totalMarks) * 100);
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C+' : percentage >= 40 ? 'C' : 'F';
  return { percentage, grade };
};

// Lightweight auth for E2E routes that does not hit the database
// Always bypass token verification on E2E router to avoid flaky auth in tests
const e2eAuthenticateToken = (req, res, next) => {
  const hintedRole = req.headers['x-e2e-role'];
  const path = req.path || '';
  const autoRole = path.startsWith('/grades/student') ? 'student' : 'admin';
  req.user = { _id: 'e2e-user', role: hintedRole || autoRole };
  return next();
};

// Issue a signed JWT for E2E tests (no DB)
router.post('/auth/test-login', (req, res) => {
  const { role = 'admin', userId = 'test-user' } = req.body || {};
  if (!['admin', 'faculty', 'student'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const secret = process.env.JWT_SECRET || 'e2e-secret';
  const token = jwt.sign({ id: userId, role }, secret, { expiresIn: '2h' });
  res.json({ success: true, token });
});

// List grades for a class/subject
router.get('/grades', e2eAuthenticateToken, requireRole(['admin', 'faculty']), (req, res) => {
  const { class: cls, subject } = req.query;
  const data = state.grades.filter(g => (!cls || g.class === cls) && (!subject || g.subject === subject));
  res.json({ success: true, data });
});

// Create assessment entries (bulk) for selected students
router.post('/grades/assessment', e2eAuthenticateToken, requireRole(['admin']), (req, res) => {
  const { name, type, totalMarks, date, weightage, students } = req.body;
  if (!name || !type || !totalMarks || !date || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const created = students.map(stu => {
    const id = `g${state.nextId++}`;
    const { percentage, grade } = calculate(0, totalMarks);
    const rec = {
      id,
      studentId: stu.studentId,
      name: stu.name,
      rollNumber: stu.rollNumber,
      class: stu.class,
      subject: stu.subject,
      assessment: name,
      assessmentType: type,
      marks: 0,
      totalMarks,
      percentage,
      grade,
      date,
      remarks: '',
      weightage: weightage ?? 0,
      isPublished: false
    };
    state.grades.push(rec);
    return rec;
  });

  res.status(201).json({ success: true, message: 'Assessment created', data: created });
});

// Update a grade record (marks/remarks/publish)
router.put('/grades/:id', e2eAuthenticateToken, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const grade = state.grades.find(g => g.id === id);
  if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });

  const { marks, totalMarks, remarks, isPublished } = req.body;
  if (typeof marks === 'number') grade.marks = marks;
  if (typeof totalMarks === 'number') grade.totalMarks = totalMarks;
  if (typeof remarks === 'string') grade.remarks = remarks;
  if (typeof isPublished === 'boolean') grade.isPublished = isPublished;

  const { percentage, grade: letter } = calculate(grade.marks, grade.totalMarks);
  grade.percentage = percentage;
  grade.grade = letter;

  res.json({ success: true, message: 'Grade updated', data: grade });
});

// Get published grades for a student
router.get('/grades/student/:studentId', e2eAuthenticateToken, requireRole(['student']), (req, res) => {
  const { studentId } = req.params;
  const data = state.grades.filter(g => g.studentId === studentId && g.isPublished);
  res.json({ success: true, data });
});

module.exports = router;