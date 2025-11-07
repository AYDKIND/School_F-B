import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification.js';
import { facultyAPI } from '../../services/api.js';
import config from '../../config/config.js';
import './FacultyAttendance.css';
import jsPDF from 'jspdf';

export default function FacultyAttendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();
  const [date, setDate] = useState(today);
  const [filter, setFilter] = useState('all');
  const [courseId, setCourseId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Initialize from URL params
    const urlDate = searchParams.get('date');
    const urlCourse = searchParams.get('course');
    if (urlDate) setDate(urlDate);
    if (urlCourse) setCourseId(urlCourse);
    const fetchStudents = async () => {
      try {
        setLoadError(null);
        const res = await facultyAPI.getStudents();
        const data = res.data?.data;
        // Expect backend to return an array in future; currently may be placeholder
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map(s => ({
          _id: s._id || s.id || s.studentId || String(Math.random()),
          name: s.name || (s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : 'Student'),
          class: s.class || s.className || '-',
          status: 'Present'
        }));
        setStudents(mapped);
      } catch (err) {
        console.error('Failed to load students:', err);
        setLoadError(err.userMessage || 'Failed to load students');
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Persist date and course in URL params for shareable views
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (date) next.set('date', date); else next.delete('date');
    if (courseId) next.set('course', courseId); else next.delete('course');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, courseId]);

  // Keep selected index within bounds when filtered list changes
  useEffect(() => {
    setSelectedIndex((i) => {
      if (filtered.length === 0) return 0;
      return Math.min(i, filtered.length - 1);
    });
  }, [filtered.length]);

  const filtered = useMemo(() => {
    const byFilter = students.filter(s =>
      filter === 'all' ? true : (filter === 'present' ? s.status === 'Present' : s.status === 'Absent')
    );
    const q = search.trim().toLowerCase();
    return q ? byFilter.filter(s => s.name.toLowerCase().includes(q)) : byFilter;
  }, [students, filter, search]);

  const presentCount = useMemo(() => students.filter(s => s.status === 'Present').length, [students]);
  const absentCount = useMemo(() => students.filter(s => s.status === 'Absent').length, [students]);

  // Keyboard navigation: Up/Down to move selection, Space to toggle
  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement;
      const tag = active?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || active?.isContentEditable) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === ' ') {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item) toggleStatus(item._id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtered, selectedIndex]);

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s));
  };

  const onSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      setSubmitMessage(null);
      setLoadError(null);

      if (!courseId) {
        setSubmitMessage('Please enter a Course ID.');
        showError('Please enter a Course ID');
        return;
      }

      const payload = {
        course: courseId,
        date,
        remarks,
        records: students.map(s => ({
          student: s._id,
          course: courseId,
          date,
          status: s.status === 'Present' ? 'present' : 'absent',
          remarks,
        }))
      };

      const res = await facultyAPI.markAttendance(payload);
      const data = res.data;
      if (data?.success) {
        setSubmitMessage(`Attendance saved. Created: ${data.data?.created ?? 0}, Duplicates: ${data.data?.duplicates ?? 0}`);
        showSuccess('Attendance submitted successfully');
      } else {
        const msg = data?.message || 'Failed to save attendance';
        setSubmitMessage(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = err.userMessage || err.message || 'Failed to connect to server';
      setSubmitMessage(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoadingRecords(true);
      setRecords([]);
      setLoadError(null);
      const params = { course: courseId };
      if (date) {
        params.date_from = date;
        params.date_to = date;
      }
      const res = await facultyAPI.getAttendance(params);
      const data = res.data;
      if (data?.success) {
        setRecords(data.data || []);
        showSuccess(`Loaded ${data.data?.length ?? 0} record(s)`);
      } else {
        const msg = data?.message || 'Failed to fetch attendance records';
        setLoadError(msg);
        showError(msg);
      }
    } catch (err) {
      const msg = err.userMessage || err.message || 'Failed to connect to server';
      setLoadError(msg);
      showError(msg);
    } finally {
      setLoadingRecords(false);
    }
  };

  const exportRecordsToCSV = () => {
    try {
      if (!records || records.length === 0) {
        showError('No records to export');
        return;
      }
      const headers = ['Date', 'Student', 'Course', 'Status', 'Remarks'];
      const rows = records.map(r => [
        new Date(r.date).toLocaleDateString(),
        (r.student?.name || r.student?.studentId || r.student || '').toString().replace(/\n/g, ' '),
        (r.course?.courseCode || r.course || '').toString().replace(/\n/g, ' '),
        (r.status || '').toString(),
        (r.remarks || '-').toString().replace(/\n/g, ' '),
      ]);
      const escape = (val) => {
        const s = String(val ?? '');
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const csv = [headers.join(','), ...rows.map(row => row.map(escape).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const courseSlug = (courseId || 'course').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `attendance_${courseSlug}_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Exported records to CSV');
    } catch (err) {
      console.error('CSV export error', err);
      showError('Failed to export CSV');
    }
  };

  const exportRecordsToPDF = () => {
    try {
      if (!records || records.length === 0) {
        showError('No records to export');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = margin;

      doc.setFontSize(16);
      doc.text('Attendance Records', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(11);
      doc.text(`Course: ${courseId || '-'}`, margin, y);
      doc.text(`Date: ${date || '-'}`, pageWidth - margin, y, { align: 'right' });
      y += 8;

      doc.setFontSize(12);
      doc.text('Date', margin, y);
      doc.text('Student', margin + 40, y);
      doc.text('Course', margin + 110, y);
      doc.text('Status', pageWidth - 50, y);
      y += 6;
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      doc.setFontSize(10);
      records.forEach((r) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        const dateStr = new Date(r.date).toLocaleDateString();
        const studentStr = String(r.student?.name || r.student?.studentId || r.student || '');
        const courseStr = String(r.course?.courseCode || r.course || '');
        const statusStr = String(r.status || '');

        doc.text(dateStr, margin, y);
        doc.text(doc.splitTextToSize(studentStr, 65), margin + 40, y);
        doc.text(doc.splitTextToSize(courseStr, 45), margin + 110, y);
        doc.text(statusStr, pageWidth - 50, y);
        y += 6;
      });

      const courseSlug = (courseId || 'course').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`attendance_${courseSlug}_${date}.pdf`);
      showSuccess('Exported records to PDF');
    } catch (err) {
      console.error('PDF export error', err);
      showError('Failed to export PDF');
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>Faculty Attendance</h1>
          <p>Mark and review attendance for your classes.</p>
        </div>
        <div className="summary">
          <span className="summary-chip present">Present: {presentCount}</span>
          <span className="summary-chip absent">Absent: {absentCount}</span>
          <span className="summary-chip total">Total: {students.length}</span>
        </div>
      </div>

      <div className="attendance-toolbar">
        <div className="field">
          <label>Course ID</label>
          <input type="text" placeholder="e.g. COURSE123" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        </div>
        <div className="field">
          <label>Date</label>
          <div className="date-input">
            <FaCalendarAlt />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <div className="field grow">
          <label>Search</label>
          <input type="text" placeholder="Search student name" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Remarks</label>
          <input type="text" placeholder="Optional remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setStudents(prev => prev.map(s => ({ ...s, status: 'Present' })))}>Mark all present</button>
          <button className="btn" onClick={() => setStudents(prev => prev.map(s => ({ ...s, status: 'Absent' })))}>Mark all absent</button>
          <button className="btn" onClick={() => { setStudents(prev => prev.map(s => ({ ...s, status: 'Present' }))); setFilter('all'); }}>Reset</button>
          <button className="btn primary" onClick={onSubmitAttendance} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {submitMessage && (
        <div className={`inline-message ${submitMessage.includes('Failed') ? 'error' : 'info'}`}>{submitMessage}</div>
      )}

      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Toggle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s._id} className={i === selectedIndex ? 'selected' : ''} onClick={() => setSelectedIndex(i)}>
                <td>{s.name}</td>
                <td>{s.class}</td>
                <td className={s.status === 'Present' ? 'status-present' : 'status-absent'}>{s.status}</td>
                <td>
                  <button className={`toggle-btn ${s.status === 'Present' ? 'present' : 'absent'}`} onClick={() => toggleStatus(s._id)}>
                    {s.status === 'Present' ? <FaTimesCircle /> : <FaCheckCircle />} {s.status === 'Present' ? 'Mark Absent' : 'Mark Present'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="secondary-actions">
        <button className="btn" onClick={loadAttendanceRecords}>Load Records</button>
        <button className="btn" onClick={exportRecordsToCSV}>Export CSV</button>
        <button className="btn" onClick={exportRecordsToPDF}>Export PDF</button>
        <span className="kbd-tip">Tip: ↑/↓ to move, Space to toggle</span>
      </div>

      <div className="records">
        <h2>Recent Attendance Records</h2>
        {loadingRecords && <p className="muted">Loading records…</p>}
        {loadError && !loadingRecords && <p className="error">Error: {loadError}</p>}
        {!loadingRecords && records.length === 0 && <p className="muted">No records to display.</p>}
        {records.length > 0 && (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.student?.name || r.student?.studentId || r.student}</td>
                    <td>{r.course?.courseCode || r.course}</td>
                    <td className={r.status === 'present' ? 'status-present' : 'status-absent'}>{r.status}</td>
                    <td>{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}