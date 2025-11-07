import React, { useState, useEffect } from 'react';
import { apiLoadingState } from '../../services/api';
import LoadingSpinner from '../Loading/LoadingSpinner';
import './GlobalLoadingIndicator.css';

const GlobalLoadingIndicator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const handleLoadingChange = (loading, count) => {
      setIsLoading(loading);
      setRequestCount(count);
    };

    apiLoadingState.addCallback(handleLoadingChange);

    return () => {
      apiLoadingState.removeCallback(handleLoadingChange);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="global-loading-indicator">
      <div className="global-loading-content">
        <LoadingSpinner size="small" />
        <span className="global-loading-text">
          {requestCount === 1 ? 'Loading...' : `Loading (${requestCount} requests)...`}
        </span>
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator;