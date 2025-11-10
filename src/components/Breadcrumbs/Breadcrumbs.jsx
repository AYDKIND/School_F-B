import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const routeLabels = {
  '': 'Home',
  home: 'Home',
  about: 'About Us',
  academic: 'Academic',
  updates: 'Academy Updates',
  admissions: 'Admissions',
  gallery: 'Gallery',
  'fee-payment': 'Fee Payment',
  contact: 'Contact',
  admin: 'Admin',
  dashboard: 'Dashboard',
  'manage-students': 'Manage Students',
  'manage-faculty': 'Manage Faculty',
  'schedule-manager': 'Schedule Manager',
  'faculty-assignment': 'Faculty Assignment',
  'student-enrollment': 'Student Enrollment',
  settings: 'Settings',
  'admissions-management': 'Admissions Management',
  'fee-management': 'Fee Management',
  reports: 'Reports',
  'academic-calendar': 'Academic Calendar',
  'transport-management': 'Transport Management',
  grades: 'Grades',
  faculty: 'Faculty',
  attendance: 'Attendance',
  courses: 'Courses',
  subjects: 'Subjects',
  'online-classes': 'Online Classes',
  profile: 'Profile',
  student: 'Student',
  assignments: 'Assignments',
};

function buildCrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [];
  let accumulated = '';
  parts.forEach((part) => {
    accumulated += `/${part}`;
    const label = routeLabels[part] || part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ path: accumulated, label });
  });
  return crumbs;
}

const Breadcrumbs = memo(() => {
  const location = useLocation();
  if (location.pathname === '/' ) return null;

  const crumbs = buildCrumbs(location.pathname);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumbs-item">
          <Link to="/">Home</Link>
        </li>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.path} className="breadcrumbs-item" aria-current={isLast ? 'page' : undefined}>
              {isLast ? (
                <span className="breadcrumbs-current">{crumb.label}</span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export default Breadcrumbs;