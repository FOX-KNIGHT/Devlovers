// src/Project/LandingPage/Toast.jsx
import React from 'react';

function Toast({ message, isVisible }) {
  if (!message) return null;

  return (
    <div className={`toast ${isVisible ? 'show' : ''}`} id="toast">
      <i className="fas fa-check-circle"></i>
      <span id="toast-message">{message}</span>
    </div>
  );
}

export default Toast;