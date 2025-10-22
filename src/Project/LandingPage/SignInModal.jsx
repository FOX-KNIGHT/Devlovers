// src/Project/LandingPage/SignInModal.jsx
import React from 'react';

function SignInModal({ isVisible, hideModal, onLogin }) {

  const handleOAuthLogin = (provider) => {
    onLogin(provider);
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} id="signin-modal-overlay" onClick={(e) => { if (e.target.id === 'signin-modal-overlay') hideModal(); }}>
      <div className="signin-popup">
        <h2>Sign in</h2>
        <p className="signup-link">Don't have an account? <a href="#signup">Sign up</a></p>

        <input type="email" placeholder="Enter your email" id="email-input" />

        <button 
          className="register-btn" 
          style={{ width: '100%', margin: '0 0 22px 0', background: 'var(--gradient-primary)' }}
          onClick={() => onLogin('Email')} 
        >
            Sign In with Email
        </button>


        <div className="separator">
          <span>OR</span>
        </div>

        <button className="oauth-btn google" data-auth="google" onClick={() => handleOAuthLogin('Google')}>
          <i className="fab fa-google"></i> Continue with Google
        </button>
        <button className="oauth-btn github" data-auth="github" onClick={() => handleOAuthLogin('GitHub')}>
          <i className="fab fa-github"></i> Continue with GitHub
        </button>
        <button className="oauth-btn ethereum" data-auth="ethereum" onClick={() => handleOAuthLogin('Ethereum')}>
          <i className="fab fa-ethereum"></i> Continue with Ethereum
        </button>

        <p className="privacy-info">
          This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
        </p>
      </div>
    </div>
  );
}

export default SignInModal;