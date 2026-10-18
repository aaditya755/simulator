/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wire } from '../types';

interface WireShapeProps {
  wire: Wire;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isSelected: boolean;
  hasConflict: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onFlipRailEnd?: (endpoint: 'from' | 'to') => void;
}

const WIRE_COLORS: Record<string, { stroke: string; shadow: string; terminal: string }> = {
  red: { stroke: '#ef4444', shadow: '#991b1b', terminal: '#b91c1c' },
  black: { stroke: '#1e293b', shadow: '#0f172a', terminal: '#0f172a' },
  green: { stroke: '#22c55e', shadow: '#15803d', terminal: '#166534' },
  yellow: { stroke: '#eab308', shadow: '#a16207', terminal: '#854d0e' },
  blue: { stroke: '#3b82f6', shadow: '#1d4ed8', terminal: '#1e40af' },
};

export const WireShape: React.FC<WireShapeProps> = ({
  wire,
  fromPos,
  toPos,
  isSelected,
  hasConflict,
  onSelect,
  onDelete,
  onFlipRailEnd,
}) => {
  const cfg = WIRE_COLORS[wire.color] || WIRE_COLORS.green;

  // Natural curved trajectory
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Compute curve control points
  // Add some downward or outward bend depending on distance
  const curvature = Math.min(Math.max(dist * 0.25, 20), 70);
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2 + curvature;

  const pathD = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;

  // Check if endpoints are on power rails (for tap-to-flip)
  const isFromRail =
    wire.fromHoleId.startsWith('railTop') || wire.fromHoleId.startsWith('railBottom');
  const isToRail =
    wire.toHoleId.startsWith('railTop') || wire.toHoleId.startsWith('railBottom');

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
      {/* Invisible wider hit area for easy clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="14"
      />

      {/* Conflict pulsating glow */}
      {hasConflict && (
        <path
          d={pathD}
          fill="none"
          stroke="#ef4444"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.8"
          className="animate-pulse"
        />
      )}

      {/* Selection outline */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
      )}

      {/* Drop shadow for 3D realism */}
      <path
        d={pathD}
        fill="none"
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.25"
        transform="translate(1, 2.5)"
      />

      {/* Main Insulated Wire Body */}
      <path
        d={pathD}
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Specular highlight stripe along the wire */}
      <path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
        transform="translate(-0.4, -0.6)"
      />

      {/* Start pin terminal */}
      <circle
        cx={fromPos.x}
        cy={fromPos.y}
        r="3.5"
        fill={cfg.terminal}
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* End pin terminal */}
      <circle
        cx={toPos.x}
        cy={toPos.y}
        r="3.5"
        fill={cfg.terminal}
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* Tap-to-flip buttons on rail ends */}
      {isFromRail && onFlipRailEnd && (
        <g
          className="hover:scale-125 transition-transform cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            onFlipRailEnd('from');
          }}
        >
          <title>Tap to flip this wire between +5V (1) and GND (0)</title>
          <circle
            cx={fromPos.x}
            cy={fromPos.y}
            r="6"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 1"
          />
          <text
            x={fromPos.x}
            y={fromPos.y - 8}
            fill="#b45309"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="bold"
            textAnchor="middle"
          >
            {wire.fromHoleId.includes('+') ? '1' : '0'}
          </text>
        </g>
      )}

      {isToRail && onFlipRailEnd && (
        <g
          className="hover:scale-125 transition-transform cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            onFlipRailEnd('to');
          }}
        >
          <title>Tap to flip this wire between +5V (1) and GND (0)</title>
          <circle
            cx={toPos.x}
            cy={toPos.y}
            r="6"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 1"
          />
          <text
            x={toPos.x}
            y={toPos.y - 8}
            fill="#b45309"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="bold"
            textAnchor="middle"
          >
            {wire.toHoleId.includes('+') ? '1' : '0'}
          </text>
        </g>
      )}

      {/* Wire Label if present */}
      {wire.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x="-10"
            y="-7"
            width="20"
            height="14"
            rx="3"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="3"
            fill="#f8fafc"
            fontSize="8"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {wire.label}
          </text>
        </g>
      )}
    </g>
  );
};
