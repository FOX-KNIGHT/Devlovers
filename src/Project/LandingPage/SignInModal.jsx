import React, { useState, useCallback, useRef, useEffect } from 'react';

function SignInModal({ isVisible, hideModal, onLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (isVisible && emailInputRef.current) {
      setTimeout(() => emailInputRef.current.focus(), 100);
    }
  }, [isVisible]);

  // Handle email change
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  // Handle email login
  const handleEmailLogin = useCallback(() => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin('Email');
      setIsLoading(false);
      setEmail('');
    }, 500);
  }, [email, onLogin]);

  // Handle OAuth login
  const handleOAuthLogin = useCallback((provider) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(provider);
      setIsLoading(false);
    }, 500);
  }, [onLogin]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (e.target.id === 'signin-modal-overlay') {
      hideModal();
      setEmail('');
    }
  }, [hideModal]);

  // Handle signup click
  const handleSignupClick = useCallback((e) => {
    e.preventDefault();
    console.log('Navigate to signup');
    // Add signup navigation
  }, []);

  // Handle key press for email input
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleEmailLogin();
    }
  }, [handleEmailLogin]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        hideModal();
        setEmail('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, hideModal]);

  return (
    <div 
      className={`modal-overlay ${isVisible ? 'visible' : ''}`} 
      id="signin-modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
    >
      <div className="signin-popup">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 id="signin-title">Sign in</h2>
          <button
            onClick={hideModal}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '5px'
            }}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <p className="signup-link">
          Don't have an account? <a href="#signup" onClick={handleSignupClick}>Sign up</a>
        </p>

        <input 
          ref={emailInputRef}
          type="email" 
          placeholder="Enter your email" 
          id="email-input" 
          value={email}
          onChange={handleEmailChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          aria-label="Email address"
        />

        <button 
          className="register-btn" 
          style={{ width: '100%', margin: '0 0 22px 0', background: 'var(--gradient-primary)' }}
          onClick={handleEmailLogin}
          disabled={isLoading}
          aria-label="Sign in with email"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Signing in...
            </>
          ) : (
            <>
              <i className="fas fa-envelope" aria-hidden="true"></i> Sign In with Email
            </>
          )}
        </button>

        <div className="separator">
          <span>OR</span>
        </div>

        <button 
          className="oauth-btn google" 
          data-auth="google" 
          onClick={() => handleOAuthLogin('Google')}
          disabled={isLoading}
          aria-label="Continue with Google"
        >
          <i className="fab fa-google" aria-hidden="true"></i> Continue with Google
        </button>
        
        <button 
          className="oauth-btn github" 
          data-auth="github" 
          onClick={() => handleOAuthLogin('GitHub')}
          disabled={isLoading}
          aria-label="Continue with GitHub"
        >
          <i className="fab fa-github" aria-hidden="true"></i> Continue with GitHub
        </button>
        
        <button 
          className="oauth-btn ethereum" 
          data-auth="ethereum" 
          onClick={() => handleOAuthLogin('Ethereum')}
          disabled={isLoading}
          aria-label="Continue with Ethereum"
        >
          <i className="fab fa-ethereum" aria-hidden="true"></i> Continue with Ethereum
        </button>

        <p className="privacy-info">
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> apply.
        </p>
      </div>
    </div>
  );
}

export default React.memo(SignInModal);