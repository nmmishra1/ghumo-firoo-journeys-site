import React from 'react';

interface RouteAnimationProps {
  variant?: 'heli' | 'road';
}

const RouteAnimation: React.FC<RouteAnimationProps> = ({ variant = 'road' }) => {
  // Simple schematic coordinates
  // Common points
  const yamunotri = { x: 20, y: 40, label: "Yamunotri" };
  const gangotri = { x: 45, y: 20, label: "Gangotri" };
  const kedarnath = { x: 70, y: 30, label: "Kedarnath" };
  const badrinath = { x: 85, y: 45, label: "Badrinath" };

  // Variant specific points
  const startPoint = variant === 'heli' 
    ? { x: 40, y: 85, label: "Dehradun" } // Dehradun is slightly west of Haridwar
    : { x: 50, y: 90, label: "Haridwar" };

  const points = {
    start: startPoint,
    yamunotri,
    gangotri,
    kedarnath,
    badrinath,
  };

  const pathD = `M${points.start.x},${points.start.y} L${points.yamunotri.x},${points.yamunotri.y} L${points.gangotri.x},${points.gangotri.y} L${points.kedarnath.x},${points.kedarnath.y} L${points.badrinath.x},${points.badrinath.y} L${points.start.x},${points.start.y}`;

  return (
    <div className="w-full max-w-md mx-auto aspect-square relative bg-blue-50/50 rounded-full border-4 border-white shadow-xl overflow-hidden p-8">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: 0;
              }
            }
            .path-anim {
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
              animation: dash 5s linear infinite;
            }
          `}
        </style>
        {/* Background Path */}
        <path
          d={pathD}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Animated Path */}
        <path
          className="path-anim"
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Locations */}
        {Object.entries(points).map(([key, p]) => (
          <g key={key}>
            <circle cx={p.x} cy={p.y} r="3" fill="#ea580c" className="animate-pulse" />
            <text x={p.x} y={p.y + 6} fontSize="4" textAnchor="middle" fill="#1e293b" fontWeight="bold">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-blue-800 border border-blue-200 shadow-sm">
        {variant === 'heli' ? 'Heli Route' : 'Road Route'}
      </div>
    </div>
  );
};

export default RouteAnimation;
