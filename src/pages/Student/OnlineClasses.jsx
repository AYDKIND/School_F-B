import React from 'react';

const upcomingClasses = [
  { date: '2025-10-06', time: '10:00 AM', subject: 'Mathematics', platform: 'Google Meet', link: '#' },
  { date: '2025-10-06', time: '12:00 PM', subject: 'Science', platform: 'Google Meet', link: '#' },
  { date: '2025-10-07', time: '09:30 AM', subject: 'English', platform: 'Google Meet', link: '#' },
];

export default function StudentOnlineClasses() {
  return (
    <div className="container" style={{ padding: '100px 0' }}>
      <h1>Online Classes</h1>
      <p>Join your scheduled online classes. Use the links provided by your faculty.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
        {upcomingClasses.map((c, idx) => (
          <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 8px', color: '#1a237e' }}>{c.subject}</h3>
            <p style={{ margin: '6px 0' }}><strong>Date:</strong> {c.date}</p>
            <p style={{ margin: '6px 0' }}><strong>Time:</strong> {c.time}</p>
            <p style={{ margin: '6px 0' }}><strong>Platform:</strong> {c.platform}</p>
            <a href={c.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, background: '#1a237e', color: '#fff', padding: '8px 12px', borderRadius: 6, textDecoration: 'none' }}>Join Class</a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: '0.95rem', color: '#555' }}>
       
      </div>
    </div>
  );
}