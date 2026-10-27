import React from 'react';

export default function RadarChart({ categoryScores, size = 340 }) {
  if (!categoryScores || Object.keys(categoryScores).length === 0) {
    return null;
  }

  const categories = Object.keys(categoryScores);
  const totalAxes = categories.length;
  if (totalAxes < 3) {
    // If fewer than 3 categories, display simple bar comparison
    return null;
  }

  const radius = size * 0.38;
  const center = size / 2;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to get coordinates
  const getCoordinates = (valueNormalized, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const x = center + radius * valueNormalized * Math.cos(angle);
    const y = center + radius * valueNormalized * Math.sin(angle);
    return { x, y };
  };

  // Build points for candidate polygon
  const candidatePoints = categories.map((cat, i) => {
    const score = (categoryScores[cat]?.score || 0) / 100;
    const { x, y } = getCoordinates(Math.max(0.08, score), i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="radar-chart-container animate-fade-in">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* Concentric Polygons */}
        {levels.map((lvl) => {
          const points = categories.map((_, i) => {
            const { x, y } = getCoordinates(lvl, i);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={lvl}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Radial Axes */}
        {categories.map((cat, i) => {
          const { x, y } = getCoordinates(1.0, i);
          return (
            <line
              key={cat}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Candidate Area */}
        <polygon
          points={candidatePoints}
          fill="url(#radarFill)"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          filter="drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))"
        />

        {/* Candidate Data Dots & Labels */}
        {categories.map((cat, i) => {
          const score = categoryScores[cat]?.score || 0;
          const { x: dotX, y: dotY } = getCoordinates(Math.max(0.08, score / 100), i);
          const { x: lblX, y: lblY } = getCoordinates(1.18, i);

          return (
            <g key={`data-${cat}`}>
              <circle
                cx={dotX}
                cy={dotY}
                r="4"
                fill="#38bdf8"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text
                x={lblX}
                y={lblY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
                fontFamily="var(--font-sans)"
              >
                {cat} ({Math.round(score)}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
