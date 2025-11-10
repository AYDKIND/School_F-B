import React, { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './ContextNav.css';

const linkSets = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/manage-students', label: 'Students' },
    { to: '/admin/manage-faculty', label: 'Faculty' },
    { to: '/admin/grades', label: 'Grades' },
    { to: '/admin/reports', label: 'Reports' },
  ],
  faculty: [
    { to: '/faculty/dashboard', label: 'Dashboard' },
    { to: '/faculty/attendance', label: 'Attendance' },
    { to: '/faculty/courses', label: 'Courses' },
    { to: '/faculty/online-classes', label: 'Online Classes' },
    { to: '/faculty/profile', label: 'Profile' },
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/courses', label: 'Courses' },
    { to: '/student/grades', label: 'Grades' },
    { to: '/student/assignments', label: 'Assignments' },
    { to: '/student/attendance', label: 'Attendance' },
    { to: '/student/fee-payment', label: 'Fee Payment' },
    { to: '/student/profile', label: 'Profile' },
  ],
};

const ContextNav = memo(() => {
  const { pathname } = useLocation();
  const section = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/faculty')
    ? 'faculty'
    : pathname.startsWith('/student')
    ? 'student'
    : null;

  if (!section) return null;

  const links = linkSets[section];

  return (
    <nav className="context-nav" aria-label="Section navigation">
      <div className="context-nav-inner">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `context-link${isActive ? ' active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
});

export default ContextNav;