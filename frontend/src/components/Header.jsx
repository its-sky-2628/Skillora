import React from 'react';

export default function Header({ currentView, onReset, selectedRoleTitle }) {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onReset(); }}>
          <div className="logo-icon">🎯</div>
          <div className="logo-text">
            Skillora <span>AI</span>
          </div>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {selectedRoleTitle && (
            <div className="header-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              Target: {selectedRoleTitle}
            </div>
          )}
          <span className="header-badge">MVP Edition</span>
          {currentView !== 'upload' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onReset}
              id="upload-new-resume-btn"
            >
              ↻ Upload New Resume
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
