import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useLoading } from '../../hooks/useLoading';
import { useNotification } from '../../hooks/useNotification';
import { FaSearch, FaUnlock, FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './UserManagement.css'; // We'll create a basic CSS file or reuse styles

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { setLoading } = useLoading();
  const { showSuccess, showError } = useNotification();

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({
        page,
        limit: 10,
        search: searchTerm,
        role: roleFilter
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination({
          page: res.data.data.pagination.page,
          totalPages: res.data.data.pagination.pages,
          total: res.data.data.pagination.total
        });
      }
    } catch (error) {
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm, roleFilter]);

  const handleUnlock = async (userId) => {
    try {
      setLoading(true);
      const res = await adminAPI.unlockUser(userId);
      if (res.data.success) {
        showSuccess('User unlocked successfully');
        fetchUsers(pagination.page);
      }
    } catch (error) {
      showError('Failed to unlock user');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.isLocked) return <span className="status-badge locked"><FaLock /> Locked</span>;
    if (user.status === 'active') return <span className="status-badge active"><FaCheckCircle /> Active</span>;
    return <span className="status-badge inactive"><FaTimesCircle /> {user.status}</span>;
  };

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Login Attempts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" className="no-data">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>{user.loginAttempts}</td>
                  <td>
                    {user.isLocked && (
                      <button
                        className="action-btn unlock-btn"
                        onClick={() => handleUnlock(user._id)}
                        title="Unlock Account"
                      >
                        <FaUnlock /> Unlock
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchUsers(pagination.page - 1)}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchUsers(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
