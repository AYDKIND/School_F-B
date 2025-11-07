import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBook, FaUserGraduate, FaChalkboardTeacher, FaDownload } from 'react-icons/fa';
import { generalAPI, coursesAPI } from '../../services/api.js';
import { useNotification } from '../../hooks/useNotification.js';
import './Academic.css';

const Academic = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicSessions, setAcademicSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load events as academic sessions (fallback-friendly mapping)
        const eventsRes = await generalAPI.getEvents();
        const events = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.events || []);
        const mappedSessions = (events || []).map((evt, idx) => {
          const start = evt.startDate || evt.date || evt.start || evt.createdAt;
          const end = evt.endDate || evt.end || evt.updatedAt;
          const startStr = start ? new Date(start).toLocaleDateString() : 'TBD';
          const endStr = end ? new Date(end).toLocaleDateString() : 'TBD';
          const year = start ? `${new Date(start).getFullYear()}` : (evt.year || 'Upcoming');
          const highlights = [
            evt.title || evt.name || 'Academic event',
            evt.description || evt.details || ''
          ].filter(Boolean);
          return {
            id: evt._id || evt.id || idx + 1,
            year,
            startDate: startStr,
            endDate: endStr,
            highlights,
          };
        });
        setAcademicSessions(mappedSessions.length ? mappedSessions : []);

        // Build departments from courses API by grouping by course.department
        const coursesRes = await coursesAPI.getCourses();
        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.courses || []);
        const deptMap = new Map();
        (courses || []).forEach((c) => {
          const deptName = c.department || c.dept || 'General';
          const subjectName = c.name || c.title || c.code || 'Course';
          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, { id: deptMap.size + 1, name: deptName, head: '', subjects: [] });
          }
          const entry = deptMap.get(deptName);
          if (!entry.subjects.includes(subjectName)) {
            entry.subjects.push(subjectName);
          }
        });
        setDepartments(Array.from(deptMap.values()));

        // Load academic documents via notices as downloadable references
        const noticesRes = await generalAPI.getNotices();
        const notices = Array.isArray(noticesRes.data) ? noticesRes.data : (noticesRes.data?.notices || []);
        const mappedDocs = (notices || []).map((n, idx) => ({
          id: n._id || n.id || idx + 1,
          name: n.title || 'Notice',
          type: 'Notice',
          size: n.size || '-',
          url: n.link || n.url || '#',
        }));
        setDocuments(mappedDocs);
      } catch (err) {
        setError(err.userMessage || 'Failed to load academic data');
        showNotification(err.userMessage || 'Failed to load academic data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showNotification]);

  return (
    <main className="academic-page">
      {/* Hero Section */}
      <section className="academic-hero">
        <div className="container">
          <h1>Academic</h1>
          <p>Excellence in education through innovative teaching and comprehensive learning</p>
        </div>
      </section>

      {/* Academic Content */}
      <section className="academic-content section">
        <div className="container">
          <div className="academic-tabs">
            <button 
              className={activeTab === 'sessions' ? 'active' : ''} 
              onClick={() => setActiveTab('sessions')}
            >
              <FaCalendarAlt /> Academic Sessions
            </button>
            <button 
              className={activeTab === 'departments' ? 'active' : ''} 
              onClick={() => setActiveTab('departments')}
            >
              <FaChalkboardTeacher /> Departments
            </button>
            <button 
              className={activeTab === 'documents' ? 'active' : ''} 
              onClick={() => setActiveTab('documents')}
            >
              <FaBook /> Academic Documents
            </button>
            <Link to="/academic/updates" className="tab-link">
              <FaUserGraduate /> Academy Updates
            </Link>
          </div>

          <div className="academic-tab-content">
            {loading && <p>Loading academic information...</p>}
            {error && !loading && <p className="error-text">{error}</p>}
            {activeTab === 'sessions' && (
              <div className="sessions-content">
                <h2>Academic Sessions</h2>
                <p>BBD Academy follows an annual academic calendar. Here are the details of our current and previous academic sessions:</p>
                
                <div className="sessions-list">
                  {academicSessions.length === 0 && !loading && !error && (
                    <p>No sessions available.</p>
                  )}
                  {academicSessions.map(session => (
                    <div className="session-card" key={session.id}>
                      <div className="session-header">
                        <h3>{session.year}</h3>
                        <span className="session-dates">
                          <FaCalendarAlt /> {session.startDate} to {session.endDate}
                        </span>
                      </div>
                      <div className="session-highlights">
                        <h4>Session Highlights:</h4>
                        <ul>
                          {session.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="departments-content">
                <h2>Academic Departments</h2>
                <p>Our school has specialized departments with experienced faculty members dedicated to providing quality education:</p>
                
                <div className="departments-grid">
                  {departments.length === 0 && !loading && !error && (
                    <p>No departments available.</p>
                  )}
                  {departments.map(dept => (
                    <div className="department-card" key={dept.id}>
                      <h3>{dept.name}</h3>
                      {dept.head && (
                        <p className="department-head"><strong>Head:</strong> {dept.head}</p>
                      )}
                      <div className="department-subjects">
                        <h4>Subjects:</h4>
                        <ul>
                          {dept.subjects.map((subject, index) => (
                            <li key={index}>{subject}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="documents-content">
                <h2>Academic Documents</h2>
                <p>Download important academic documents and resources:</p>
                
                <div className="documents-list">
                  {documents.length === 0 && !loading && !error && (
                    <p>No documents available.</p>
                  )}
                  {documents.map(doc => (
                    <div className="document-item" key={doc.id}>
                      <div className="document-info">
                        <h3>{doc.name}</h3>
                        <p>{doc.type} • {doc.size}</p>
                      </div>
                      <a className="download-btn" href={doc.url || '#'} target="_blank" rel="noreferrer">
                        <FaDownload /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};


export default Academic;