import React, { useState } from 'react';
import { FaVideo, FaCalendarAlt, FaClock, FaUsers, FaPlus, FaEdit, FaTrash, FaPlay, FaStop } from 'react-icons/fa';

export default function OnlineClasses() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classes, setClasses] = useState([
    {
      id: 1,
      title: 'Mathematics - Algebra Basics',
      subject: 'Mathematics',
      class: 'Class 10',
      date: '2024-01-15',
      time: '10:00',
      duration: 60,
      platform: 'zoom',
      meetingLink: 'https://zoom.us/j/123456789',
      status: 'scheduled',
      students: 25,
      description: 'Introduction to algebraic expressions and equations'
    },
    {
      id: 2,
      title: 'Physics - Motion and Force',
      subject: 'Physics',
      class: 'Class 11',
      date: '2024-01-15',
      time: '14:00',
      duration: 45,
      platform: 'meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'live',
      students: 30,
      description: 'Understanding Newton\'s laws of motion'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '',
    date: '',
    time: '',
    duration: 60,
    platform: 'zoom',
    description: '',
    students: []
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies'];
  const classOptions = ['Class NS','Class LKG','Class UKG','Class 1','Class 2','Class 3','Class 4','Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newClass = {
      ...formData,
      id: Date.now(),
      status: 'scheduled',
      // Use explicit students count; avoid demo randomization
      students: Array.isArray(formData.students) ? formData.students.length : 0,
      meetingLink: formData.platform === 'zoom' 
        ? `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
        : `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`
    };
    
    setClasses(prev => [...prev, newClass]);
    setFormData({
      title: '',
      subject: '',
      class: '',
      date: '',
      time: '',
      duration: 60,
      platform: 'zoom',
      description: '',
      students: []
    });
    setActiveTab('dashboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#4caf50';
      case 'scheduled': return '#2196f3';
      case 'completed': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'Live Now';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const startClass = (classId) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId ? { ...cls, status: 'live' } : cls
    ));
  };

  const endClass = (classId) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId ? { ...cls, status: 'completed' } : cls
    ));
  };

  const deleteClass = (classId) => {
    setClasses(prev => prev.filter(cls => cls.id !== classId));
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Online Classes</h1>
          <p>Manage your virtual classroom sessions</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            background: '#1a237e',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}
        >
          <FaPlus /> Create New Class
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #f0f0f0' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
            color: activeTab === 'dashboard' ? '#1a237e' : '#666',
            borderBottom: activeTab === 'dashboard' ? '2px solid #1a237e' : 'none'
          }}
        >
          Class Dashboard
        </button>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'create' ? '600' : '400',
            color: activeTab === 'create' ? '#1a237e' : '#666',
            borderBottom: activeTab === 'create' ? '2px solid #1a237e' : 'none'
          }}
        >
          Create Class
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaVideo style={{ color: '#4caf50', fontSize: '24px' }} />
                <div>
                  <h3 style={{ margin: 0, color: '#4caf50' }}>
                    {classes.filter(c => c.status === 'live').length}
                  </h3>
                  <p style={{ margin: 0, color: '#666' }}>Live Classes</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaCalendarAlt style={{ color: '#2196f3', fontSize: '24px' }} />
                <div>
                  <h3 style={{ margin: 0, color: '#2196f3' }}>
                    {classes.filter(c => c.status === 'scheduled').length}
                  </h3>
                  <p style={{ margin: 0, color: '#666' }}>Scheduled</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUsers style={{ color: '#ff9800', fontSize: '24px' }} />
                <div>
                  <h3 style={{ margin: 0, color: '#ff9800' }}>
                    {classes.reduce((total, c) => total + c.students, 0)}
                  </h3>
                  <p style={{ margin: 0, color: '#666' }}>Total Students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Your Classes</h2>
            {classes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <FaVideo style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                <p>No classes scheduled yet. Create your first online class!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {classes.map(cls => (
                  <div key={cls.id} style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    padding: '20px',
                    borderLeft: `4px solid ${getStatusColor(cls.status)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, color: '#1a237e' }}>{cls.title}</h3>
                          <span style={{ 
                            background: getStatusColor(cls.status), 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {getStatusText(cls.status)}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                            <FaCalendarAlt />
                            <span>{cls.date} at {cls.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                            <FaClock />
                            <span>{cls.duration} minutes</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                            <FaUsers />
                            <span>{cls.students} students</span>
                          </div>
                          <div style={{ color: '#666' }}>
                            <strong>{cls.subject}</strong> - {cls.class}
                          </div>
                        </div>
                        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{cls.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                        {cls.status === 'scheduled' && (
                          <button
                            onClick={() => startClass(cls.id)}
                            style={{
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaPlay /> Start
                          </button>
                        )}
                        {cls.status === 'live' && (
                          <button
                            onClick={() => endClass(cls.id)}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaStop /> End
                          </button>
                        )}
                        <button
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {cls.meetingLink && (
                      <div style={{ marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Meeting Link:</strong> 
                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#1a237e' }}>
                          {cls.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Class Tab */}
      {activeTab === 'create' && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Create New Online Class</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Class Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Mathematics - Algebra Basics"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Class</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (minutes) *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Platform *</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                >
                  <option value="zoom">Zoom</option>
                  <option value="meet">Google Meet</option>
                  <option value="teams">Microsoft Teams</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Brief description of the class content and objectives..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button
                type="submit"
                style={{
                  background: '#1a237e',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Create Class
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                style={{
                  background: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}