import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  overlay = false,
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    success: 'loading-spinner--success',
    warning: 'loading-spinner--warning',
    danger: 'loading-spinner--danger',
    white: 'loading-spinner--white'
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size] || sizeClasses.medium,
    colorClasses[color] || colorClasses.primary
  ].join(' ');

  const containerClasses = [
    'loading-container',
    overlay && 'loading-container--overlay',
    fullScreen && 'loading-container--fullscreen'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="loading-content">
        <div className={spinnerClasses}>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  count = 1,
  className = ''
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        marginBottom: count > 1 && index < count - 1 ? '8px' : '0'
      }}
    />
  ));

  return <div className="skeleton-container">{skeletons}</div>;
};

// Progress bar component
export const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  color = 'primary',
  height = '8px',
  animated = true 
}) => {
  const progressBarClasses = [
    'progress-bar',
    `progress-bar--${color}`,
    animated && 'progress-bar--animated'
  ].filter(Boolean).join(' ');

  return (
    <div className="progress-container">
      <div className="progress-track" style={{ height }}>
        <div 
          className={progressBarClasses}
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%'
          }}
        />
      </div>
      {showPercentage && (
        <span className="progress-percentage">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Button loading state
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  loadingText = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`btn loading-button ${className} ${loading ? 'loading-button--loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          color="white" 
        />
      )}
      <span className={loading ? 'loading-button__text--hidden' : ''}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

// Dots loading animation
export const DotsLoader = ({ color = 'primary', size = 'medium' }) => {
  const dotsClasses = [
    'dots-loader',
    `dots-loader--${color}`,
    `dots-loader--${size}`
  ].join(' ');

  return (
    <div className={dotsClasses}>
      <div className="dots-loader__dot"></div>
      <div className="dots-loader__dot"></div>
      <div className="dots-loader__dot"></div>
    </div>
  );
};

// Pulse loading animation
export const PulseLoader = ({ color = 'primary', size = 'medium' }) => {
  const pulseClasses = [
    'pulse-loader',
    `pulse-loader--${color}`,
    `pulse-loader--${size}`
  ].join(' ');

  return (
    <div className={pulseClasses}>
      <div className="pulse-loader__circle"></div>
    </div>
  );
};

export default LoadingSpinner;