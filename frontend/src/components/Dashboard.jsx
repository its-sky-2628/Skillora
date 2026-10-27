import React, { useState } from 'react';
import SkillGapCard from './SkillGapCard.jsx';
import RadarChart from './RadarChart.jsx';
import LearningRoadmap from './LearningRoadmap.jsx';

export default function Dashboard({ data, onGoToRoadmap, onUploadAnother }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { analysis, extracted_skills, contact, resume_stats, roadmap } = data;
  const score = Math.round(analysis?.readiness_score || 0);
  const summary = analysis?.summary || {};
  const matchedSkills = analysis?.matched_skills || [];
  const missingSkills = analysis?.missing_skills || [];
  const categoryScores = analysis?.category_scores || {};

  // Gauge circle math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine gauge color
  const getGaugeColor = (val) => {
    if (val >= 75) return 'var(--accent-green)';
    if (val >= 50) return 'var(--accent-yellow)';
    if (val >= 30) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  const filteredGaps = missingSkills.filter((skill) => {
    if (priorityFilter === 'all') return true;
    return skill.priority === priorityFilter;
  });

  const criticalCount = missingSkills.filter((s) => s.priority === 'critical').length;
  const importantCount = missingSkills.filter((s) => s.priority === 'important').length;

  return (
    <div className="container dashboard animate-fade-in">
      {/* Candidate Contact & Info Banner if available */}
      {contact && (contact.name || contact.email) && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{contact.name || 'Candidate Profile'}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                {contact.email && <span>📧 {contact.email} </span>}
                {contact.phone && <span> | 📱 {contact.phone}</span>}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Parsed <strong>{resume_stats?.word_count || 0}</strong> words • Found <strong>{extracted_skills?.length || 0}</strong> raw skills
          </div>
        </div>
      )}

      {/* Hero Score Section */}
      <div className="glass-card score-section">
        {/* Circular Gauge */}
        <div className="score-gauge">
          <svg viewBox="0 0 200 200">
            <circle
              className="score-gauge-bg"
              cx="100"
              cy="100"
              r={radius}
            />
            <circle
              className="score-gauge-fill"
              cx="100"
              cy="100"
              r={radius}
              stroke={getGaugeColor(score)}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="score-value">
            <div className="score-number" style={{ color: getGaugeColor(score) }}>
              {score}%
            </div>
            <div className="score-label">Readiness</div>
            <div className="score-level" style={{ color: summary.color || 'var(--accent-purple)' }}>
              {summary.level || 'Evaluated'}
            </div>
          </div>
        </div>

        {/* Score Context & Quick Stats */}
        <div className="score-info">
          <h2 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
            Role Benchmark Analysis
          </h2>
          <p className="score-message">
            {summary.message || "Here is your competency breakdown against the standard industry expectations."}
          </p>

          <div className="score-stats">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                {matchedSkills.length}
              </div>
              <div className="stat-label">Skills Matched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
                {missingSkills.length}
              </div>
              <div className="stat-label">Competency Gaps</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>
                {criticalCount}
              </div>
              <div className="stat-label">Critical Gaps</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
                ~{summary.estimated_prep_weeks || 6} wks
              </div>
              <div className="stat-label">Est. Time to Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          id="tab-overview"
        >
          🔍 Skill Gaps & Radar ({missingSkills.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'matched' ? 'active' : ''}`}
          onClick={() => setActiveTab('matched')}
          id="tab-matched"
        >
          ✅ Matched Competencies ({matchedSkills.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
          id="tab-roadmap"
        >
          🗺️ Learning Roadmap ({roadmap?.milestones?.length || 0} Steps)
        </button>
      </div>

      {/* Tab 1: Overview & Skill Gaps */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {/* Radar Chart & Category Coverage Grid */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)', alignItems: 'center' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-md)' }}>
                📊 Competency Distribution
              </h3>
              <RadarChart categoryScores={categoryScores} />
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-md)' }}>
                📈 Category Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {Object.entries(categoryScores).map(([catName, stats]) => {
                  const pct = Math.round(stats.score || 0);
                  const colorClass = pct >= 70 ? 'green' : pct >= 40 ? 'yellow' : 'red';
                  return (
                    <div key={catName}>
                      <div className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{catName}</span>
                        <span className="font-mono text-secondary">
                          {stats.matched} / {stats.total} ({pct}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${colorClass}`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Skill Gaps Section */}
          <div className="section-header">
            <div className="section-title">
              <span>⚠️ Identified Skill Gaps</span>
              <span className="badge badge-critical">{missingSkills.length} Total</span>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button
                className={`btn btn-sm ${priorityFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPriorityFilter('all')}
              >
                All ({missingSkills.length})
              </button>
              <button
                className={`btn btn-sm ${priorityFilter === 'critical' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPriorityFilter('critical')}
              >
                Critical ({criticalCount})
              </button>
              <button
                className={`btn btn-sm ${priorityFilter === 'important' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPriorityFilter('important')}
              >
                Important ({importantCount})
              </button>
            </div>
          </div>

          {filteredGaps.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No gaps match the selected priority filter.</p>
            </div>
          ) : (
            <div className="gap-cards">
              {filteredGaps.map((skill, index) => (
                <SkillGapCard key={skill.name || index} skill={skill} />
              ))}
            </div>
          )}

          {/* CTA to Roadmap */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setActiveTab('roadmap')}
              id="view-full-roadmap-cta"
            >
              Generate Step-by-Step Learning Roadmap 🚀
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Matched Skills */}
      {activeTab === 'matched' && (
        <div className="animate-fade-in">
          <div className="glass-card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="section-header">
              <div className="section-title">
                <span>🎯 Matched Candidate Skills</span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  {matchedSkills.length} Verified
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
              These competencies were detected in your resume and successfully align with the target job role.
            </p>

            <div className="skills-grid">
              {matchedSkills.map((s, idx) => (
                <div key={idx} className="skill-tag matched animate-scale-in">
                  <span>✓</span>
                  <span>{s.name}</span>
                  <span style={{ fontSize: '0.6875rem', opacity: 0.75, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* All Extracted Skills from Resume */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-sm)' }}>
              📋 All Skills Found in Resume ({extracted_skills?.length || 0})
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
              Full list of keywords and skills extracted during resume parsing.
            </p>
            <div className="skills-grid">
              {extracted_skills?.map((s, idx) => (
                <div key={idx} className="skill-tag">
                  {typeof s === 'string' ? s : s.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Learning Roadmap */}
      {activeTab === 'roadmap' && (
        <LearningRoadmap roadmap={roadmap} />
      )}
    </div>
  );
}
