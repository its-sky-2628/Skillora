import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ResumeUpload from './components/ResumeUpload.jsx';
import Dashboard from './components/Dashboard.jsx';

// Fallback roles in case backend is initializing
const DEFAULT_ROLES = [
  { key: 'data_analyst', title: 'Data Analyst', icon: '📊', skill_count: 24, description: 'Extract insights from data using SQL, Python & BI tools' },
  { key: 'ml_engineer', title: 'Machine Learning Engineer', icon: '🤖', skill_count: 28, description: 'Design, train and deploy predictive machine learning models' },
  { key: 'software_developer', title: 'Software Developer', icon: '💻', skill_count: 26, description: 'Build end-to-end applications, APIs and distributed systems' },
  { key: 'frontend_developer', title: 'Frontend Developer', icon: '🎨', skill_count: 22, description: 'Craft responsive, performant user interfaces with modern web tech' },
  { key: 'backend_developer', title: 'Backend Developer', icon: '⚙️', skill_count: 25, description: 'Architect robust server architectures, databases and microservices' },
  { key: 'devops_engineer', title: 'DevOps / Cloud Engineer', icon: '☁️', skill_count: 24, description: 'Automate CI/CD pipelines, container orchestration and cloud infra' }
];

export default function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload' | 'dashboard'
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState('data_analyst');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadingSteps = [
    'Parsing resume text & sections (Education, Skills, Projects)...',
    'Extracting candidate competencies & tool taxonomy...',
    'Benchmarking against industry role standards & weightings...',
    'Calculating Career Readiness Score & Bloom\'s learning roadmap...'
  ];

  // Fetch available roles from backend on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles');
        if (res.ok) {
          const data = await res.json();
          if (data.roles && data.roles.length > 0) {
            setRoles(data.roles);
          }
        }
      } catch (err) {
        console.warn('Using default roles due to offline backend:', err);
      }
    };
    fetchRoles();
  }, []);

  // Handle Resume Analysis
  const handleAnalyze = async (file, roleKey) => {
    setIsLoading(true);
    setErrorMsg('');
    setLoadingStepIndex(0);

    // Simulate animated step progression
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_role', roleKey);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed with status ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setErrorMsg(err.message || 'An error occurred during resume analysis.');
      alert(`Analysis error: ${err.message}`);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setCurrentView('upload');
    setErrorMsg('');
  };

  const selectedRoleObj = roles.find((r) => r.key === selectedRole);

  return (
    <div className="app">
      <Header
        currentView={currentView}
        onReset={handleReset}
        selectedRoleTitle={selectedRoleObj?.title}
      />

      <main>
        {currentView === 'upload' && (
          <ResumeUpload
            roles={roles}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        )}

        {currentView === 'dashboard' && analysisResult && (
          <Dashboard
            data={analysisResult}
            onUploadAnother={handleReset}
          />
        )}
      </main>

      {/* Loading Overlay with Multi-Step Progress */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
              Analyzing Your Competencies
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Skillora AI is benchmarking your profile...
            </p>
          </div>

          <div className="loading-steps">
            {loadingSteps.map((step, idx) => {
              const isDone = idx < loadingStepIndex;
              const isActive = idx === loadingStepIndex;
              return (
                <div
                  key={idx}
                  className={`loading-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                >
                  <span>{isDone ? '✓' : isActive ? '⏳' : '○'}</span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
