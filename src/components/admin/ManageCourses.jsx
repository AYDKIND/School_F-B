import React, { useState, useEffect } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { useNotification } from '../../hooks/useNotification';
import './ManageCourses.css';
import { coursesAPI } from '../../services/api';

const ManageCourses = () => {
  const { loading, setLoading } = useLoading();
  const { showNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    credits: '',
    session: '',
    description: '',
    prerequisites: '',
    instructor: '',
    maxStudents: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: ''
    }
  });

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Study',
    
  ];

  const sessions = ['1', '2'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getCourses();
      const fetched = Array.isArray(res.data) ? res.data : (res.data?.courses || []);
      const normalized = fetched.map(c => ({
        id: c.id ?? c._id ?? Date.now() + Math.random(),
        courseCode: c.courseCode ?? c.code ?? '',
        courseName: c.courseName ?? c.name ?? '',
        department: c.department ?? c.dept ?? '',
        credits: c.credits ?? c.credit ?? 0,
        session: c.session ?? c.semester ?? '',
        description: c.description ?? '',
        prerequisites: c.prerequisites ?? 'None',
        instructor: c.instructor ?? c.faculty ?? '',
        maxStudents: c.maxStudents ?? c.capacity ?? 0,
        enrolledStudents: c.enrolledStudents ?? c.enrolled ?? 0,
        schedule: {
          days: c.schedule?.days ?? [],
          startTime: c.schedule?.startTime ?? '',
          endTime: c.schedule?.endTime ?? '',
          room: c.schedule?.room ?? ''
        }
      }));
      setCourses(normalized);
    } catch (error) {
      showNotification(error.userMessage || 'Error fetching courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCourse) {
        const courseId = editingCourse.id ?? editingCourse._id;
        await coursesAPI.updateCourse(courseId, formData);
        setCourses(prev => prev.map(course => 
          (course.id ?? course._id) === courseId
            ? { ...formData, id: courseId, enrolledStudents: editingCourse.enrolledStudents ?? 0 }
            : course
        ));
        showNotification('Course updated successfully', 'success');
      } else {
        const res = await coursesAPI.createCourse(formData);
        const created = res.data || formData;
        const newCourse = {
          ...formData,
          id: created.id ?? created._id ?? Date.now(),
          enrolledStudents: created.enrolledStudents ?? 0
        };
        setCourses(prev => [...prev, newCourse]);
        showNotification('Course created successfully', 'success');
      }

      resetForm();
    } catch (error) {
      showNotification(error.userMessage || 'Error saving course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData(course);
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    setLoading(true);
    try {
      await coursesAPI.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => (course.id ?? course._id) !== courseId));
      showNotification('Course deleted successfully', 'success');
    } catch (error) {
      showNotification(error.userMessage || 'Error deleting course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      department: '',
      credits: '',
      session: '',
      description: '',
      prerequisites: '',
      instructor: '',
      maxStudents: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        room: ''
      }
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || course.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="manage-courses">
      <div className="manage-courses-header">
        <h2>Manage Courses</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          Add New Course
        </button>
      </div>

      <div className="courses-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="course-form-modal">
            <div className="modal-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="6"
                  />
                </div>
                <div className="form-group">
                  <label>Session *</label>
                  <select
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Session</option>
                    {sessions.map(sem => (
                      <option key={sem} value={sem}>Session {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Instructor *</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div className="form-group">
                  <label>Max Students *</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Course description..."
                />
              </div>

              <div className="form-group">
                <label>Prerequisites</label>
                <input
                  type="text"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  placeholder="e.g., MATH101, CS100"
                />
              </div>

              <div className="schedule-section">
                <h4>Schedule</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Days</label>
                    <div className="days-checkboxes">
                      {days.map(day => (
                        <label key={day} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.schedule.days.includes(day)}
                            onChange={() => handleDayChange(day)}
                          />
                          {day.slice(0, 3)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      name="schedule.startTime"
                      value={formData.schedule.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      name="schedule.endTime"
                      value={formData.schedule.endTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Room</label>
                    <input
                      type="text"
                      name="schedule.room"
                      value={formData.schedule.room}
                      onChange={handleInputChange}
                      placeholder="e.g., CS-101"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="courses-grid">
        {loading ? (
          <div className="loading-message">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="no-courses">No courses found</div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.courseCode}</h3>
                <div className="course-actions">
                  <button onClick={() => handleEdit(course)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
              <h4>{course.courseName}</h4>
              <div className="course-details">
                <p><strong>Department:</strong> {course.department}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
                <p><strong>Session:</strong> {course.session ?? course.semester}</p>
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Enrollment:</strong> {course.enrolledStudents}/{course.maxStudents}</p>
                {course.schedule.days.length > 0 && (
                  <p><strong>Schedule:</strong> {course.schedule.days.join(', ')} 
                     {course.schedule.startTime && ` ${course.schedule.startTime}-${course.schedule.endTime}`}
                     {course.schedule.room && ` (${course.schedule.room})`}
                  </p>
                )}
                {course.description && (
                  <p><strong>Description:</strong> {course.description}</p>
                )}
                {course.prerequisites && course.prerequisites !== 'None' && (
                  <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCourses;