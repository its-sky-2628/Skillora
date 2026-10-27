import React, { useState } from 'react';

export default function LearningRoadmap({ roadmap }) {
  const [completedMilestones, setCompletedMilestones] = useState(new Set());

  if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
    return (
      <div className="section" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          No missing skills detected! You're fully ready for this role.
        </p>
      </div>
    );
  }

  const toggleMilestone = (id) => {
    setCompletedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Group milestones by phase
  const phases = [
    {
      key: 'Foundation Phase',
      name: 'Foundation Phase (Critical Must-Haves)',
      desc: 'Master these non-negotiable fundamentals first',
      icon: '🎯'
    },
    {
      key: 'Growth Phase',
      name: 'Growth Phase (Role Competency)',
      desc: 'Deepen knowledge to stand out in interviews',
      icon: '📈'
    },
    {
      key: 'Excellence Phase',
      name: 'Excellence Phase (Differentiators)',
      desc: 'Modern tooling and edge-skills that set you apart',
      icon: '⭐'
    }
  ];

  const getResourceIcon = (type) => {
    switch (type) {
      case 'youtube': return '▶️';
      case 'course': return '🎓';
      case 'github': return '🐙';
      default: return '📖';
    }
  };

  const completedCount = completedMilestones.size;
  const totalCount = roadmap.milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="roadmap-section animate-fade-in">
      {/* Roadmap Summary Banner */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            Personalized Learning Roadmap
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Structured along Bloom's Revised Taxonomy (Remember ➔ Understand ➔ Apply ➔ Analyze ➔ Evaluate ➔ Create)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
          <div className="stat-card" style={{ minWidth: '130px' }}>
            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
              {roadmap.total_estimated_weeks || Math.ceil(totalCount * 1.5)} wks
            </div>
            <div className="stat-label">Total Est. Duration</div>
          </div>
          <div className="stat-card" style={{ minWidth: '130px' }}>
            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
              {progressPercent}%
            </div>
            <div className="stat-label">Roadmap Progress</div>
          </div>
        </div>
      </div>

      {/* Phased Roadmap Timeline */}
      <div className="roadmap-phases">
        {phases.map((phase) => {
          const phaseMilestones = roadmap.milestones.filter(
            (m) => m.phase === phase.key || (m.priority === 'critical' && phase.key.startsWith('Foundation')) || (m.priority === 'important' && phase.key.startsWith('Growth')) || (m.priority === 'nice_to_have' && phase.key.startsWith('Excellence'))
          );

          if (phaseMilestones.length === 0) return null;

          return (
            <div key={phase.key} className="phase-container">
              <div className="phase-header">
                <div className="phase-icon">{phase.icon}</div>
                <div className="phase-info">
                  <div className="phase-name">{phase.name}</div>
                  <div className="phase-desc">{phase.desc}</div>
                </div>
                <div className="phase-meta">
                  {phaseMilestones.length} {phaseMilestones.length === 1 ? 'skill' : 'skills'}
                </div>
              </div>

              <div className="milestone-timeline">
                {phaseMilestones.map((m) => {
                  const isDone = completedMilestones.has(m.id);
                  return (
                    <div key={m.id} className="milestone">
                      <div
                        className="milestone-card"
                        style={{
                          borderColor: isDone ? 'var(--accent-green)' : undefined,
                          opacity: isDone ? 0.75 : 1
                        }}
                      >
                        <div className="milestone-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <input
                              type="checkbox"
                              id={`milestone-${m.id}`}
                              checked={isDone}
                              onChange={() => toggleMilestone(m.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-green)' }}
                            />
                            <label
                              htmlFor={`milestone-${m.id}`}
                              className="milestone-title"
                              style={{
                                cursor: 'pointer',
                                textDecoration: isDone ? 'line-through' : 'none'
                              }}
                            >
                              {m.skill_name}
                            </label>
                            <span className="badge badge-nice" style={{ fontSize: '0.6875rem' }}>
                              {m.category || 'Core'}
                            </span>
                          </div>
                          <span className="milestone-time">
                            ⏱️ ~{m.estimated_hours || 15} hrs ({m.estimated_weeks || 2} wks)
                          </span>
                        </div>

                        <p className="milestone-desc">
                          {m.description || `Build practical expertise and portfolio projects in ${m.skill_name}.`}
                        </p>

                        {/* Bloom's Taxonomy Steps */}
                        {m.bloom_steps && m.bloom_steps.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                              Bloom's Taxonomy Learning Steps:
                            </div>
                            <div className="bloom-steps">
                              {m.bloom_steps.slice(0, 4).map((step, sIdx) => (
                                <div key={sIdx} className="bloom-step" title={step.action || step.description}>
                                  <span className="bloom-step-icon">
                                    {step.level === 1 ? '📖' : step.level === 2 ? '💡' : step.level === 3 ? '🔧' : '🚀'}
                                  </span>
                                  <strong>{step.level_name || `L${step.level}`}</strong>
                                  <div style={{ fontSize: '0.625rem', marginTop: '2px', color: 'var(--text-tertiary)' }}>
                                    {step.verb || step.focus || 'Practice'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resources */}
                        {m.resources && m.resources.length > 0 && (
                          <div className="gap-card-resources" style={{ marginTop: 'var(--space-sm)' }}>
                            {m.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link"
                              >
                                <span className="resource-icon">{getResourceIcon(res.type)}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {res.title}
                                </span>
                                {res.duration && (
                                  <span className="resource-duration">{res.duration}</span>
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
