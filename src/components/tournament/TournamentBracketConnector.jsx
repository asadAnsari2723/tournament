// src/components/tournament/TournamentBracketConnector.jsx

import React, { useState, useLayoutEffect } from 'react';

export default function TournamentBracketConnector({ bracketStructure, containerRef }) {
  const [connections, setConnections] = useState([]);

  useLayoutEffect(() => {
    if (!containerRef?.current || !bracketStructure?.length) return;

    const calculateConnections = () => {
      const newConnections = [];
      const containerRect = containerRef.current.getBoundingClientRect();

      for (let roundIndex = 0; roundIndex < bracketStructure.length - 1; roundIndex++) {
        const currentRound = bracketStructure[roundIndex];
        for (let matchIndex = 0; matchIndex < currentRound.length; matchIndex++) {
          const nextMatchIndex = Math.floor(matchIndex / 2);

          const matchEl = containerRef.current.querySelector(
            `[data-round="${roundIndex}"][data-match="${matchIndex}"]`
          );
          const nextMatchEl = containerRef.current.querySelector(
            `[data-round="${roundIndex + 1}"][data-match="${nextMatchIndex}"]`
          );

          if (!matchEl || !nextMatchEl) continue;

          const mRect = matchEl.getBoundingClientRect();
          const nRect = nextMatchEl.getBoundingClientRect();

          // right side of current to left side of next (left -> right flow)
          const p1 = {
            x: mRect.right - containerRect.left,
            y: mRect.top + mRect.height / 2 - containerRect.top
          };
          const p2 = {
            x: nRect.left - containerRect.left,
            y: nRect.top + nRect.height / 2 - containerRect.top
          };

          // control point for bezier
          const midX = p1.x + Math.max(40, (p2.x - p1.x) / 2);

          // smooth cubic bezier path
          const path = `M ${p1.x},${p1.y} C ${midX},${p1.y} ${midX},${p2.y} ${p2.x},${p2.y}`;

          newConnections.push({
            id: `conn-${roundIndex}-${matchIndex}`,
            d: path
          });
        }
      }

      setConnections(newConnections);
    };

    // small delay to allow DOM paint
    const t = setTimeout(calculateConnections, 40);
    window.addEventListener('resize', calculateConnections);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', calculateConnections);
    };
  }, [bracketStructure, containerRef]);

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: -1 }}>
      <defs>
        <linearGradient id="bracketConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <g>
        {connections.map(conn => (
          <path
            key={conn.id}
            d={conn.d}
            stroke="url(#bracketConnectionGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
