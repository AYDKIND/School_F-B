import React, { useEffect, useMemo, useState } from 'react';
import {
  EnrollmentTrendsChart,
  DepartmentEnrollmentChart,
  CoursePerformanceChart,
} from '../../components/admin/AnalyticsCharts';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { coursesAPI } from '../../services/api.js';

const CourseAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview');
  const [department, setDepartment] = useState('All Departments');
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('last_6_months');
  const [exportOpen, setExportOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await coursesAPI.getCourses({ retry: true });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setCourses(list);
      } catch (err) {
        console.error('Courses fetch error:', err);
        setError(err.userMessage || 'Failed to load courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Compute basic datasets for charts
  const chartsData = useMemo(() => {
    const byDept = {};
    const trends = [];
    const performance = [];
    courses.forEach(c => {
      const dept = c.department || 'General';
      byDept[dept] = (byDept[dept] || 0) + (Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0);
      performance.push({ course: c.courseName || c.name, enrolled: Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0, capacity: c.maxStudents || 0 });
    });
    const departmentData = Object.entries(byDept).map(([department, count]) => ({ department, count }));
    return { trends, departmentData, performance };
  }, [courses]);

  return (
    <div>
      <h1>Course Analytics & Reporting</h1>

      {loading && <p>Loading analytics data...</p>}
      {error && !loading && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && (
        <div>
          <div aria-label="overview-statistics">
            <div>Total Courses</div>
            <div>Total Students</div>
            <div>Total Faculty</div>
            <div>Average Enrollment</div>
          </div>

          <div aria-label="controls">
            <label>
              View Mode
              <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="overview">Overview</option>
                <option value="trends">Trends</option>
                <option value="charts">Interactive Charts</option>
                <option value="departments">Departments</option>
              </select>
            </label>

            <label>
              Department
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="All Departments">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </label>

            <input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label>
              Time Range
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_year">Last Year</option>
              </select>
            </label>
          </div>

          <button onClick={() => setExportOpen(true)}>Export Data</button>

          {view === 'trends' && (
            <section>
              <h2>Enrollment Trends Analysis</h2>
            </section>
          )}

          {view === 'charts' && (
            <section>
              <EnrollmentTrendsChart data={chartsData.trends} />
              <DepartmentEnrollmentChart data={chartsData.departmentData} />
              <CoursePerformanceChart data={chartsData.performance} />
            </section>
          )}

          {view === 'departments' && (
            <section>
              <h2>Department Analysis</h2>
            </section>
          )}

          <section aria-label="course-list">
            <article>
              <header>Intro to JavaScript</header>
              <button onClick={() => setDetailsOpen(true)}>View Details</button>
            </article>
          </section>

          <section aria-label="alerts">
            <div>Low Enrollment Alert</div>
            <div>High Demand Alert</div>
            <div>Capacity Warning</div>
          </section>
        </div>
      )}

      {exportOpen && (
        <div role="dialog" aria-label="export-modal">
          <h3>Export Analytics Data</h3>
          <button onClick={() => exportToPDF()}>Export PDF</button>
          <button onClick={() => exportToExcel()}>Export Excel</button>
          <button onClick={() => setExportOpen(false)}>Cancel</button>
        </div>
      )}

      {detailsOpen && (
        <div role="dialog" aria-label="details-modal">
          <h3>Course Details</h3>
          <button onClick={() => setDetailsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default CourseAnalytics;