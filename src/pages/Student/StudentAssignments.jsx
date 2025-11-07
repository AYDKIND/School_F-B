import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

export default function StudentAssignments() {
  const assignments = [
    { id: 1, title: 'Maths Assignment - Algebra', dueDate: '2024-10-28', subject: 'Mathematics', status: 'Pending' },
    { id: 2, title: 'Physics Lab Report - Motion', dueDate: '2024-10-26', subject: 'Physics', status: 'Submitted' },
    { id: 3, title: 'English Essay - My Hero', dueDate: '2024-10-30', subject: 'English', status: 'Pending' },
  ];

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Assignments</h1>
      <p>View upcoming and submitted assignments.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {assignments.map(a => (
          <div key={a.id} style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaFileAlt style={{ color: '#1a237e' }} />
              <h3 style={{ margin: 0 }}>{a.title}</h3>
            </div>
            <p style={{ margin: '6px 0', color: '#555' }}><strong>Subject:</strong> {a.subject}</p>
            <p style={{ margin: '6px 0', color: '#555' }}><strong>Due Date:</strong> {a.dueDate}</p>
            <p style={{ margin: '6px 0', color: a.status === 'Submitted' ? '#2e7d32' : '#c62828' }}><strong>Status:</strong> {a.status}</p>
            <button style={{ marginTop: '10px', background: '#1a237e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}