import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaDownload, FaFilter, 
  FaUsers, FaBook, FaClock, FaCalendarAlt, FaUserGraduate, FaChalkboardTeacher,
  FaSpinner, FaTimes, FaCheck, FaExclamationTriangle, FaFileImport
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config.js';
import { coursesAPI } from '../../services/api';
import { useLoading } from '../../hooks/useLoading';
import { useNotification } from '../../hooks/useNotification';
import CourseForm from '../../components/admin/CourseForm';
import '../../components/admin/CourseForm.css';

export default function ManageCourses() {
  const { user } = useAuth();
  const { isLoading } = useLoading();
  const { showNotification } = useNotification();

  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    class: '',
    academicYear: '',
    session: '',
    status: 'all',
    faculty: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Statistics
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    averageEnrollment: 0
  });

  // Filter options
  const departments = [
    'Science', 'Mathematics', 'English', 'Social Studies', 
    'Physical Education', 'Arts', 'Computer Science', 'Languages'
  ];
  const classes = config.CLASSES;
  const academicYears = generateAcademicYears();
  const sessions = ['1', '2'];

  function generateAcademicYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, searchTerm, filters]);

  useEffect(() => {
    calculateStats();
  }, [courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourses({ retry: true });
      const coursesData = response.data?.data || response.data || [];
      setCourses(coursesData);
      showNotification('Courses loaded successfully', 'success');
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification(error.userMessage || 'Failed to load courses', 'error');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.courseCode?.toLowerCase().includes(term) ||
        course.courseName?.toLowerCase().includes(term) ||
        course.department?.toLowerCase().includes(term) ||
        `${course.faculty?.firstName} ${course.faculty?.lastName}`.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(course => course.department === filters.department);
    }

    // Class filter
    if (filters.class) {
      filtered = filtered.filter(course => course.class === filters.class);
    }

    // Academic year filter
    if (filters.academicYear) {
      filtered = filtered.filter(course => course.academicYear === filters.academicYear);
    }

    // Session filter
    if (filters.session) {
      filtered = filtered.filter(course => (course.session ?? course.semester) === filters.session);
    }

    // Status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(course => course.isActive === isActive);
    }

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const calculateStats = () => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(course => course.isActive).length;
    const totalEnrollments = courses.reduce((sum, course) => 
      sum + (course.enrolledStudents?.length || 0), 0
    );
    const averageEnrollment = totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0;

    setStats({
      totalCourses,
      activeCourses,
      totalEnrollments,
      averageEnrollment
    });
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await coursesAPI.deleteCourse(courseToDelete._id || courseToDelete.id);
      setCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
      showNotification('Course deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting course:', error);
      showNotification(error.userMessage || 'Failed to delete course', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (formMode === 'create') {
        const response = await coursesAPI.createCourse(courseData);
        const newCourse = response.data?.data || response.data || courseData;
        setCourses(prev => [...prev, newCourse]);
        showNotification('Course created successfully', 'success');
      } else if (formMode === 'edit') {
        const response = await coursesAPI.updateCourse(selectedCourse._id || selectedCourse.id, courseData);
        const updatedCourse = response.data?.data || response.data || courseData;
        setCourses(prev => prev.map(course => 
          course._id === selectedCourse._id ? updatedCourse : course
        ));
        showNotification('Course updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      throw new Error(error.userMessage || error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      class: '',
      academicYear: '',
      session: '',
      status: 'all',
      faculty: ''
    });
    setSearchTerm('');
  };

  const exportCourses = () => {
    const csvContent = [
      ['Course Code', 'Course Name', 'Department', 'Class', 'Section', 'Faculty', 'Credits', 'Max Students', 'Enrolled', 'Academic Year', 'Session', 'Status'],
      ...filteredCourses.map(course => [
        course.courseCode,
        course.courseName,
        course.department,
        course.class,
        course.section || '',
        `${course.faculty?.firstName || ''} ${course.faculty?.lastName || ''}`.trim(),
        course.credits,
        course.maxStudents,
        course.enrolledStudents?.length || 0,
        course.academicYear,
        (course.session ?? course.semester),
        course.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const formatSchedule = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return 'Not scheduled';
    const days = schedule.days.map(day => day.slice(0, 3)).join(', ');
    const time = schedule.timeSlot ? 
      `${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime}` : '';
    return `${days} ${time}`.trim();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="manage-courses">
      {/* Header */}
      <div className="courses-header">
        <div className="header-content">
          <h1>Course Management</h1>
          <p>Manage course offerings, faculty assignments, and schedules</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleBulkImport}>
            <FaFileImport /> Bulk Import
          </button>
          <button className="btn btn-secondary" onClick={exportCourses}>
            <FaDownload /> Export
          </button>
          <button className="btn btn-primary" onClick={handleAddCourse}>
            <FaPlus /> Add Course
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FaCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.activeCourses}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalEnrollments}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserGraduate />
          </div>
          <div className="stat-content">
            <h3>{stats.averageEnrollment}</h3>
            <p>Avg. Enrollment</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses, faculty, or departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-grid">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filters.class}
            onChange={(e) => handleFilterChange('class', e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>

          <select
            value={filters.academicYear}
            onChange={(e) => handleFilterChange('academicYear', e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.session}
            onChange={(e) => handleFilterChange('session', e.target.value)}
          >
            <option value="">All Sessions</option>
            {sessions.map(sem => (
              <option key={sem} value={sem}>Session {sem}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="btn btn-secondary" onClick={clearFilters}>
            <FaFilter /> Clear Filters
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Department</th>
              <th>Class</th>
              <th>Faculty</th>
              <th>Schedule</th>
              <th>Enrollment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <span className="course-code">{course.courseCode}</span>
                  </td>
                  <td>
                    <div className="course-info">
                      <span className="course-name">{course.courseName}</span>
                      <span className="course-credits">{course.credits} credits</span>
                    </div>
                  </td>
                  <td>{course.department}</td>
                  <td>
                    <span className="class-section">
                      {course.class}{course.section ? `-${course.section}` : ''}
                    </span>
                  </td>
                  <td>
                    <div className="faculty-info">
                      <FaChalkboardTeacher />
                      <span>
                        {course.faculty ? 
                          `${course.faculty.firstName} ${course.faculty.lastName}` : 
                          'Not assigned'
                        }
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="schedule-info">
                      <FaClock />
                      <span>{formatSchedule(course.schedule)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="enrollment-info">
                      <span className="enrolled">{course.enrolledStudents?.length || 0}</span>
                      <span className="max">/ {course.maxStudents}</span>
                      <div className="enrollment-bar">
                        <div 
                          className="enrollment-fill"
                          style={{ 
                            width: `${((course.enrolledStudents?.length || 0) / course.maxStudents) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewCourse(course)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditCourse(course)}
                        title="Edit Course"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteCourse(course)}
                        title="Delete Course"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  <div className="no-data-content">
                    <FaBook className="no-data-icon" />
                    <h3>No courses found</h3>
                    <p>No courses match your current filters. Try adjusting your search criteria.</p>
                    <button className="btn btn-primary" onClick={handleAddCourse}>
                      <FaPlus /> Add First Course
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            <span>
              Page {currentPage} of {totalPages} 
              ({filteredCourses.length} courses)
            </span>
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      <CourseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCourse}
        course={selectedCourse}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-icon">
                <FaExclamationTriangle />
              </div>
              <p>
                Are you sure you want to delete the course <strong>{courseToDelete?.courseName}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDeleteCourse}
              >
                <FaTrash /> Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .manage-courses {
          padding: 24px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #6c757d;
        }

        .spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .courses-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: #6c757d;
          font-size: 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: #e3f2fd;
          color: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .stat-content h3 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .filters-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 14px;
        }

        .search-box input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: end;
        }

        .filters-grid select {
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .filters-grid select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          margin-bottom: 24px;
        }

        .courses-table {
          width: 100%;
          border-collapse: collapse;
        }

        .courses-table th {
          background: #f8f9fa;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 1px solid #dee2e6;
          font-size: 14px;
        }

        .courses-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f3f4;
          vertical-align: middle;
        }

        .courses-table tbody tr:hover {
          background: #f8f9fa;
        }

        .course-code {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #007bff;
          background: #e3f2fd;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .course-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .course-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .course-credits {
          font-size: 12px;
          color: #6c757d;
        }

        .class-section {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 12px;
        }

        .faculty-info,
        .schedule-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .faculty-info svg,
        .schedule-info svg {
          color: #6c757d;
          font-size: 12px;
        }

        .enrollment-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .enrolled {
          font-weight: 600;
          color: #2c3e50;
        }

        .max {
          color: #6c757d;
          font-size: 12px;
        }

        .enrollment-bar {
          width: 60px;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
        }

        .enrollment-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s ease;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .action-btn.view {
          background: #e3f2fd;
          color: #1976d2;
        }

        .action-btn.view:hover {
          background: #bbdefb;
          transform: translateY(-1px);
        }

        .action-btn.edit {
          background: #fff3e0;
          color: #f57c00;
        }

        .action-btn.edit:hover {
          background: #ffe0b2;
          transform: translateY(-1px);
        }

        .action-btn.delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .action-btn.delete:hover {
          background: #ffcdd2;
          transform: translateY(-1px);
        }

        .no-data {
          text-align: center;
          padding: 60px 20px;
        }

        .no-data-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .no-data-icon {
          font-size: 48px;
          color: #6c757d;
          opacity: 0.5;
        }

        .no-data-content h3 {
          margin: 0;
          color: #495057;
          font-size: 18px;
        }

        .no-data-content p {
          margin: 0;
          color: #6c757d;
          max-width: 400px;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .pagination-btn {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #007bff;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #6c757d;
          font-size: 14px;
        }

        .delete-confirm-modal {
          max-width: 500px;
        }

        .modal-content {
          padding: 24px;
          text-align: center;
        }

        .warning-icon {
          font-size: 48px;
          color: #ffc107;
          margin-bottom: 16px;
        }

        .warning-text {
          color: #6c757d;
          font-size: 14px;
          margin-top: 8px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
        }

        @media (max-width: 768px) {
          .manage-courses {
            padding: 16px;
          }

          .courses-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: stretch;
          }

          .header-actions .btn {
            flex: 1;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: auto;
          }

          .courses-table {
            min-width: 800px;
          }

          .pagination {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}