import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="orb-container">
        <div className="orb-ring orb-ring-outer"></div>
        <div className="orb-ring orb-ring-middle"></div>
        <div className="orb-ring orb-ring-inner"></div>
        <div className="logo-container">
          <svg 
            className="loading-logo" 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      {message && (
        <div className="loading-message-container">
          <div className="loading-message">
            {message.split('').map((char, index) => (
              <span 
                key={index} 
                className="loading-char"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  display: char === ' ' ? 'inline' : 'inline-block',
                  minWidth: char === ' ' ? '0.25em' : 'auto'
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
