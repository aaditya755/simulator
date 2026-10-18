/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlacedLed } from '../types';

interface LedShapeProps {
  led: PlacedLed;
  anodePos: { x: number; y: number };
  cathodePos: { x: number; y: number };
  isOn: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const LedShape: React.FC<LedShapeProps> = ({
  led,
  anodePos,
  cathodePos,
  isOn,
  isSelected,
  onSelect,
  onDelete,
}) => {
  // Center position for the LED head (elevated between holes)
  const cx = (anodePos.x + cathodePos.x) / 2;
  const cy = (anodePos.y + cathodePos.y) / 2 - 14;

  return (
    <g
      className="cursor-pointer group select-none"
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
    >
      {/* Selection halo */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r="18"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeDasharray="3 2"
        />
      )}

      {/* Silver bent wire leads connecting into breadboard holes */}
      {/* Anode lead (longer lead, indicated by bend) */}
      <path
        d={`M ${anodePos.x} ${anodePos.y} L ${anodePos.x} ${anodePos.y - 6} L ${cx - 3.5} ${cy + 7}`}
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cathode lead (shorter lead, straight to hole) */}
      <path
        d={`M ${cathodePos.x} ${cathodePos.y} L ${cathodePos.x} ${cathodePos.y - 4} L ${cx + 3.5} ${cy + 7}`}
        stroke="#64748b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal pins at breadboard holes */}
      <circle cx={anodePos.x} cy={anodePos.y} r="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
      <circle cx={cathodePos.x} cy={cathodePos.y} r="2.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />

      {/* Luminous Glow when ON (Instant, no CSS keyframe lag) */}
      {isOn && (
        <g pointerEvents="none">
          {/* Broad outer atmospheric halo */}
          <circle
            cx={cx}
            cy={cy}
            r="26"
            fill="#ff1744"
            opacity="0.25"
          />
          {/* Medium bright aura */}
          <circle
            cx={cx}
            cy={cy}
            r="17"
            fill="#ff1744"
            opacity="0.5"
          />
          {/* Intense near radiance */}
          <circle
            cx={cx}
            cy={cy}
            r="11"
            fill="#ff5252"
            opacity="0.85"
          />
        </g>
      )}

      {/* LED Plastic Rim / Flange */}
      <circle
        cx={cx}
        cy={cy}
        r="9.5"
        fill={isOn ? '#d50000' : '#2b0a0a'}
        stroke={isOn ? '#ff1744' : '#451a1a'}
        strokeWidth="1.2"
      />

      {/* LED Main Epoxy Lens Body */}
      <circle
        cx={cx}
        cy={cy}
        r="8"
        fill={isOn ? '#ff1744' : '#450a0a'}
      />

      {/* Internal Anode / Cathode anvil cup visible through translucent lens */}
      <path
        d={`M ${cx - 3} ${cy + 3} L ${cx} ${cy - 1} L ${cx + 3} ${cy + 3}`}
        stroke={isOn ? '#ffcdd2' : '#290606'}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Core Emitter / Hotspot when ON */}
      {isOn && (
        <circle
          cx={cx}
          cy={cy - 1}
          r="4"
          fill="#ffffff"
          opacity="0.9"
        />
      )}

      {/* Specular curved glass reflection */}
      <ellipse
        cx={cx - 2.5}
        cy={cy - 3}
        rx="2.5"
        ry="1.8"
        fill="#ffffff"
        opacity={isOn ? 0.95 : 0.25}
      />

      {/* Output Label Tag (e.g. "Sum", "Cout", "Q0", "Q1") */}
      {led.label && (
        <g transform={`translate(${cx}, ${cy - 16})`} pointerEvents="none">
          <rect
            x={-led.label.length * 3.8 - 5}
            y="-8"
            width={led.label.length * 7.6 + 10}
            height="14"
            rx="3"
            fill={isOn ? '#b91c1c' : '#0f172a'}
            fillOpacity={isOn ? 0.95 : 0.85}
            stroke={isOn ? '#f87171' : '#475569'}
            strokeWidth="0.9"
          />
          <text
            x="0"
            y="2.5"
            fill="#ffffff"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {led.label}
          </text>
        </g>
      )}
    </g>
  );
};
