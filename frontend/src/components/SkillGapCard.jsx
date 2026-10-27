import React from 'react';

export default function SkillGapCard({ skill, onSelectResource }) {
  const priority = skill.priority || 'nice_to_have';
  const badgeClass = priority === 'critical' 
    ? 'badge-critical' 
    : priority === 'important' 
      ? 'badge-important' 
      : 'badge-nice';

  const priorityLabel = priority === 'critical' 
    ? 'Critical Must-Have' 
    : priority === 'important' 
      ? 'Important Growth' 
      : 'Nice to Have';

  const getResourceIcon = (type) => {
    switch (type) {
      case 'youtube': return '▶️';
      case 'course': return '🎓';
      case 'github': return '🐙';
      case 'doc': return '📖';
      default: return '🔗';
    }
  };

  return (
    <div className={`gap-card priority-${priority} animate-fade-in-up`}>
      <div className="gap-card-header">
        <div>
          <div className="gap-card-title">{skill.name}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Category: {skill.category || 'Core Skill'}
          </span>
        </div>
        <span className={`badge ${badgeClass}`}>{priorityLabel}</span>
      </div>

      <p className="gap-card-desc">
        {skill.description || `Key competency required for industry benchmark standard in this role.`}
      </p>

      {skill.resources && skill.resources.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 'var(--space-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recommended Resources
          </div>
          <div className="gap-card-resources">
            {skill.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-link"
                title={`Open ${res.title}`}
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
        </div>
      )}
    </div>
  );
}
