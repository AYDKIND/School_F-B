import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../../services/api.js';
import { FaClipboardList, FaUsers, FaChalkboardTeacher, FaVideo, FaTasks } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './FacultyDashboard.css';

export default function FacultyDashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await facultyAPI.getDashboard();
      const data = response.data;
      if (data?.success) {
        setDashboardData(data.data);
        setError(null);
      } else {
        setError(data?.message || 'Failed to fetch dashboard data');
        setDashboardData(null);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const msg = err.userMessage || err.message || 'Failed to connect to server';
      setError(msg);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h1>Faculty Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h1>Faculty Dashboard</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchDashboardData} style={{ padding: '10px 20px', background: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { title: 'Classes Today', value: dashboardData?.stats?.classesToday || 0, icon: <FaChalkboardTeacher />, color: '#1a237e' },
    { title: 'Active Courses', value: dashboardData?.stats?.activeCourses || 0, icon: <FaClipboardList />, color: '#0d1757' },
    { title: 'Total Students', value: dashboardData?.stats?.totalStudents || 0, icon: <FaUsers />, color: '#3f51b5' },
    { title: 'Assignments', value: dashboardData?.stats?.totalAssignments || 0, icon: <FaTasks />, color: '#2e7d32' },
  ];

  const upcoming = dashboardData?.upcomingClasses || [];

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Faculty Dashboard</h1>
      <p>Overview of your teaching schedule and activity.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              {s.icon}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{s.value}</h3>
              <p style={{ margin: 0, color: '#666' }}>{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Upcoming Classes</h2>
          <div>
            {upcoming.length > 0 ? upcoming.map(item => (
              <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a237e', fontWeight: 600 }}>{item.time}</span>
                <span>{item.course}</span>
                <span style={{ color: '#888' }}>{item.room}</span>
              </div>
            )) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No upcoming classes today</p>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Recent Activities</h2>
          <div>
            {dashboardData?.recentActivities?.length > 0 ? dashboardData.recentActivities.map(activity => (
              <div key={activity.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>{activity.message}</p>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{activity.class} • {activity.time}</span>
                  </div>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '12px', 
                    fontSize: '0.7rem', 
                    background: activity.type === 'assignment' ? '#e3f2fd' : activity.type === 'attendance' ? '#f3e5f5' : '#e8f5e9',
                    color: activity.type === 'assignment' ? '#1976d2' : activity.type === 'attendance' ? '#7b1fa2' : '#388e3c'
                  }}>
                    {activity.type}
                  </span>
                </div>
              </div>
            )) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Link to="/faculty/online-classes" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.borderColor = '#1a237e';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.borderColor = 'transparent';
            }}>
              <div style={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                background: '#4caf50', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.3rem' 
              }}>
                <FaVideo />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#1a237e' }}>Online Classes</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Create & manage virtual classes</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}