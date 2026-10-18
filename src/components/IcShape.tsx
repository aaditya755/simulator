/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlacedIc } from '../types';
import { IC_CATALOG } from '../engine/ics';

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

  // The chip body spans from (xStart - 10) to (xStart + (half - 1) * colWidth + 10)
  const chipBodyX = xStart - 10;
  const chipBodyWidth = (half - 1) * colWidth + 20;
  const chipBodyHeight = 28; // Sits neatly in the channel between row f (yChannel-22) and row e (yChannel+22)
  const chipBodyY = yChannel - chipBodyHeight / 2; // 220 - 14 = 206

  const yHoleF = yChannel - 22; // 198 (Row f hole center)
  const yHoleE = yChannel + 22; // 242 (Row e hole center)

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
      {/* Selection / Highlight Outline */}
      {isSelected && (
        <rect
          x={chipBodyX - 4}
          y={yHoleF - 6}
          width={chipBodyWidth + 8}
          height={(yHoleE - yHoleF) + 12}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          rx="6"
          strokeDasharray="4 2"
        />
      )}

      {/* Silver Metallic Pin Leads - EXACTLY fitted into breadboard hole boxes */}
      {Array.from({ length: half }).map((_, i) => {
        // Each pin column is at xStart + i * colWidth
        const pinX = xStart + i * colWidth;
        return (
          <g key={i}>
            {/* Upper Pin Lead (Row f) - Enters squarely into the hole at (pinX, yHoleF) */}
            <rect
              x={pinX - 1.6}
              y={yHoleF}
              width="3.2"
              height={chipBodyY - yHoleF + 1}
              fill="#94a3b8"
              stroke="#475569"
              strokeWidth="0.6"
            />
            {/* Upper Pin Tip inside hole box (5.6x5.6) */}
            <rect
              x={pinX - 2.2}
              y={yHoleF - 2.2}
              width="4.4"
              height="4.4"
              rx="0.8"
              fill="#cbd5e1"
              stroke="#334155"
              strokeWidth="0.7"
            />

            {/* Lower Pin Lead (Row e) - Enters squarely into the hole at (pinX, yHoleE) */}
            <rect
              x={pinX - 1.6}
              y={chipBodyY + chipBodyHeight - 1}
              width="3.2"
              height={yHoleE - (chipBodyY + chipBodyHeight) + 1}
              fill="#94a3b8"
              stroke="#475569"
              strokeWidth="0.6"
            />
            {/* Lower Pin Tip inside hole box (5.6x5.6) */}
            <rect
              x={pinX - 2.2}
              y={yHoleE - 2.2}
              width="4.4"
              height="4.4"
              rx="0.8"
              fill="#cbd5e1"
              stroke="#334155"
              strokeWidth="0.7"
            />
          </g>
        );
      })}

      {/* Main IC Chip Body (Matte black DIP plastic package) */}
      <rect
        x={chipBodyX}
        y={chipBodyY}
        width={chipBodyWidth}
        height={chipBodyHeight}
        fill="#1e222d"
        stroke="#0f172a"
        strokeWidth="1.5"
        rx="3.5"
        className="filter drop-shadow-md"
      />

      {/* Pin 1 Notch (left edge semicircular indentation) */}
      <path
        d={`M ${chipBodyX} ${yChannel - 5} A 5 5 0 0 1 ${chipBodyX} ${yChannel + 5} Z`}
        fill="#0f172a"
      />

      {/* Pin 1 Dot Marker near Pin 1 on lower left */}
      <circle
        cx={xStart}
        cy={yChannel + 7}
        r="1.8"
        fill="#94a3b8"
      />

      {/* Chip Type Label (e.g. "7408", "7486", "7483") */}
      <text
        x={chipBodyX + chipBodyWidth / 2}
        y={yChannel + 3}
        fill="#f8fafc"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        {ic.type}
      </text>

      {/* Subtle TTL Sublabel */}
      <text
        x={chipBodyX + chipBodyWidth / 2}
        y={yChannel - 6}
        fill="#64748b"
        fontSize="6.5"
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        TTL 74XX
      </text>

      {/* Unpowered Red Warning Badge */}
      {!isPowered && (
        <g transform={`translate(${chipBodyX + chipBodyWidth - 12}, ${chipBodyY - 6})`}>
          <rect
            x="-2"
            y="-2"
            width="16"
            height="13"
            rx="3"
            fill="#ef4444"
            className="animate-pulse"
          />
          <text
            x="6"
            y="8"
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
