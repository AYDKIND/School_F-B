import React, { useState, useEffect } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { useNotification } from '../../hooks/useNotification';
import { adminAPI, coursesAPI, studentAPI } from '../../services/api.js';
import './FacultyAssignment.css';

const FacultyAssignment = () => {
  const { loading, setLoading } = useLoading();
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [viewMode, setViewMode] = useState('assignments'); // 'assignments', 'faculty', 'courses'

  const [formData, setFormData] = useState({
    facultyId: '',
    courseId: '',
    classId: '',
    session: '',
    academicYear: '',
    assignmentType: 'primary', // primary, secondary, substitute
    startDate: '',
    endDate: '',
    workload: '',
    notes: ''
  });

  const departments = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'Social Studies'
  ];

  const sessions = ['1', '2'];
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
    `${currentYear - 1}-${currentYear}`
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facultyRes, coursesRes, classesRes, assignmentsRes] = await Promise.all([
        adminAPI.getFaculty({ retry: true }),
        coursesAPI.getCourses({ retry: true }),
        studentAPI.getClasses({ retry: true }),
        adminAPI.getAssignments({ retry: true })
      ]);

      const facultyData = facultyRes.data?.data || facultyRes.data || [];
      const coursesData = coursesRes.data?.data || coursesRes.data || [];
      const classesData = classesRes.data?.data || classesRes.data || [];
      const assignmentsData = assignmentsRes.data?.data || assignmentsRes.data || [];

      // Normalize for local usage
      const normalizedFaculty = (facultyData || []).map(f => ({
        id: f._id || f.id,
        name: `${f.firstName || f.name || ''} ${f.lastName || ''}`.trim(),
        email: f.email,
        department: f.department,
        designation: f.designation,
        specialization: f.specialization || '',
        maxWorkload: f.maxWorkload || 16
      }));

      const normalizedCourses = (coursesData || []).map(c => ({
        id: c._id || c.id,
        code: c.courseCode || c.code,
        name: c.courseName || c.name,
        department: c.department,
        credits: c.credits || 0
      }));

      const normalizedClasses = (classesData || []).map(cl => ({
        id: cl._id || cl.id,
        name: cl.name || `${cl.class || ''} ${cl.section || ''}`.trim(),
        section: cl.section || '',
        grade: cl.grade || cl.class || ''
      }));

      const normalizedAssignments = (assignmentsData || []).map(a => ({
        id: a._id || a.id,
        facultyId: a.facultyId || a.faculty?._id,
        courseId: a.courseId || a.course?._id,
        classId: a.classId || a.class?._id,
        session: (a.session?.toString?.() || a.session || a.semester || '1'),
        academicYear: a.academicYear,
        assignmentType: a.assignmentType || 'primary',
        startDate: a.startDate,
        endDate: a.endDate,
        workload: a.workload || 0,
        notes: a.notes || '',
        faculty: a.faculty || normalizedFaculty.find(f => f.id === (a.facultyId || a.faculty?._id)),
        course: a.course || normalizedCourses.find(c => c.id === (a.courseId || a.course?._id)),
        class: a.class || normalizedClasses.find(cl => cl.id === (a.classId || a.class?._id))
      }));

      setFaculty(normalizedFaculty);
      setCourses(normalizedCourses);
      setClasses(normalizedClasses);
      setAssignments(normalizedAssignments);
    } catch (error) {
      showNotification(error.userMessage || 'Error fetching data', 'error');
      setFaculty([]);
      setCourses([]);
      setClasses([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate workload
      const selectedFaculty = faculty.find(f => `${f.id}` === `${formData.facultyId}`);
      const currentWorkload = assignments
        .filter(a => `${a.facultyId}` === `${formData.facultyId}` && a.academicYear === formData.academicYear)
        .reduce((total, a) => total + a.workload, 0);
      
      const newWorkload = editingAssignment ? 
        currentWorkload - (editingAssignment.workload || 0) + parseInt(formData.workload) :
        currentWorkload + parseInt(formData.workload);

      if (newWorkload > selectedFaculty.maxWorkload) {
        showNotification(
          `Workload exceeds maximum limit. Current: ${currentWorkload}, Max: ${selectedFaculty.maxWorkload}`,
          'error'
        );
        setLoading(false);
        return;
      }

      // Check for conflicts
      const hasConflict = assignments.some(assignment => {
        if (editingAssignment && assignment.id === editingAssignment.id) return false;
        return `${assignment.facultyId}` === `${formData.facultyId}` &&
               `${assignment.courseId}` === `${formData.courseId}` &&
               `${assignment.classId}` === `${formData.classId}` &&
               `${(assignment.session ?? assignment.semester)}` === `${formData.session}` &&
               assignment.academicYear === formData.academicYear;
      });

      if (hasConflict) {
        showNotification('Assignment conflict detected! This faculty is already assigned to this course and class.', 'error');
        setLoading(false);
        return;
      }

      const payload = {
        facultyId: formData.facultyId,
        courseId: formData.courseId,
        classId: formData.classId,
        session: formData.session,
        academicYear: formData.academicYear,
        assignmentType: formData.assignmentType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        workload: parseInt(formData.workload),
        notes: formData.notes || ''
      };

      if (editingAssignment) {
        await adminAPI.updateAssignment(editingAssignment.id, payload);
        // Optimistically update local state
        const selectedCourse = courses.find(c => `${c.id}` === `${formData.courseId}`);
        const selectedClass = classes.find(c => `${c.id}` === `${formData.classId}`);
        setAssignments(prev => prev.map(assignment => 
          assignment.id === editingAssignment.id
            ? {
                ...payload,
                id: editingAssignment.id,
                faculty: selectedFaculty,
                course: selectedCourse,
                class: selectedClass
              }
            : assignment
        ));
        showNotification('Assignment updated successfully', 'success');
      } else {
        const res = await adminAPI.createAssignment(payload);
        const created = res.data?.data || res.data || payload;
        const selectedCourse = courses.find(c => `${c.id}` === `${created.courseId}`);
        const selectedClass = classes.find(c => `${c.id}` === `${created.classId}`);
        const newAssignment = {
          ...created,
          id: created._id || created.id || Date.now(),
          faculty: selectedFaculty,
          course: selectedCourse,
          class: selectedClass
        };
        setAssignments(prev => [...prev, newAssignment]);
        showNotification('Assignment created successfully', 'success');
      }

      resetForm();
    } catch (error) {
      showNotification(error.userMessage || 'Error saving assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      facultyId: assignment.facultyId.toString(),
      courseId: assignment.courseId.toString(),
      classId: assignment.classId.toString(),
      session: assignment.session ?? assignment.semester,
      academicYear: assignment.academicYear,
      assignmentType: assignment.assignmentType,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      workload: assignment.workload.toString(),
      notes: assignment.notes
    });
    setShowForm(true);
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    setLoading(true);
    try {
      await adminAPI.deleteAssignment(assignmentId);
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      showNotification('Assignment deleted successfully', 'success');
    } catch (error) {
      showNotification(error.userMessage || 'Error deleting assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      facultyId: '',
      courseId: '',
      classId: '',
      session: '',
      academicYear: '',
      assignmentType: 'primary',
      startDate: '',
      endDate: '',
      workload: '',
      notes: ''
    });
    setEditingAssignment(null);
    setShowForm(false);
  };

  const getFilteredAssignments = () => {
    return assignments.filter(assignment => {
      const matchesFaculty = !filterFaculty || assignment.facultyId === parseInt(filterFaculty);
      const matchesDepartment = !filterDepartment || assignment.faculty.department === filterDepartment;
      return matchesFaculty && matchesDepartment;
    });
  };

  const getFacultyWorkload = (facultyId, academicYear) => {
    return assignments
      .filter(a => a.facultyId === facultyId && a.academicYear === academicYear)
      .reduce((total, a) => total + a.workload, 0);
  };

  const renderAssignmentsView = () => {
    const filteredAssignments = getFilteredAssignments();
    
    return (
      <div className="assignments-grid">
        {filteredAssignments.length === 0 ? (
          <div className="no-assignments">No assignments found</div>
        ) : (
          filteredAssignments.map(assignment => (
            <div key={assignment.id} className={`assignment-card ${assignment.assignmentType}`}>
              <div className="assignment-header">
                <h3>{assignment.course.code} - {assignment.course.name}</h3>
                <div className="assignment-actions">
                  <button onClick={() => handleEdit(assignment)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(assignment.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
              <div className="assignment-details">
                <p><strong>Faculty:</strong> {assignment.faculty.name}</p>
                <p><strong>Class:</strong> {assignment.class.name}</p>
                <p><strong>Department:</strong> {assignment.faculty.department}</p>
                <p><strong>Session:</strong> {assignment.session ?? assignment.semester}</p>
                <p><strong>Academic Year:</strong> {assignment.academicYear}</p>
                <p><strong>Type:</strong> {assignment.assignmentType}</p>
                <p><strong>Workload:</strong> {assignment.workload} hours/week</p>
                <p><strong>Duration:</strong> {assignment.startDate} to {assignment.endDate}</p>
                {assignment.notes && (
                  <p><strong>Notes:</strong> {assignment.notes}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderFacultyView = () => {
    return (
      <div className="faculty-workload-grid">
        {faculty.map(member => {
          const currentWorkload = getFacultyWorkload(member.id, academicYears[0]);
          const workloadPercentage = (currentWorkload / member.maxWorkload) * 100;
          
          return (
            <div key={member.id} className="faculty-workload-card">
              <div className="faculty-info">
                <h3>{member.name}</h3>
                <p><strong>Department:</strong> {member.department}</p>
                <p><strong>Designation:</strong> {member.designation}</p>
                <p><strong>Specialization:</strong> {member.specialization}</p>
              </div>
              <div className="workload-info">
                <div className="workload-bar">
                  <div 
                    className="workload-fill"
                    style={{ 
                      width: `${Math.min(workloadPercentage, 100)}%`,
                      backgroundColor: workloadPercentage > 90 ? '#e74c3c' : 
                                     workloadPercentage > 70 ? '#f39c12' : '#27ae60'
                    }}
                  ></div>
                </div>
                <p className="workload-text">
                  {currentWorkload} / {member.maxWorkload} hours ({workloadPercentage.toFixed(1)}%)
                </p>
              </div>
              <div className="faculty-assignments">
                <h4>Current Assignments:</h4>
                {assignments
                  .filter(a => a.facultyId === member.id)
                  .map(assignment => (
                    <div key={assignment.id} className="mini-assignment">
                      {assignment.course.code} - {assignment.class.name} ({assignment.workload}h)
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="faculty-assignment">
      <div className="assignment-header">
        <h2>Faculty Assignment</h2>
        <div className="header-actions">
          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'assignments' ? 'active' : ''}`}
              onClick={() => setViewMode('assignments')}
            >
              Assignments
            </button>
            <button 
              className={`view-btn ${viewMode === 'faculty' ? 'active' : ''}`}
              onClick={() => setViewMode('faculty')}
            >
              Faculty Workload
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            New Assignment
          </button>
        </div>
      </div>

      <div className="assignment-filters">
        <div className="filter-group">
          <select
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
            className="filter-select"
          >
            <option value="">All Faculty</option>
            {faculty.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
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
          <div className="assignment-form-modal">
            <div className="modal-header">
              <h3>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="assignment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Faculty *</label>
                  <select
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Course *</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
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
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Academic Year *</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assignment Type</label>
                  <select
                    name="assignmentType"
                    value={formData.assignmentType}
                    onChange={handleInputChange}
                  >
                    <option value="primary">Primary Instructor</option>
                    <option value="secondary">Secondary Instructor</option>
                    <option value="substitute">Substitute</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Workload (hours/week) *</label>
                  <input
                    type="number"
                    name="workload"
                    value={formData.workload}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes or comments..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="assignment-content">
        {loading ? (
          <div className="loading-message">Loading assignments...</div>
        ) : viewMode === 'assignments' ? (
          renderAssignmentsView()
        ) : (
          renderFacultyView()
        )}
      </div>
    </div>
  );
};

export default FacultyAssignment;