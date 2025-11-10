import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminGrades() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    email: '',
    courseCode: '',         // changed: use courseCode
    employeeId: '',         // changed: use employeeId
    assessmentType: 'Quiz',
    assessmentName: '',
    maxMarks: 100,
    obtainedMarks: 0,
    assessmentDate: new Date().toISOString().slice(0, 10),
    academicYear: '',
    session: '1',
    remarks: '',
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchGrades = async () => {
    try {
      setLoadingGrades(true);
      const params = {};
      if (form.email) params.email = form.email;
      params.limit = 10;
      const res = await adminAPI.getGrades(params);
      setGrades(res.data?.data || []);
    } catch (err) {
      console.error('Fetch grades error:', err);
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        email: form.email?.trim(),
        // send codes; backend resolves to ObjectIds
        courseCode: form.courseCode?.trim().toUpperCase(),
        employeeId: form.employeeId?.trim().toUpperCase(),
        assessmentType: form.assessmentType,
        assessmentName: form.assessmentName,
        maxMarks: Number(form.maxMarks),
        obtainedMarks: Number(form.obtainedMarks),
        assessmentDate: form.assessmentDate,
        academicYear: form.academicYear || undefined,
        session: form.session,
        remarks: form.remarks,
        isPublished: !!form.isPublished,
      };
      const res = await adminAPI.createGrade(payload);
      if (res.data?.success) {
        await fetchGrades();
        setForm(prev => ({ ...prev, obtainedMarks: 0, assessmentName: '', remarks: '' }));
      }
    } catch (err) {
      console.error('Create grade error:', err);
      setError(err.userMessage || 'Failed to create grade.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-grades-page" style={{ padding: '24px' }}>
      <h2>Admin: Create Grade</h2>
      <p style={{ marginTop: '-4px', color: '#666' }}>Logged in as {user?.email}</p>

      <form onSubmit={onSubmit} className="grade-form" style={{ display: 'grid', gap: '12px', marginTop: '16px', maxWidth: '800px' }}>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <span>Email (student)</span>
            <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="student@example.com" />
          </label>
          <label>
            <span>Course Code</span>
            <input type="text" name="courseCode" value={form.courseCode} onChange={onChange} required placeholder="e.g. MATH101" />
          </label>
          <label>
            <span>Faculty Employee ID</span>
            <input type="text" name="employeeId" value={form.employeeId} onChange={onChange} required placeholder="e.g. FAC003" />
          </label>
          <label>
            <span>Course ID</span>
            <input type="text" name="course" value={form.course} onChange={onChange} required placeholder="Course ObjectId" />
          </label>
          <label>
            <span>Faculty ID</span>
            <input type="text" name="faculty" value={form.faculty} onChange={onChange} required placeholder="Faculty ObjectId" />
          </label>
          <label>
            <span>Assessment Type</span>
            <select name="assessmentType" value={form.assessmentType} onChange={onChange} required>
              <option value="">Select type</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Project">Project</option>
              <option value="Presentation">Presentation</option>
              <option value="Lab">Lab</option>
              <option value="Homework">Homework</option>
            </select>
          </label>
          <label>
            <span>Assessment Name</span>
            <input type="text" name="assessmentName" value={form.assessmentName} onChange={onChange} required placeholder="Mid-term, Unit Test 1" />
          </label>
          <label>
            <span>Session</span>
            <select name="session" value={form.session} onChange={onChange} required>
              <option value="">Select session</option>
              <option value="1">Session 1</option>
              <option value="2">Session 2</option>
            </select>
          </label>
          <label>
            <span>Academic Year</span>
            <input type="text" name="academicYear" value={form.academicYear} onChange={onChange} placeholder="2024-25" />
          </label>
          <label>
            <span>Assessment Date</span>
            <input type="date" name="assessmentDate" value={form.assessmentDate} onChange={onChange} required />
          </label>
          <label>
            <span>Max Marks</span>
            <input type="number" name="maxMarks" value={form.maxMarks} onChange={onChange} min="1" required />
          </label>
          <label>
            <span>Obtained Marks</span>
            <input type="number" name="obtainedMarks" value={form.obtainedMarks} onChange={onChange} min="0" required />
          </label>
          <label style={{ gridColumn: '1 / span 2' }}>
            <span>Remarks</span>
            <input type="text" name="remarks" value={form.remarks} onChange={onChange} placeholder="Optional remarks" />
          </label>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={onChange} />
          <span>Publish grade (visible to student)</span>
        </label>
        <button type="submit" disabled={submitting} style={{ padding: '10px 16px' }}>
          {submitting ? 'Submitting...' : 'Create Grade'}
        </button>
      </form>

      <div className="recent-grades" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Recent Grades {form.email ? `for ${form.email}` : ''}</h3>
          <button onClick={fetchGrades} disabled={loadingGrades} style={{ padding: '8px 12px' }}>
            {loadingGrades ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Assessment</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Marks</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Published</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '12px', color: '#666' }}>No grades found.</td>
                </tr>
              )}
              {grades.map(g => (
                <tr key={g._id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.course?.courseName || '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.assessmentName}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.obtainedMarks}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.maxMarks}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.letterGrade || '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.assessmentDate ? new Date(g.assessmentDate).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{g.isPublished ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}