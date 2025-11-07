import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaDownload, 
  FaSearch,
  FaFilter,
  FaCalculator,
  FaChartLine,
  FaFileExport,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaStar,
  FaAward
} from 'react-icons/fa';

export default function FacultyGrades() {
  const E2E = import.meta.env.VITE_E2E_MODE === 'true';
  const API_BASE = 'http://localhost:5000/api/e2e';
  // State management
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedAssessment, setSelectedAssessment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table, cards, analytics

  // Mock data
  const classes = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const assessmentTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Assignment', 'Project', 'Quiz', 'Practical'];

  const [gradebook, setGradebook] = useState([
    { 
      id: 1, 
      studentId: 'S001',
      name: 'Rahul Yadav', 
      rollNumber: '001',
      class: '10-A', 
      subject: 'Mathematics', 
      assessment: 'Unit Test 1', 
      assessmentType: 'Unit Test',
      marks: 42, 
      totalMarks: 50,
      percentage: 84,
      grade: 'A',
      date: '2024-01-15',
      remarks: 'Good performance',
      weightage: 20
    },
    { 
      id: 2, 
      studentId: 'S002',
      name: 'Priya Patel', 
      rollNumber: '002',
      class: '10-A', 
      subject: 'Mathematics', 
      assessment: 'Unit Test 1', 
      assessmentType: 'Unit Test',
      marks: 38, 
      totalMarks: 50,
      percentage: 76,
      grade: 'B+',
      date: '2024-01-15',
      remarks: 'Can improve',
      weightage: 20
    },
    { 
      id: 3, 
      studentId: 'S003',
      name: 'Amit Kumar', 
      rollNumber: '003',
      class: '10-A', 
      subject: 'Mathematics', 
      assessment: 'Unit Test 1', 
      assessmentType: 'Unit Test',
      marks: 45, 
      totalMarks: 50,
      percentage: 90,
      grade: 'A+',
      date: '2024-01-15',
      remarks: 'Excellent work',
      weightage: 20
    },
    { 
      id: 4, 
      studentId: 'S001',
      name: 'Rahul Yadav', 
      rollNumber: '001',
      class: '10-A', 
      subject: 'Mathematics', 
      assessment: 'Assignment 1', 
      assessmentType: 'Assignment',
      marks: 18, 
      totalMarks: 20,
      percentage: 90,
      grade: 'A+',
      date: '2024-01-20',
      remarks: 'Creative approach',
      weightage: 10
    }
  ]);

  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'Unit Test',
    totalMarks: 100,
    date: new Date().toISOString().split('T')[0],
    weightage: 20,
    description: ''
  });

  // Load grades data
  useEffect(() => {
    fetchGradesData();
  }, [selectedClass, selectedSubject]);

  const fetchGradesData = async () => {
    setLoading(true);
    try {
      if (E2E) {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/grades?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const data = await res.json();
        if (data?.success) {
          setGradebook(data.data || []);
        }
        setLoading(false);
      } else {
        // Mock fallback
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setLoading(false);
    }
  };

  // Calculate grade from percentage
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  // Handle grade entry
  const handleGradeEntry = (gradeId, field, value) => {
    setGradebook(prev => prev.map(grade => {
      if (grade.id === gradeId) {
        const updatedGrade = { ...grade, [field]: value };
        if (field === 'marks' || field === 'totalMarks') {
          updatedGrade.percentage = Math.round((updatedGrade.marks / updatedGrade.totalMarks) * 100);
          updatedGrade.grade = calculateGrade(updatedGrade.percentage);
        }
        return updatedGrade;
      }
      return grade;
    }));
  };

  // Add new assessment
  const handleAddAssessment = async () => {
    setSaving(true);
    try {
      if (E2E) {
        const token = localStorage.getItem('authToken');
        const studentsPayload = gradebook
          .filter(g => g.class === selectedClass && g.subject === selectedSubject)
          .map(g => ({ studentId: g.studentId, name: g.name, rollNumber: g.rollNumber, class: g.class, subject: g.subject }));

        const res = await fetch(`${API_BASE}/grades/assessment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            name: newAssessment.name,
            type: newAssessment.type,
            totalMarks: newAssessment.totalMarks,
            date: newAssessment.date,
            weightage: newAssessment.weightage,
            students: studentsPayload
          })
        });
        const data = await res.json();
        if (!data?.success) {
          throw new Error(data?.message || 'Failed to save assessment');
        }
        await fetchGradesData();
      } else {
        setTimeout(() => {}, 1000);
      }
      setSaving(false);
      setShowAddModal(false);
      setNewAssessment({
        name: '',
        type: 'Unit Test',
        totalMarks: 100,
        date: new Date().toISOString().split('T')[0],
        weightage: 20,
        description: ''
      });
      alert('Assessment added successfully!');
    } catch (error) {
      console.error('Error adding assessment:', error);
      setSaving(false);
    }
  };

  // Bulk grade entry
  const handleBulkGradeEntry = async (bulkData) => {
    setSaving(true);
    try {
      // API call would go here
      setTimeout(() => {
        setSaving(false);
        setShowBulkGradeModal(false);
        alert('Bulk grades saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving bulk grades:', error);
      setSaving(false);
    }
  };

  const saveGradeRow = async (grade) => {
    if (!E2E) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/grades/${encodeURIComponent(grade.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ marks: grade.marks, totalMarks: grade.totalMarks, remarks: grade.remarks })
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'Failed to update grade');
      setGradebook(prev => prev.map(g => g.id === grade.id ? data.data : g));
    } catch (err) {
      console.error('Error updating grade:', err);
      alert('Failed to save grade');
    }
  };

  // Export grades
  const exportGrades = (format = 'csv') => {
    const data = filteredGrades.map(grade => ({
      'Student Name': grade.name,
      'Roll Number': grade.rollNumber,
      'Class': grade.class,
      'Subject': grade.subject,
      'Assessment': grade.assessment,
      'Marks': grade.marks,
      'Total Marks': grade.totalMarks,
      'Percentage': grade.percentage,
      'Grade': grade.grade,
      'Date': grade.date,
      'Remarks': grade.remarks
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]),
        ...data.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades_${selectedClass}_${selectedSubject}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  // Filter grades
  const filteredGrades = gradebook.filter(grade => {
    const matchesClass = grade.class === selectedClass;
    const matchesSubject = grade.subject === selectedSubject;
    const matchesAssessment = selectedAssessment === 'all' || grade.assessment === selectedAssessment;
    const matchesSearch = grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.rollNumber.includes(searchTerm);
    return matchesClass && matchesSubject && matchesAssessment && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalStudents: new Set(filteredGrades.map(g => g.studentId)).size,
    totalAssessments: new Set(filteredGrades.map(g => g.assessment)).size,
    averageScore: Math.round(filteredGrades.reduce((sum, g) => sum + g.percentage, 0) / filteredGrades.length),
    highestScore: Math.max(...filteredGrades.map(g => g.percentage)),
    lowestScore: Math.min(...filteredGrades.map(g => g.percentage)),
    passRate: Math.round((filteredGrades.filter(g => g.percentage >= 40).length / filteredGrades.length) * 100)
  };

  // Get unique assessments for filter
  const assessments = [...new Set(filteredGrades.map(g => g.assessment))];

  return (
    <div className="faculty-grades">
      <div className="grades-header">
        <div className="header-content">
          <h1>Grade Management</h1>
          <p>Manage grades and assessments for your students</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Assessment
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkGradeModal(true)}
          >
            <FaEdit /> Bulk Grade Entry
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => exportGrades('csv')}
          >
            <FaDownload /> Export Grades
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students">
            <FaGraduationCap />
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon assessments">
            <FaFileExport />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAssessments}</h3>
            <p>Assessments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon average">
            <FaCalculator />
          </div>
          <div className="stat-content">
            <h3>{stats.averageScore}%</h3>
            <p>Class Average</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pass-rate">
            <FaAward />
          </div>
          <div className="stat-content">
            <h3>{stats.passRate}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grades-controls">
        <div className="controls-row">
          <div className="control-group">
            <label>Class:</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Subject:</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Assessment:</label>
            <select 
              value={selectedAssessment} 
              onChange={(e) => setSelectedAssessment(e.target.value)}
            >
              <option value="all">All Assessments</option>
              {assessments.map(assessment => (
                <option key={assessment} value={assessment}>{assessment}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="controls-row">
          <div className="control-group">
            <label>Search:</label>
            <div className="input-with-icon">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="control-group">
            <label>View Mode:</label>
            <div className="view-mode-buttons">
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
              <button 
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
              <button 
                className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
                onClick={() => setViewMode('analytics')}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Display */}
      {loading ? (
        <div className="loading">Loading grades data...</div>
      ) : (
        <>
          {viewMode === 'table' && (
            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Assessment</th>
                    <th>Marks</th>
                    <th>Total</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Date</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map(grade => (
                    <tr key={grade.id} className="grade-row">
                      <td className="roll-number">{grade.rollNumber}</td>
                      <td className="student-name">
                        <div className="name-info">
                          <span className="name">{grade.name}</span>
                          {grade.percentage < 40 && (
                            <FaExclamationTriangle className="warning-icon" title="Below passing grade" />
                          )}
                          {grade.percentage >= 90 && (
                            <FaStar className="star-icon" title="Excellent performance" />
                          )}
                        </div>
                      </td>
                      <td className="assessment">
                        <div className="assessment-info">
                          <span className="assessment-name">{grade.assessment}</span>
                          <span className="assessment-type">{grade.assessmentType}</span>
                        </div>
                      </td>
                      <td className="marks">
                        <input 
                          type="number"
                          value={grade.marks}
                          onChange={(e) => handleGradeEntry(grade.id, 'marks', parseInt(e.target.value) || 0)}
                          className="marks-input"
                          min="0"
                          max={grade.totalMarks}
                        />
                      </td>
                      <td className="total-marks">{grade.totalMarks}</td>
                      <td className="percentage">
                        <div className={`percentage-badge ${grade.percentage >= 90 ? 'excellent' : grade.percentage >= 70 ? 'good' : grade.percentage >= 40 ? 'average' : 'poor'}`}>
                          {grade.percentage}%
                        </div>
                      </td>
                      <td className="grade">
                        <span className={`grade-badge ${grade.grade.toLowerCase().replace('+', '-plus')}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="date">{grade.date}</td>
                      <td className="remarks">
                        <input 
                          type="text"
                          value={grade.remarks}
                          onChange={(e) => handleGradeEntry(grade.id, 'remarks', e.target.value)}
                          className="remarks-input"
                          placeholder="Add remarks..."
                        />
                      </td>
                      <td className="actions">
                        <button 
                          className="action-btn edit"
                          onClick={() => {
                            setEditingGrade(grade);
                            setShowEditModal(true);
                          }}
                          title="Edit Grade"
                        >
                          <FaEdit />
                        </button>
                        {E2E && (localStorage.getItem('userRole') === 'admin') && (
                          <button 
                            className="action-btn save"
                            onClick={() => saveGradeRow(grade)}
                            title="Save Grade"
                          >
                            <FaSave />
                          </button>
                        )}
                        <button 
                          className="action-btn delete"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this grade?')) {
                              setGradebook(prev => prev.filter(g => g.id !== grade.id));
                            }
                          }}
                          title="Delete Grade"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'cards' && (
            <div className="grades-cards">
              {filteredGrades.map(grade => (
                <div key={grade.id} className="grade-card">
                  <div className="card-header">
                    <div className="student-info">
                      <h4>{grade.name}</h4>
                      <span className="roll-number">Roll: {grade.rollNumber}</span>
                    </div>
                    <div className="grade-display">
                      <span className={`grade-badge ${grade.grade.toLowerCase().replace('+', '-plus')}`}>
                        {grade.grade}
                      </span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="assessment-details">
                      <h5>{grade.assessment}</h5>
                      <span className="assessment-type">{grade.assessmentType}</span>
                    </div>
                    <div className="score-details">
                      <div className="score">
                        <span className="marks">{grade.marks}</span>
                        <span className="separator">/</span>
                        <span className="total">{grade.totalMarks}</span>
                      </div>
                      <div className={`percentage ${grade.percentage >= 90 ? 'excellent' : grade.percentage >= 70 ? 'good' : grade.percentage >= 40 ? 'average' : 'poor'}`}>
                        {grade.percentage}%
                      </div>
                    </div>
                    <div className="card-footer">
                      <span className="date">{grade.date}</span>
                      <div className="card-actions">
                        <button className="action-btn edit" onClick={() => {
                          setEditingGrade(grade);
                          setShowEditModal(true);
                        }}>
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="analytics-view">
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Grade Distribution</h3>
                  <div className="grade-distribution">
                    {['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'].map(gradeLevel => {
                      const count = filteredGrades.filter(g => g.grade === gradeLevel).length;
                      const percentage = Math.round((count / filteredGrades.length) * 100) || 0;
                      return (
                        <div key={gradeLevel} className="grade-bar">
                          <span className="grade-label">{gradeLevel}</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="grade-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Performance Insights</h3>
                  <div className="insights">
                    <div className="insight-item">
                      <span className="label">Highest Score:</span>
                      <span className="value">{stats.highestScore}%</span>
                    </div>
                    <div className="insight-item">
                      <span className="label">Lowest Score:</span>
                      <span className="value">{stats.lowestScore}%</span>
                    </div>
                    <div className="insight-item">
                      <span className="label">Students Above 90%:</span>
                      <span className="value">{filteredGrades.filter(g => g.percentage >= 90).length}</span>
                    </div>
                    <div className="insight-item">
                      <span className="label">Students Below 40%:</span>
                      <span className="value">{filteredGrades.filter(g => g.percentage < 40).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Assessment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Assessment</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Assessment Name:</label>
                <input 
                  type="text"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Unit Test 2"
                />
              </div>
              <div className="form-group">
                <label>Assessment Type:</label>
                <select 
                  value={newAssessment.type}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, type: e.target.value }))}
                >
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Marks:</label>
                  <input 
                    type="number"
                    value={newAssessment.totalMarks}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Weightage (%):</label>
                  <input 
                    type="number"
                    value={newAssessment.weightage}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, weightage: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input 
                  type="date"
                  value={newAssessment.date}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea 
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Assessment description..."
                  rows="3"
                />
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
                onClick={handleAddAssessment}
                disabled={saving || !newAssessment.name}
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .faculty-grades {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .grades-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #1a237e;
          font-size: 28px;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          border-left: 4px solid;
        }

        .stat-card:nth-child(1) { border-left-color: #2196f3; }
        .stat-card:nth-child(2) { border-left-color: #4caf50; }
        .stat-card:nth-child(3) { border-left-color: #ff9800; }
        .stat-card:nth-child(4) { border-left-color: #9c27b0; }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .stat-icon.students { background: #2196f3; }
        .stat-icon.assessments { background: #4caf50; }
        .stat-icon.average { background: #ff9800; }
        .stat-icon.pass-rate { background: #9c27b0; }

        .stat-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .stat-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .grades-controls {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .controls-row {
          display: flex;
          gap: 20px;
          align-items: end;
          margin-bottom: 16px;
        }

        .controls-row:last-child {
          margin-bottom: 0;
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

        .view-mode-buttons {
          display: flex;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn {
          padding: 10px 16px;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .view-btn.active {
          background: #1a237e;
          color: white;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #1a237e;
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .grades-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .grades-table {
          width: 100%;
          border-collapse: collapse;
        }

        .grades-table th {
          background: #f8f9fa;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }

        .grades-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: middle;
        }

        .grade-row:hover {
          background: #f8f9fa;
        }

        .roll-number {
          font-weight: 600;
          color: #1a237e;
        }

        .name-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .warning-icon {
          color: #f44336;
          font-size: 14px;
        }

        .star-icon {
          color: #ffc107;
          font-size: 14px;
        }

        .assessment-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .assessment-name {
          font-weight: 500;
        }

        .assessment-type {
          font-size: 12px;
          color: #666;
        }

        .marks-input, .remarks-input {
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          width: 80px;
        }

        .remarks-input {
          width: 120px;
        }

        .percentage-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 12px;
        }

        .percentage-badge.excellent {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .percentage-badge.good {
          background: #e3f2fd;
          color: #1976d2;
        }

        .percentage-badge.average {
          background: #fff3e0;
          color: #f57c00;
        }

        .percentage-badge.poor {
          background: #ffebee;
          color: #c62828;
        }

        .grade-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 12px;
        }

        .grade-badge.a-plus {
          background: #4caf50;
          color: white;
        }

        .grade-badge.a {
          background: #8bc34a;
          color: white;
        }

        .grade-badge.b-plus {
          background: #2196f3;
          color: white;
        }

        .grade-badge.b {
          background: #03a9f4;
          color: white;
        }

        .grade-badge.c-plus {
          background: #ff9800;
          color: white;
        }

        .grade-badge.c {
          background: #ffc107;
          color: #333;
        }

        .grade-badge.f {
          background: #f44336;
          color: white;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          transition: all 0.3s;
        }

        .action-btn.edit {
          background: #2196f3;
          color: white;
        }

        .action-btn.delete {
          background: #f44336;
          color: white;
        }

        .grades-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .grade-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }

        .grade-card:hover {
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .student-info h4 {
          margin: 0 0 4px 0;
          color: #333;
        }

        .analytics-view {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .analytics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .analytics-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .analytics-card h3 {
          margin: 0 0 16px 0;
          color: #1a237e;
        }

        .grade-distribution {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .grade-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .grade-label {
          width: 30px;
          font-weight: 600;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #1a237e;
          transition: width 0.3s;
        }

        .grade-count {
          width: 30px;
          text-align: right;
          font-weight: 600;
        }

        .insights {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insight-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-radius: 8px;
        }

        .insight-item .label {
          font-weight: 500;
          color: #666;
        }

        .insight-item .value {
          font-weight: 700;
          color: #1a237e;
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
          max-width: 500px;
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
          color: #1a237e;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #f5f5f5;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
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
          border-color: #1a237e;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .controls-row {
            flex-direction: column;
            gap: 16px;
          }
          
          .control-group {
            min-width: auto;
            width: 100%;
          }
          
          .grades-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          
          .grades-table-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}