import React, { useEffect, useMemo, useState } from 'react';
import { FaBook, FaChalkboardTeacher, FaClock } from 'react-icons/fa';
import { coursesAPI, generalAPI } from '../../services/api.js';
import config from '../../config/config.js';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatSchedule = (schedule) => {
    if (!schedule) return 'To be announced';
    const days = Array.isArray(schedule?.days) ? schedule.days.join(', ') : '';
    const start = schedule?.startTime || '';
    const end = schedule?.endTime || '';
    if (days && start && end) return `${days} - ${start} to ${end}`;
    if (days && start) return `${days} - ${start}`;
    return typeof schedule === 'string' && schedule.length ? schedule : 'To be announced';
  };

  const normalizeCourse = (c) => {
    const enrolledCount = Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : (c.enrolled || 0);
    const capacity = c.maxStudents || c.capacity || 0;
    const progress = capacity > 0 ? Math.min(100, Math.round((enrolledCount / capacity) * 100)) : 0;
    const facultyName = c.faculty ? `${c.faculty.firstName ?? ''} ${c.faculty.lastName ?? ''}`.trim() : (c.instructor || 'TBA');

    return {
      id: c._id || c.id || `${Date.now()}-${Math.random()}`,
      name: c.courseName || c.name || 'Untitled',
      teacher: facultyName || 'TBA',
      schedule: formatSchedule(c.schedule),
      progress,
      description: c.description || 'Course details will be available soon.',
    };
  };

  useEffect(() => {
    let mounted = true;
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await coursesAPI.getCourses({ retry: true });
        const data = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(data) ? data : (Array.isArray(data?.courses) ? data.courses : []);
        const normalized = list.map(normalizeCourse);
        if (mounted) setCourses(normalized);
      } catch (err) {
        // Fallback to public courses when authenticated endpoint fails
        try {
          const pub = await generalAPI.getPublicCourses();
          const pubData = pub.data?.data ?? pub.data ?? [];
          const normalized = (Array.isArray(pubData) ? pubData : []).map((c) => ({
            id: c._id || c.id || `${Date.now()}-${Math.random()}`,
            name: c.name || c.courseName || 'Untitled',
            teacher: c.department ? `${c.department} Department` : 'TBA',
            schedule: c.duration || 'To be announced',
            progress: 0,
            description: c.description || 'Course details will be available soon.',
          }));
          if (mounted) {
            setCourses(normalized);
            setError('');
          }
        } catch (fallbackErr) {
          const msg = err.userMessage || err.message || 'Failed to load courses';
          if (mounted) {
            setError(msg);
            setCourses([]);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCourses();
    return () => { mounted = false; };
  }, []);

  const emptyState = useMemo(() => (
    <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: 0, color: '#666' }}>No courses found.</p>
    </div>
  ), []);

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>My Courses</h1>
      <p>View all your enrolled courses and track your progress.</p>

      {loading && (
        <p style={{ color: '#666' }}>Loading courses...</p>
      )}
      {error && !loading && (
        <p style={{ color: 'red' }}>Error: {error}</p>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '25px',
        margin: '30px 0'
      }}>
        {(courses.length === 0 && !loading) ? emptyState : courses.map(course => (
          <div key={course.id} style={{
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ 
              height: '8px', 
              background: `linear-gradient(to right, #1a237e ${course.progress}%, #e0e0e0 ${course.progress}%)` 
            }}></div>
            <div style={{ padding: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>{course.name}</h2>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>
                {course.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaChalkboardTeacher style={{ color: '#1a237e' }} />
                <span>{course.teacher}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <FaClock style={{ color: '#1a237e' }} />
                <span>{course.schedule}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '500' }}>Progress: </span>
                  <span>{course.progress}%</span>
                </div>
                <button style={{
                  background: '#1a237e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <FaBook /> View Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}