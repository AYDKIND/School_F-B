import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCalendarAlt, FaBook, FaChalkboardTeacher, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { generalAPI } from '../../services/api.js';
import { useNotification } from '../../components/Notification';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './AcademyUpdate.css';

const AcademyUpdate = () => {
  const { showSuccess, showError } = useNotification();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    effectiveDate: '',
    priority: 'normal'
  });

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generalAPI.getNotices();
      setUpdates(Array.isArray(res.data) ? res.data : (res.data?.notices || []));
    } catch (err) {
      setError(err.userMessage || 'Failed to load academy updates');
      showError(err.userMessage || 'Failed to load academy updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        effectiveDate: form.effectiveDate || new Date().toISOString(),
        priority: form.priority,
      };

      if (!payload.title || !payload.description) {
        showError('Title and description are required');
        setSubmitting(false);
        return;
      }

      if (editId) {
        await generalAPI.updateNotice(editId, payload);
        showSuccess('Update edited successfully');
      } else {
        await generalAPI.createNotice(payload);
        showSuccess('Update posted successfully');
      }
      setFormOpen(false);
      setEditId(null);
      setForm({ title: '', description: '', category: 'General', effectiveDate: '', priority: 'normal' });
      await fetchUpdates();
    } catch (err) {
      showError(err.userMessage || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    try {
      await generalAPI.deleteNotice(id);
      showSuccess('Update deleted');
      await fetchUpdates();
    } catch (err) {
      showError(err.userMessage || 'Failed to delete update');
    }
  };

  const startEdit = (item) => {
    setEditId(item._id || item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'General',
      effectiveDate: (item.effectiveDate || '').substring(0, 10),
      priority: item.priority || 'normal'
    });
    setFormOpen(true);
  };

  return (
    <main className="academic-page">
      <section className="academic-hero">
        <div className="container">
          <h1>Academy Updates</h1>
          <p>Latest notices and updates relevant to academic activities</p>
        </div>
      </section>

      <section className="academic-content section">
        <div className="container">
          {/* Academic Navigation Tabs */}
          <div className="academic-tabs">
            <Link to="/academic" className="tab-link">
              <FaCalendarAlt /> Academic Sessions
            </Link>
            <Link to="/academic" className="tab-link">
              <FaChalkboardTeacher /> Departments
            </Link>
            <Link to="/academic" className="tab-link">
              <FaBook /> Academic Documents
            </Link>
            <span className="tab-link active">
              <FaClipboardList /> Academy Updates
            </span>
          </div>

          <div className="academic-tab-content">
            {loading && <p>Loading updates...</p>}
            {error && !loading && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <>
                {isAdmin && (
                  <div className="updates-actions">
                    <button className="primary-btn" onClick={() => { setFormOpen(true); setEditId(null); }}>
                      <FaPlus /> New Update
                    </button>
                  </div>
                )}

                <div className="updates-list">
                  {updates.length === 0 ? (
                    <p>No updates available.</p>
                  ) : (
                    updates.map((item) => (
                      <div key={item._id || item.id} className="update-card">
                        <div className="update-header">
                          <h3>{item.title}</h3>
                          <div className="update-meta">
                            <span className="category">{item.category || 'General'}</span>
                            <span className="date">{(item.effectiveDate || item.createdAt || '').substring(0, 10)}</span>
                          </div>
                        </div>
                        <p className="update-description">{item.description}</p>

                        {isAdmin && (
                          <div className="update-actions">
                            <button className="edit-btn" onClick={() => startEdit(item)} title="Edit">
                              <FaEdit />
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(item._id || item.id)} title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {isAdmin && formOpen && (
              <div className="update-form-modal">
                <div className="update-form">
                  <h2>{editId ? 'Edit Update' : 'Post New Update'}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                        rows={4}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          <option>General</option>
                          <option>Schedule</option>
                          <option>Exams</option>
                          <option>Fees</option>
                          <option>Events</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Effective Date</label>
                        <input
                          type="date"
                          value={form.effectiveDate}
                          onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="secondary-btn" onClick={() => { setFormOpen(false); setEditId(null); }}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Submitting...' : (editId ? 'Save Changes' : 'Post Update')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AcademyUpdate;