import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '12px' }}>Page Not Found</h1>
      <p style={{ color: '#666' }}>The page you’re looking for doesn’t exist or has moved.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
      </div>
    </div>
  );
}