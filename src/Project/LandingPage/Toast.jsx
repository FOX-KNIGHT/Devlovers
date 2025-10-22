import React, { useMemo } from 'react';

function Toast({ message, isVisible }) {
  // Determine icon based on message content
  const icon = useMemo(() => {
    if (!message) return 'fa-check-circle';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return 'fa-times-circle';
    }
    if (lowerMessage.includes('warning') || lowerMessage.includes('deadline')) {
      return 'fa-exclamation-triangle';
    }
    if (lowerMessage.includes('info') || lowerMessage.includes('showing')) {
      return 'fa-info-circle';
    }
    if (lowerMessage.includes('logout') || lowerMessage.includes('signed out')) {
      return 'fa-sign-out-alt';
    }
    if (lowerMessage.includes('login') || lowerMessage.includes('welcome') || lowerMessage.includes('signed in')) {
      return 'fa-check-circle';
    }
    
    return 'fa-check-circle';
  }, [message]);

  // Determine toast style based on message type
  const toastStyle = useMemo(() => {
    if (!message) return {};
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return { backgroundColor: 'var(--color-danger)' };
    }
    if (lowerMessage.includes('warning')) {
      return { backgroundColor: 'var(--color-warning)', color: 'var(--color-text)' };
    }
    
    return { backgroundColor: 'var(--color-success)' };
  }, [message]);

  if (!message) return null;

  return (
    <div 
      className={`toast ${isVisible ? 'show' : ''}`} 
      id="toast"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={toastStyle}
    >
      <i className={`fas ${icon}`} aria-hidden="true"></i>
      <span id="toast-message">{message}</span>
    </div>
  );
}

export default React.memo(Toast);