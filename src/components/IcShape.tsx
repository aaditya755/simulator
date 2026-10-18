/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlacedIc } from '../types';
import { IC_CATALOG } from '../engine/ics';
import { AlertCircle } from 'lucide-react';

interface IcShapeProps {
  ic: PlacedIc;
  xStart: number;
  yChannel: number;
  colWidth: number;
  isPowered: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const IcShape: React.FC<IcShapeProps> = ({
  ic,
  xStart,
  yChannel,
  colWidth,
  isPowered,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const def = IC_CATALOG[ic.type];
  const half = (def ? def.pinCount : 14) / 2;
  const chipWidth = half * colWidth;
  const chipHeight = 44; // Straddles from row f (yChannel - 22) to row e (yChannel + 22)
  const chipTop = yChannel - chipHeight / 2;

  return (
    <g
      className="cursor-pointer group"
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
      {/* Selection / Highlight Outline */}
      {isSelected && (
        <rect
          x={xStart - 4}
          y={chipTop - 6}
          width={chipWidth + 8}
          height={chipHeight + 12}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          rx="6"
          strokeDasharray="4 2"
        />
      )}

      {/* Silver Pin Leads */}
      {Array.from({ length: half }).map((_, i) => {
        const pinX = xStart + i * colWidth + colWidth / 2;
        return (
          <g key={i}>
            {/* Upper Pin Lead (row f) */}
            <rect
              x={pinX - 3}
              y={chipTop - 8}
              width="6"
              height="10"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="0.8"
              rx="1"
            />
            {/* Lower Pin Lead (row e) */}
            <rect
              x={pinX - 3}
              y={chipTop + chipHeight - 2}
              width="6"
              height="10"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="0.8"
              rx="1"
            />
          </g>
        );
      })}

      {/* Main IC Chip Body (Plastic DIP package) */}
      <rect
        x={xStart}
        y={chipTop}
        width={chipWidth}
        height={chipHeight}
        fill="#1e222d"
        stroke="#0f172a"
        strokeWidth="1.5"
        rx="4"
        className="filter drop-shadow-md"
      />

      {/* Pin 1 Notch (left edge semicircular indentation) */}
      <path
        d={`M ${xStart} ${yChannel - 6} A 6 6 0 0 1 ${xStart} ${yChannel + 6} Z`}
        fill="#0f172a"
      />
      {/* Pin 1 Dot Marker */}
      <circle
        cx={xStart + 9}
        cy={chipTop + chipHeight - 9}
        r="2"
        fill="#64748b"
      />

      {/* Chip Type Label */}
      <text
        x={xStart + chipWidth / 2}
        y={yChannel + 3}
        fill="#e2e8f0"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        {ic.type}
      </text>

      {/* Subtle Manufacturer Stamp */}
      <text
        x={xStart + chipWidth / 2}
        y={yChannel - 8}
        fill="#64748b"
        fontSize="7"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
      >
        TTL 74XX
      </text>

      {/* Unpowered Badge */}
      {!isPowered && (
        <g transform={`translate(${xStart + chipWidth - 14}, ${chipTop - 8})`}>
          <rect
            x="-2"
            y="-2"
            width="18"
            height="14"
            rx="3"
            fill="#ef4444"
            className="animate-pulse"
          />
          <text
            x="7"
            y="9"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            !
          </text>
        </g>
      )}
    </g>
  );
};
