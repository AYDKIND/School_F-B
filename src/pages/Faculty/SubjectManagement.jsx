import React, { useState, useEffect } from 'react';
import config from '../../config/config.js';
import { subjectAPI, generalAPI } from '../../services/api.js';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaStar,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaGraduationCap,
  FaBookOpen,
  FaVideo,
  FaLink,
  FaFolder,
  FaPlay,
  FaClock,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaUpload,
  FaChalkboard,
  FaFlask,
  FaLightbulb,
  FaClipboardList,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';

export default function SubjectManagement() {
  // State management
  const [activeTab, setActiveTab] = useState('subjects'); // subjects, curriculum, resources, analytics
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Static options (align with backend validation)
  const departments = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
  const categories = ['Core', 'Elective', 'Optional', 'Extra-curricular', 'Vocational'];
  const classes = config.CLASSES;

  // Subjects loaded from API
  const [subjects, setSubjects] = useState([]);
  const [apiError, setApiError] = useState('');

  const [newSubject, setNewSubject] = useState({
    subjectCode: '',
    subjectName: '',
    department: '',
    category: '',
    credits: 1,
    totalHours: 0,
    theoryHours: 0,
    practicalHours: 0,
    description: '',
    applicableClasses: []
  });

  const [newUnit, setNewUnit] = useState({
    unitNumber: 1,
    unitTitle: '',
    topics: []
  });

  // Normalize backend subjects to UI shape
  const normalizeSubject = (s) => ({
    id: s._id || s.id,
    subjectCode: s.code || s.subjectCode,
    subjectName: s.name || s.subjectName,
    department: s.department || '—',
    category: s.category || 'Core',
    credits: s.credits ?? 0,
    totalHours: s.totalHours ?? 0,
    theoryHours: s.theoryHours ?? 0,
    practicalHours: s.practicalHours ?? 0,
    applicableClasses: s.applicableClasses ?? [],
    status: s.isActive === false ? 'inactive' : 'active',
    approvalStatus: s.approvalStatus || 'Draft',
    assignedFaculty: s.assignedFaculty || [],
    curriculum: s.curriculum || { objectives: s.objectives || [], units: [] },
    resources: s.resources || { textbooks: [], onlineResources: [] },
    statistics: s.statistics || { enrolledStudents: 0, averageGrade: 0, completionRate: 0, satisfactionScore: 0 }
  });

  // Fetch subjects from API on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setApiError('');
      try {
        // Try managed endpoint first
        const resp = await subjectAPI.getSubjects({ limit: 50 });
        const list = resp.data?.data || resp.data;
        setSubjects(Array.isArray(list) ? list.map(normalizeSubject) : []);
      } catch (err) {
        // Fallback to public subjects
        try {
          const pubResp = await generalAPI.getPublicSubjects();
          const list = pubResp.data?.data || pubResp.data;
          setSubjects(Array.isArray(list) ? list.map(normalizeSubject) : []);
        } catch (err2) {
          setApiError(err2.userMessage || 'Failed to load subjects');
          setSubjects([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const [newResource, setNewResource] = useState({
    type: 'textbook', // textbook, online, equipment
    title: '',
    author: '',
    url: '',
    isRequired: true
  });

  // Filter subjects based on search and filters
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || subject.department === filterDepartment;
    const matchesCategory = filterCategory === 'all' || subject.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || subject.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const statistics = {
    totalSubjects: subjects.length,
    activeSubjects: subjects.filter(s => s.status === 'active').length,
    approvedSubjects: subjects.filter(s => s.approvalStatus === 'Approved').length,
    totalCredits: subjects.reduce((sum, s) => sum + s.credits, 0),
    avgCredits: subjects.length > 0 ? (subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length).toFixed(1) : 0,
    totalStudents: subjects.reduce((sum, s) => sum + (s.statistics?.enrolledStudents || 0), 0)
  };

  // Handle functions
  const handleAddSubject = async () => {
    if (!newSubject.subjectName || !newSubject.subjectCode) return;
    setSaving(true);
    setApiError('');
    try {
      // Ensure minimum applicableClasses per backend validation
      const payload = {
        subjectCode: newSubject.subjectCode.toUpperCase(),
        subjectName: newSubject.subjectName,
        department: newSubject.department,
        category: newSubject.category,
        credits: newSubject.credits,
        totalHours: newSubject.totalHours,
        theoryHours: newSubject.theoryHours,
        practicalHours: newSubject.practicalHours,
        description: newSubject.description,
        applicableClasses: newSubject.applicableClasses?.length ? newSubject.applicableClasses : [
          { class: '10', stream: 'General', isCompulsory: true }
        ]
      };

      const resp = await subjectAPI.createSubject(payload);
      const created = resp.data?.data || resp.data;
      setSubjects(prev => [...prev, normalizeSubject(created)]);
      // Reset form
      setNewSubject({
        subjectCode: '',
        subjectName: '',
        department: '',
        category: '',
        credits: 1,
        totalHours: 0,
        theoryHours: 0,
        practicalHours: 0,
        description: '',
        applicableClasses: []
      });
      setShowAddModal(false);
    } catch (err) {
      setApiError(err.userMessage || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingItem(subject);
    setShowEditModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    setSaving(true);
    setApiError('');
    try {
      await subjectAPI.deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      if (selectedSubject?.id === subjectId) setSelectedSubject(null);
    } catch (err) {
      setApiError(err.userMessage || 'Failed to delete subject');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurriculumUnit = () => {
    if (!selectedSubject || !newUnit.unitTitle) return;
    
    setSaving(true);
    setTimeout(() => {
      const updatedSubjects = subjects.map(subject => {
        if (subject.id === selectedSubject.id) {
          return {
            ...subject,
            curriculum: {
              ...subject.curriculum,
              units: [...subject.curriculum.units, { ...newUnit, id: Date.now() }]
            }
          };
        }
        return subject;
      });
      
      setSubjects(updatedSubjects);
      setSelectedSubject(updatedSubjects.find(s => s.id === selectedSubject.id));
      setNewUnit({ unitNumber: 1, unitTitle: '', topics: [] });
      setShowCurriculumModal(false);
      setSaving(false);
    }, 1000);
  };

  const handleAddResource = () => {
    if (!selectedSubject || !newResource.title) return;
    
    setSaving(true);
    setTimeout(() => {
      const updatedSubjects = subjects.map(subject => {
        if (subject.id === selectedSubject.id) {
          const resourceKey = newResource.type === 'textbook' ? 'textbooks' : 'onlineResources';
          return {
            ...subject,
            resources: {
              ...subject.resources,
              [resourceKey]: [...subject.resources[resourceKey], { ...newResource, id: Date.now() }]
            }
          };
        }
        return subject;
      });
      
      setSubjects(updatedSubjects);
      setSelectedSubject(updatedSubjects.find(s => s.id === selectedSubject.id));
      setNewResource({ type: 'textbook', title: '', author: '', url: '', isRequired: true });
      setShowResourceModal(false);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="subject-management">
      <div className="page-header">
        <div className="header-content">
          <h1><FaBook /> Subject Management</h1>
          <p>Manage subjects, curriculum, and educational resources</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Subject
          </button>
        </div>
      </div>
      {apiError && (
        <div className="error-banner" style={{background:'#ffebee', color:'#c62828', padding:'12px 16px', borderRadius:8, marginBottom:16}}>
          <FaExclamationTriangle style={{marginRight:8}} /> {apiError}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.totalSubjects}</div>
            <div className="stat-label">Total Subjects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.activeSubjects}</div>
            <div className="stat-label">Active Subjects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.approvedSubjects}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <FaBook /> Subjects
        </button>
        <button 
          className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <FaClipboardList /> Curriculum
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <FaFolder /> Resources
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
      </div>

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <>
          {/* Controls */}
          <div className="controls-section">
            <div className="controls-row">
              <div className="control-group">
                <label>Search</label>
                <div className="input-with-icon">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="control-group">
                <label>Department</label>
                <select 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <label>Category</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <label>Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="subjects-grid">
            {filteredSubjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div className="card-header">
                  <div className="subject-info">
                    <h3>{subject.subjectName}</h3>
                    <span className="subject-code">{subject.subjectCode}</span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => setSelectedSubject(subject)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditSubject(subject)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDeleteSubject(subject.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <div className="subject-details">
                    <div className="detail-item">
                      <span className="label">Department:</span>
                      <span className="value">{subject.department}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span className={`badge ${subject.category.toLowerCase()}`}>
                        {subject.category}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Credits:</span>
                      <span className="value">{subject.credits}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Hours:</span>
                      <span className="value">{subject.totalHours}</span>
                    </div>
                  </div>

                  <div className="subject-stats">
                    <div className="stat-item">
                      <FaUsers />
                      <span>{subject.statistics?.enrolledStudents || 0} Students</span>
                    </div>
                    <div className="stat-item">
                      <FaChartLine />
                      <span>{subject.statistics?.averageGrade || 0}% Avg Grade</span>
                    </div>
                  </div>

                  <div className="approval-status">
                    <span className={`status-badge ${subject.approvalStatus.toLowerCase()}`}>
                      {subject.approvalStatus === 'Approved' && <FaCheckCircle />}
                      {subject.approvalStatus === 'Pending' && <FaClock />}
                      {subject.approvalStatus === 'Rejected' && <FaTimesCircle />}
                      {subject.approvalStatus}
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="assigned-faculty">
                    <FaUserTie />
                    <span>
                      {subject.assignedFaculty.length > 0 
                        ? `${subject.assignedFaculty[0].name}${subject.assignedFaculty.length > 1 ? ` +${subject.assignedFaculty.length - 1} more` : ''}`
                        : 'No faculty assigned'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && (
        <div className="curriculum-section">
          {!selectedSubject ? (
            <div className="empty-state">
              <FaClipboardList />
              <h3>Select a Subject</h3>
              <p>Choose a subject from the subjects tab to manage its curriculum</p>
            </div>
          ) : (
            <div className="curriculum-content">
              <div className="curriculum-header">
                <h2>{selectedSubject.subjectName} - Curriculum</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCurriculumModal(true)}
                >
                  <FaPlus /> Add Unit
                </button>
              </div>

              <div className="curriculum-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                  {selectedSubject.curriculum.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div className="curriculum-units">
                <h3>Curriculum Units</h3>
                {selectedSubject.curriculum.units.map(unit => (
                  <div key={unit.unitNumber} className="unit-card">
                    <div className="unit-header">
                      <h4>Unit {unit.unitNumber}: {unit.unitTitle}</h4>
                    </div>
                    <div className="unit-topics">
                      {unit.topics.map((topic, index) => (
                        <div key={index} className="topic-item">
                          <div className="topic-info">
                            <span className="topic-name">{topic.name}</span>
                            <span className={`difficulty ${topic.difficulty.toLowerCase()}`}>
                              {topic.difficulty}
                            </span>
                          </div>
                          <div className="topic-duration">
                            <FaClock /> {topic.duration}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="resources-section">
          {!selectedSubject ? (
            <div className="empty-state">
              <FaFolder />
              <h3>Select a Subject</h3>
              <p>Choose a subject from the subjects tab to manage its resources</p>
            </div>
          ) : (
            <div className="resources-content">
              <div className="resources-header">
                <h2>{selectedSubject.subjectName} - Resources</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowResourceModal(true)}
                >
                  <FaPlus /> Add Resource
                </button>
              </div>

              <div className="resources-grid">
                <div className="resource-category">
                  <h3><FaBook /> Textbooks</h3>
                  <div className="resource-list">
                    {selectedSubject.resources.textbooks.map((book, index) => (
                      <div key={index} className="resource-item">
                        <div className="resource-info">
                          <h4>{book.title}</h4>
                          <p>by {book.author}</p>
                        </div>
                        <div className="resource-status">
                          {book.isRequired && <span className="required-badge">Required</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resource-category">
                  <h3><FaLink /> Online Resources</h3>
                  <div className="resource-list">
                    {selectedSubject.resources.onlineResources.map((resource, index) => (
                      <div key={index} className="resource-item">
                        <div className="resource-info">
                          <h4>{resource.title}</h4>
                          <p>{resource.type}</p>
                        </div>
                        <div className="resource-actions">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                            <FaLink /> Visit
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Department Distribution</h3>
              <div className="chart-placeholder">
                <FaChartLine />
                <p>Department-wise subject distribution chart</p>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Category Breakdown</h3>
              <div className="chart-placeholder">
                <FaChartLine />
                <p>Subject category breakdown chart</p>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Approval Status</h3>
              <div className="chart-placeholder">
                <FaChartLine />
                <p>Subject approval status chart</p>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Student Enrollment</h3>
              <div className="chart-placeholder">
                <FaChartLine />
                <p>Student enrollment trends</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Subject</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Subject Code:</label>
                  <input 
                    type="text"
                    value={newSubject.subjectCode}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subjectCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., MATH101"
                  />
                </div>
                <div className="form-group">
                  <label>Subject Name:</label>
                  <input 
                    type="text"
                    value={newSubject.subjectName}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, subjectName: e.target.value }))}
                    placeholder="Subject name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department:</label>
                  <select 
                    value={newSubject.department}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select 
                    value={newSubject.category}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits:</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Total Hours:</label>
                  <input 
                    type="number"
                    min="1"
                    value={newSubject.totalHours}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, totalHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Theory Hours:</label>
                  <input 
                    type="number"
                    min="0"
                    value={newSubject.theoryHours}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, theoryHours: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Practical Hours:</label>
                  <input 
                    type="number"
                    min="0"
                    value={newSubject.practicalHours}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, practicalHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea 
                  value={newSubject.description}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Subject description..."
                  rows="3"
                />
              </div>
              {/* Minimal applicable class to satisfy backend validation */}
              <div className="form-row">
                <div className="form-group">
                  <label>Applicable Class (at least one required):</label>
                  <select
                    value={newSubject.applicableClasses[0]?.class || ''}
                    onChange={(e) => setNewSubject(prev => ({
                      ...prev,
                      applicableClasses: [{
                        class: e.target.value.replace('th','').replace('st','').replace('nd','').replace('rd',''),
                        stream: prev.applicableClasses[0]?.stream || 'General',
                        isCompulsory: prev.applicableClasses[0]?.isCompulsory ?? true
                      }]
                    }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stream:</label>
                  <input
                    type="text"
                    value={newSubject.applicableClasses[0]?.stream || 'General'}
                    onChange={(e) => setNewSubject(prev => ({
                      ...prev,
                      applicableClasses: [{
                        class: prev.applicableClasses[0]?.class || '10',
                        stream: e.target.value,
                        isCompulsory: prev.applicableClasses[0]?.isCompulsory ?? true
                      }]
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddSubject}
                disabled={saving || !newSubject.subjectName || !newSubject.subjectCode}
              >
                {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Curriculum Unit Modal */}
      {showCurriculumModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Curriculum Unit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCurriculumModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Number:</label>
                  <input 
                    type="number"
                    min="1"
                    value={newUnit.unitNumber}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, unitNumber: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Title:</label>
                  <input 
                    type="text"
                    value={newUnit.unitTitle}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, unitTitle: e.target.value }))}
                    placeholder="Unit title"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCurriculumModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddCurriculumUnit}
                disabled={saving || !newUnit.unitTitle}
              >
                {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save Unit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Subject</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Subject Code:</label>
                  <input
                    type="text"
                    value={editingItem.subjectCode || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, subjectCode: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="form-group">
                  <label>Subject Name:</label>
                  <input
                    type="text"
                    value={editingItem.subjectName || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, subjectName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department:</label>
                  <select
                    value={editingItem.department || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingItem.credits ?? 0}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Total Hours:</label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.totalHours ?? 0}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, totalHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Theory Hours:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.theoryHours ?? 0}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, theoryHours: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Practical Hours:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.practicalHours ?? 0}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, practicalHours: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  setSaving(true);
                  setApiError('');
                  try {
                    const payload = {
                      subjectCode: editingItem.subjectCode,
                      subjectName: editingItem.subjectName,
                      department: editingItem.department,
                      category: editingItem.category,
                      credits: editingItem.credits,
                      totalHours: editingItem.totalHours,
                      theoryHours: editingItem.theoryHours,
                      practicalHours: editingItem.practicalHours,
                      description: editingItem.description
                    };
                    await subjectAPI.updateSubject(editingItem.id, payload);
                    setSubjects(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...editingItem } : s));
                    setShowEditModal(false);
                  } catch (err) {
                    setApiError(err.userMessage || 'Failed to update subject');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || !editingItem.subjectName || !editingItem.subjectCode}
              >
                {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResourceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Resource</h3>
              <button 
                className="close-btn"
                onClick={() => setShowResourceModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Resource Type:</label>
                <select 
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="textbook">Textbook</option>
                  <option value="online">Online Resource</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input 
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Resource title"
                />
              </div>
              {newResource.type === 'textbook' && (
                <div className="form-group">
                  <label>Author:</label>
                  <input 
                    type="text"
                    value={newResource.author}
                    onChange={(e) => setNewResource(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>
              )}
              {newResource.type === 'online' && (
                <div className="form-group">
                  <label>URL:</label>
                  <input 
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={newResource.isRequired}
                    onChange={(e) => setNewResource(prev => ({ ...prev, isRequired: e.target.checked }))}
                  />
                  Required Resource
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowResourceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddResource}
                disabled={saving || !newResource.title}
              >
                {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save Resource'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .subject-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .header-content h1 {
          margin: 0;
          font-size: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-content p {
          margin: 8px 0 0 0;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .tab-btn:hover {
          background: #f5f5f5;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .controls-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .controls-row {
          display: flex;
          gap: 20px;
          align-items: end;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }

        .control-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 12px;
          color: #666;
          z-index: 1;
        }

        .input-with-icon input {
          padding: 10px 12px 10px 40px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          transition: border-color 0.3s;
        }

        .control-group select {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .subject-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .subject-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .card-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%);
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .subject-info h3 {
          margin: 0 0 4px 0;
          color: #333;
          font-size: 18px;
        }

        .subject-code {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: white;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .btn-icon:hover {
          background: #667eea;
          color: white;
        }

        .btn-icon.delete:hover {
          background: #e74c3c;
        }

        .card-content {
          padding: 20px;
        }

        .subject-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-item .label {
          font-weight: 500;
          color: #666;
          font-size: 14px;
        }

        .detail-item .value {
          font-weight: 600;
          color: #333;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge.core { background: #e8f5e8; color: #2e7d32; }
        .badge.elective { background: #fff3e0; color: #f57c00; }
        .badge.optional { background: #e3f2fd; color: #1976d2; }
        .badge.extra-curricular { background: #f3e5f5; color: #7b1fa2; }
        .badge.vocational { background: #e0f2f1; color: #00695c; }

        .subject-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #666;
        }

        .approval-status {
          margin-bottom: 16px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.approved { background: #e8f5e8; color: #2e7d32; }
        .status-badge.pending { background: #fff3e0; color: #f57c00; }
        .status-badge.rejected { background: #ffebee; color: #c62828; }
        .status-badge.draft { background: #f5f5f5; color: #666; }

        .card-footer {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .assigned-faculty {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
        }

        .curriculum-section,
        .resources-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state svg {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .curriculum-header,
        .resources-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .curriculum-objectives {
          margin-bottom: 30px;
        }

        .curriculum-objectives h3 {
          margin-bottom: 16px;
          color: #333;
        }

        .curriculum-objectives ul {
          list-style: none;
          padding: 0;
        }

        .curriculum-objectives li {
          padding: 8px 0;
          padding-left: 20px;
          position: relative;
        }

        .curriculum-objectives li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #4caf50;
          font-weight: bold;
        }

        .unit-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .unit-header h4 {
          margin: 0;
          color: #333;
        }

        .unit-topics {
          margin-top: 16px;
        }

        .topic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .topic-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topic-name {
          font-weight: 500;
        }

        .difficulty {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .difficulty.easy { background: #e8f5e8; color: #2e7d32; }
        .difficulty.medium { background: #fff3e0; color: #f57c00; }
        .difficulty.hard { background: #ffebee; color: #c62828; }

        .topic-duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #666;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .resource-category h3 {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
        }

        .resource-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .resource-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #333;
        }

        .resource-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .required-badge {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .analytics-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .analytics-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .analytics-card h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .chart-placeholder {
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
          background: white;
          border-radius: 6px;
        }

        .chart-placeholder svg {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #666;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .subject-management {
            padding: 10px;
          }

          .page-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }

          .subjects-grid {
            grid-template-columns: 1fr;
          }

          .subject-details {
            grid-template-columns: 1fr;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal {
            width: 95%;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
}