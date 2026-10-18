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
  // Center position for the LED head
  const cx = (anodePos.x + cathodePos.x) / 2;
  const cy = (anodePos.y + cathodePos.y) / 2 - 12; // elevated slightly

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
          r="16"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
      )}

      {/* Silver bent wire leads connecting into holes */}
      <path
        d={`M ${anodePos.x} ${anodePos.y} L ${cx - 3} ${cy + 6}`}
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d={`M ${cathodePos.x} ${cathodePos.y} L ${cx + 3} ${cy + 6}`}
        stroke="#64748b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Soft Glow when illuminated */}
      {isOn && (
        <g>
          {/* Broad atmospheric glow */}
          <circle
            cx={cx}
            cy={cy}
            r="22"
            fill="#ef4444"
            opacity="0.35"
            className="animate-pulse"
          />
          {/* Intense near glow */}
          <circle
            cx={cx}
            cy={cy}
            r="14"
            fill="#f87171"
            opacity="0.6"
          />
        </g>
      )}

      {/* LED Plastic Dome Base Ring */}
      <circle
        cx={cx}
        cy={cy}
        r="9"
        fill={isOn ? '#dc2626' : '#7f1d1d'}
        stroke={isOn ? '#ef4444' : '#991b1b'}
        strokeWidth="1.2"
      />

      {/* LED Main Colored Dome */}
      <circle
        cx={cx}
        cy={cy}
        r="7.5"
        fill={isOn ? '#ef4444' : '#991b1b'}
      />

      {/* Hotspot / Specular reflection */}
      <circle
        cx={cx - 2.5}
        cy={cy - 2.5}
        r={isOn ? 3.5 : 2}
        fill={isOn ? '#fee2e2' : '#fca5a5'}
        opacity={isOn ? 0.9 : 0.4}
      />

      {/* Label Badge if present */}
      {led.label && (
        <g transform={`translate(${cx}, ${cy - 14})`}>
          <rect
            x={-led.label.length * 3.5 - 4}
            y="-8"
            width={led.label.length * 7 + 8}
            height="13"
            rx="3"
            fill="#0f172a"
            fillOpacity="0.85"
            stroke="#475569"
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="2"
            fill="#f8fafc"
            fontSize="8.5"
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
