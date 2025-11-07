import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import './CourseForm.css';
import config from '../../config/config.js';

const CourseForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  course = null, 
  mode = 'create',
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: '',
    department: '',
    class: '',
    session: '',
    academicYear: '',
    faculty: '',
    maxStudents: '',
    prerequisites: '',
    syllabus: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course && mode === 'edit') {
      setFormData({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        description: course.description || '',
        credits: course.credits || '',
        department: course.department || '',
        class: course.class || '',
        session: (course.session ?? course.semester) || '',
        academicYear: course.academicYear || '',
        faculty: course.faculty || '',
        maxStudents: course.maxStudents || '',
        prerequisites: course.prerequisites || '',
        syllabus: course.syllabus || '',
        status: course.status || 'active'
      });
    } else if (mode === 'create') {
      setFormData({
        courseCode: '',
        courseName: '',
        description: '',
        credits: '',
        department: '',
        class: '',
        session: '',
        academicYear: '',
        faculty: '',
        maxStudents: '',
        prerequisites: '',
        syllabus: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [course, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!formData.credits || formData.credits < 1) {
      newErrors.credits = 'Credits must be at least 1';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Class is required';
    }

    if (!String(formData.session).trim()) {
      newErrors.session = 'Session is required';
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }

    if (!formData.maxStudents || formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="course-form-overlay">
      <div className="course-form-modal">
        <div className="course-form-header">
          <h2>
            {mode === 'create' ? 'Add New Course' : 
             mode === 'edit' ? 'Edit Course' : 'View Course'}
          </h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="courseCode">Course Code *</label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.courseCode ? 'error' : ''}
                placeholder="e.g., CS101"
              />
              {errors.courseCode && <span className="error-text">{errors.courseCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="courseName">Course Name *</label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.courseName ? 'error' : ''}
                placeholder="e.g., Introduction to Computer Science"
              />
              {errors.courseName && <span className="error-text">{errors.courseName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="credits">Credits *</label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.credits ? 'error' : ''}
                min="1"
                max="10"
              />
              {errors.credits && <span className="error-text">{errors.credits}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.department ? 'error' : ''}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Economics">Economics</option>
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="class">Class *</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.class ? 'error' : ''}
              >
                <option value="">Select Class</option>
                {config.CLASS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.class && <span className="error-text">{errors.class}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="session">Session *</label>
              <select
                id="session"
                name="session"
                value={formData.session}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.session ? 'error' : ''}
              >
                <option value="">Select Session</option>
                <option value="1">Session 1</option>
                <option value="2">Session 2</option>
              </select>
              {errors.session && <span className="error-text">{errors.session}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="academicYear">Academic Year *</label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.academicYear ? 'error' : ''}
                placeholder="e.g., 2023-2024"
              />
              {errors.academicYear && <span className="error-text">{errors.academicYear}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="faculty">Faculty</label>
              <input
                type="text"
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                placeholder="Assigned faculty member"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxStudents">Maximum Students *</label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
                className={errors.maxStudents ? 'error' : ''}
                min="1"
                placeholder="e.g., 50"
              />
              {errors.maxStudents && <span className="error-text">{errors.maxStudents}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading || mode === 'view'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading || mode === 'view'}
              rows="3"
              placeholder="Course description..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="prerequisites">Prerequisites</label>
            <textarea
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              disabled={loading || mode === 'view'}
              rows="2"
              placeholder="List any prerequisite courses..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="syllabus">Syllabus</label>
            <textarea
              id="syllabus"
              name="syllabus"
              value={formData.syllabus}
              onChange={handleChange}
              disabled={loading || mode === 'view'}
              rows="4"
              placeholder="Course syllabus and topics covered..."
            />
          </div>

          {mode !== 'view' && (
            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create Course' : 'Update Course'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CourseForm;