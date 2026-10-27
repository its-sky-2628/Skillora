import React, { useState, useRef } from 'react';

export default function ResumeUpload({ roles, selectedRole, setSelectedRole, onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    setErrorMsg('');
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx') && !name.endsWith('.doc')) {
      setErrorMsg('Please upload a PDF or DOCX file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }
    setFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Quick sample generator for 1-click testing
  const loadSampleResume = (type = 'data_analyst') => {
    let content = '';
    if (type === 'data_analyst') {
      content = `
Alex Morgan
alex.morgan@example.com | +1 (555) 345-6789 | linkedin.com/in/alexmorgan | github.com/alexmorgan

SUMMARY
Aspiring Data Analyst with strong foundations in SQL, Python, Excel, and data visualization. Passionate about uncovering business insights and statistical modeling.

SKILLS
Programming & Query Languages: Python (Pandas, NumPy, Matplotlib, Seaborn), SQL (PostgreSQL, MySQL), Excel (VLOOKUP, Pivot Tables, Macros)
Visualization & BI Tools: Tableau, Power BI basics
Databases: PostgreSQL, SQLite
Tools & Core: Git, GitHub, Jupyter Notebooks, Basic Statistics, Data Cleaning, Exploratory Data Analysis (EDA)

EDUCATION
Bachelor of Science in Computer Science
Tech University, 2021 - 2025
GPA: 3.8/4.0

PROJECTS
E-Commerce Customer Churn Analysis
- Conducted exploratory data analysis on 50,000+ customer records using Python and Pandas.
- Built interactive Tableau dashboard tracking monthly retention rates and churn risk metrics.
- Executed SQL queries to join and aggregate customer transactional history.

Financial Sales Performance Dashboard
- Created comprehensive Excel dashboards utilizing advanced Pivot Tables, nested formulas, and conditional formatting.
- Cleaned and prepared multi-source sales datasets reducing reporting inconsistencies by 25%.
`;
      setSelectedRole('data_analyst');
    } else if (type === 'software_developer') {
      content = `
Devon Reed
devon.reed@example.com | +1 (555) 987-6543 | github.com/devonreed

SUMMARY
Full Stack Software Developer with 2 years of experience building modern web applications using React, Node.js, Express, and PostgreSQL.

SKILLS
Frontend: React, JavaScript, HTML5, CSS3, Redux
Backend: Node.js, Express, REST APIs, GraphQL basics
Databases: PostgreSQL, MongoDB
DevOps & Tools: Git, Docker, GitHub Actions, Jest

EDUCATION
B.S. in Software Engineering, State University, 2020-2024

PROJECTS
Task Management Web App
- Engineered React frontend with state management, connecting to Express REST API with JWT auth.
- Deployed containerized services with Docker and continuous integration.
`;
      setSelectedRole('software_developer');
    } else {
      content = `
Sam Jordan
sam.jordan@example.com | +1 (555) 234-5678 | github.com/samjordan

SUMMARY
Machine Learning enthusiast with strong Python, Scikit-learn, and mathematical background.

SKILLS
Languages: Python, C++
Machine Learning: Scikit-learn, TensorFlow, PyTorch basics, Data Preprocessing, Regression, Classification
Tools: Git, Jupyter Notebooks, Pandas, NumPy, OpenCV basics

EDUCATION
B.Tech in Artificial Intelligence & Data Science, 2021-2025
`;
      setSelectedRole('ml_engineer');
    }

    const blob = new Blob([content], { type: 'application/pdf' });
    const sampleFile = new File([blob], `sample_${type}_resume.pdf`, { type: 'application/pdf' });
    setFile(sampleFile);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please upload a resume file first.');
      return;
    }
    if (!selectedRole) {
      setErrorMsg('Please select a target job role.');
      return;
    }
    onAnalyze(file, selectedRole);
  };

  return (
    <section className="upload-section">
      <div className="upload-container">
        <h1 className="upload-title">
          Know Where You Stand.<br />
          <span className="text-gradient">Bridge Your Skill Gaps.</span>
        </h1>
        <p className="upload-subtitle">
          Upload your resume and benchmark your skills against industry standards.
          Get an instant Career Readiness Score and an adaptive learning roadmap.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            color: 'var(--accent-red)',
            marginBottom: 'var(--space-lg)',
            fontSize: '0.875rem'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Dropzone */}
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="resume-dropzone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc"
            style={{ display: 'none' }}
            id="resume-file-input"
          />

          <span className="upload-icon">📄</span>
          <p className="upload-text">
            <strong>Click to upload</strong> or drag and drop your resume
          </p>
          <p className="upload-hint">Supported formats: PDF, DOCX (Max 10MB)</p>
        </div>

        {/* Selected File Preview */}
        {file && (
          <div className="file-preview animate-fade-in-up">
            <span className="file-preview-icon">📎</span>
            <div className="file-preview-info">
              <div className="file-preview-name">{file.name}</div>
              <div className="file-preview-size">{formatFileSize(file.size)}</div>
            </div>
            <button
              type="button"
              className="file-remove"
              onClick={handleRemoveFile}
              title="Remove file"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sample Resumes Quick Pick */}
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Or try demo resume:</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => loadSampleResume('data_analyst')}
          >
            📊 Data Analyst
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => loadSampleResume('ml_engineer')}
          >
            🤖 ML Engineer
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => loadSampleResume('software_developer')}
          >
            💻 Software Dev
          </button>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <label>Select Target Job Role</label>
          <div className="role-grid">
            {roles && roles.length > 0 ? (
              roles.map((r) => (
                <div
                  key={r.key}
                  className={`role-option ${selectedRole === r.key ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(r.key)}
                  id={`role-option-${r.key}`}
                >
                  <span className="role-option-icon">{r.icon || '💼'}</span>
                  <span className="role-option-title">{r.title}</span>
                  <span className="role-option-count">{r.skill_count} benchmark skills</span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-tertiary)', gridColumn: 'span 3', padding: '1rem' }}>
                Loading available roles...
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!file || isLoading}
          style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}
          id="analyze-resume-submit-btn"
        >
          {isLoading ? 'Analyzing Resume...' : 'Analyze My Skill Gaps 🚀'}
        </button>
      </div>
    </section>
  );
}
