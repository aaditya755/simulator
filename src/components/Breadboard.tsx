/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { PlacedIc, PlacedLed, PlacedResistor, Wire, WireColor } from '../types';
import { IC_CATALOG } from '../engine/ics';
import { getBaseNodeForHole, getIcHoleForPin } from '../engine/netlist';
import { SimulationResult } from '../engine/simulate';
import { IcShape } from './IcShape';
import { LedShape } from './LedShape';
import { WireShape } from './WireShape';

interface BreadboardProps {
  ics: PlacedIc[];
  wires: Wire[];
  leds: PlacedLed[];
  resistors: PlacedResistor[];
  activeTool: {
    type: 'wire' | 'ic' | 'led' | 'resistor' | 'pointer' | 'delete';
    wireColor?: WireColor;
    icType?: string;
  };
  wireStartHoleId: string | null;
  onSetWireStartHoleId: (holeId: string | null) => void;
  onAddWire: (from: string, to: string, color?: WireColor) => void;
  onPlaceIc: (type: string, startCol: number) => boolean;
  onPlaceLed: (anodeHoleId: string, cathodeHoleId: string) => void;
  onDeleteElement: (type: 'ic' | 'wire' | 'led' | 'resistor', id: string) => void;
  onFlipWireRailEnd: (wireId: string, endpoint: 'from' | 'to') => void;
  selectedElement: { type: 'ic' | 'wire' | 'led' | 'resistor'; id: string } | null;
  onSelectElement: (el: { type: 'ic' | 'wire' | 'led' | 'resistor'; id: string } | null) => void;
  simResult: SimulationResult;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
}

export const Breadboard: React.FC<BreadboardProps> = ({
  ics,
  wires,
  leds,
  resistors,
  activeTool,
  wireStartHoleId,
  onSetWireStartHoleId,
  onAddWire,
  onPlaceIc,
  onPlaceLed,
  onDeleteElement,
  onFlipWireRailEnd,
  selectedElement,
  onSelectElement,
  simResult,
  zoom,
  pan,
  onPanChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHoleId, setHoveredHoleId] = useState<string | null>(null);
  const [ledStartHoleId, setLedStartHoleId] = useState<string | null>(null);

  // Pan interaction
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // IC Pin hover tooltip
  const [hoveredPinInfo, setHoveredPinInfo] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Layout constants
  const NUM_COLS = 30;
  const COL_WIDTH = 28;
  const MARGIN_LEFT = 64;
  const MARGIN_RIGHT = 64;
  const BOARD_WIDTH = MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + MARGIN_RIGHT; // ~940px
  const BOARD_HEIGHT = 440;

  // Y-coordinates of rows
  const Y_RAIL_TOP_PLUS = 40;
  const Y_RAIL_TOP_MINUS = 66;

  const Y_ROWS: Record<string, number> = {
    j: 110,
    i: 132,
    h: 154,
    g: 176,
    f: 198,
    // Divider channel: center ~220
    e: 242,
    d: 264,
    c: 286,
    b: 308,
    a: 330,
  };

  const Y_DIVIDER_CHANNEL = 220;
  const Y_RAIL_BOTTOM_MINUS = 374;
  const Y_RAIL_BOTTOM_PLUS = 400;

  // Helper to get (x, y) for any hole ID
  const getHoleCoord = useCallback((holeId: string): { x: number; y: number } => {
    // Virtual panel sockets
    if (holeId === 'socket-clk1') return { x: MARGIN_LEFT + 2 * COL_WIDTH, y: 8 };
    if (holeId === 'socket-clk2') return { x: MARGIN_LEFT + 6 * COL_WIDTH, y: 8 };
    if (holeId === 'socket-vcc') return { x: MARGIN_LEFT + 18 * COL_WIDTH, y: 8 };
    if (holeId === 'socket-gnd') return { x: MARGIN_LEFT + 22 * COL_WIDTH, y: 8 };

    // Rails
    if (holeId.startsWith('railTop+')) {
      const col = parseInt(holeId.split('_')[1], 10);
      return { x: MARGIN_LEFT + (col - 1) * COL_WIDTH, y: Y_RAIL_TOP_PLUS };
    }
    if (holeId.startsWith('railTop-')) {
      const col = parseInt(holeId.split('_')[1], 10);
      return { x: MARGIN_LEFT + (col - 1) * COL_WIDTH, y: Y_RAIL_TOP_MINUS };
    }
    if (holeId.startsWith('railBottom-')) {
      const col = parseInt(holeId.split('_')[1], 10);
      return { x: MARGIN_LEFT + (col - 1) * COL_WIDTH, y: Y_RAIL_BOTTOM_MINUS };
    }
    if (holeId.startsWith('railBottom+')) {
      const col = parseInt(holeId.split('_')[1], 10);
      return { x: MARGIN_LEFT + (col - 1) * COL_WIDTH, y: Y_RAIL_BOTTOM_PLUS };
    }

    // Terminal strips (e.g. 'e_12', 'f_5')
    const parts = holeId.split('_');
    if (parts.length === 2) {
      const row = parts[0];
      const col = parseInt(parts[1], 10);
      const y = Y_ROWS[row] ?? 220;
      return { x: MARGIN_LEFT + (col - 1) * COL_WIDTH, y };
    }

    return { x: 0, y: 0 };
  }, [MARGIN_LEFT, COL_WIDTH, Y_RAIL_TOP_PLUS, Y_RAIL_TOP_MINUS, Y_RAIL_BOTTOM_MINUS, Y_RAIL_BOTTOM_PLUS, Y_ROWS]);

  // Compute connected node of hovered hole for visual highlighting
  const hoveredNode = useMemo(() => {
    return hoveredHoleId ? getBaseNodeForHole(hoveredHoleId) : null;
  }, [hoveredHoleId]);

  // Handle Hole Click
  const handleHoleClick = (holeId: string) => {
    if (activeTool.type === 'wire') {
      if (!wireStartHoleId) {
        onSetWireStartHoleId(holeId);
      } else {
        if (wireStartHoleId !== holeId) {
          onAddWire(wireStartHoleId, holeId, activeTool.wireColor);
        }
        onSetWireStartHoleId(null);
      }
      return;
    }

    if (activeTool.type === 'ic' && activeTool.icType) {
      // Find column from holeId
      const parts = holeId.split('_');
      let col = 1;
      if (parts.length === 2) {
        col = parseInt(parts[1], 10);
      } else if (holeId.includes('_')) {
        col = parseInt(holeId.split('_')[1], 10);
      }
      onPlaceIc(activeTool.icType, col);
      return;
    }

    if (activeTool.type === 'led') {
      if (!ledStartHoleId) {
        setLedStartHoleId(holeId);
      } else {
        if (ledStartHoleId !== holeId) {
          onPlaceLed(ledStartHoleId, holeId);
        }
        setLedStartHoleId(null);
      }
      return;
    }

    // Default wire mode if no tool selected
    if (!wireStartHoleId) {
      onSetWireStartHoleId(holeId);
    } else {
      if (wireStartHoleId !== holeId) {
        onAddWire(wireStartHoleId, holeId, activeTool.wireColor || 'green');
      }
      onSetWireStartHoleId(null);
    }
  };

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onPanChange({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Hovering over an IC pin to show pin name
  const handlePinMouseEnter = (ic: PlacedIc, pinNum: number, x: number, y: number) => {
    const def = IC_CATALOG[ic.type];
    if (!def) return;
    const pin = def.pins.find(p => p.pinNumber === pinNum);
    if (!pin) return;

    let role = pin.name;
    if (pin.isVcc) role += ' (+5V VCC)';
    else if (pin.isGnd) role += ' (0V GND)';
    else if (pin.isClock) role += ' (Clock Input)';
    else if (pin.isInput) role += ' (Input)';
    else if (pin.isOutput) role += ' (Output)';

    setHoveredPinInfo({
      text: `Pin ${pinNum}: ${role}`,
      x,
      y: y - 10,
    });
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#eef1f6] flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Wiring In-Progress Banner */}
      {wireStartHoleId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span>Click target hole or socket to complete wire</span>
          <button
            onClick={() => onSetWireStartHoleId(null)}
            className="bg-blue-800 hover:bg-blue-900 px-1.5 py-0.5 rounded text-[10px]"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* LED Placement In-Progress Banner */}
      {ledStartHoleId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span>Click second hole for LED cathode (GND leg)</span>
          <button
            onClick={() => setLedStartHoleId(null)}
            className="bg-rose-800 hover:bg-rose-900 px-1.5 py-0.5 rounded text-[10px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* SVG Breadboard Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="w-full h-full max-h-[580px] cursor-crosshair filter drop-shadow-xl"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
        onClick={() => onSelectElement(null)}
      >
        {/* ========================================================
            BREADBOARD BODY (Realistic Off-White Plastic with Bevels)
            ======================================================== */}
        <rect
          x="12"
          y="16"
          width={BOARD_WIDTH - 24}
          height={BOARD_HEIGHT - 32}
          rx="12"
          fill="#f4f1e8"
          stroke="#dcd6c8"
          strokeWidth="3"
        />
        {/* Inner Border Inset */}
        <rect
          x="18"
          y="22"
          width={BOARD_WIDTH - 36}
          height={BOARD_HEIGHT - 44}
          rx="8"
          fill="none"
          stroke="#eae4d4"
          strokeWidth="1.5"
        />

        {/* ========================================================
            TOP POWER RAILS: Red (+) and Blue (-) Lines
            ======================================================== */}
        {/* Red + Rail Guide Line */}
        <line
          x1={MARGIN_LEFT - 12}
          y1={Y_RAIL_TOP_PLUS - 12}
          x2={MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + 12}
          y2={Y_RAIL_TOP_PLUS - 12}
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x={MARGIN_LEFT - 24}
          y={Y_RAIL_TOP_PLUS + 4}
          fill="#ef4444"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          +
        </text>

        {/* Blue - Rail Guide Line */}
        <line
          x1={MARGIN_LEFT - 12}
          y1={Y_RAIL_TOP_MINUS + 12}
          x2={MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + 12}
          y2={Y_RAIL_TOP_MINUS + 12}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x={MARGIN_LEFT - 24}
          y={Y_RAIL_TOP_MINUS + 4}
          fill="#3b82f6"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          −
        </text>

        {/* ========================================================
            BOTTOM POWER RAILS: Blue (-) and Red (+) Lines
            ======================================================== */}
        {/* Blue - Rail Guide Line */}
        <line
          x1={MARGIN_LEFT - 12}
          y1={Y_RAIL_BOTTOM_MINUS - 12}
          x2={MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + 12}
          y2={Y_RAIL_BOTTOM_MINUS - 12}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x={MARGIN_LEFT - 24}
          y={Y_RAIL_BOTTOM_MINUS + 4}
          fill="#3b82f6"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          −
        </text>

        {/* Red + Rail Guide Line */}
        <line
          x1={MARGIN_LEFT - 12}
          y1={Y_RAIL_BOTTOM_PLUS + 12}
          x2={MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + 12}
          y2={Y_RAIL_BOTTOM_PLUS + 12}
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x={MARGIN_LEFT - 24}
          y={Y_RAIL_BOTTOM_PLUS + 4}
          fill="#ef4444"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          +
        </text>

        {/* ========================================================
            CENTER DIVIDER CHANNEL
            ======================================================== */}
        <rect
          x={MARGIN_LEFT - 20}
          y={Y_DIVIDER_CHANNEL - 8}
          width={(NUM_COLS - 1) * COL_WIDTH + 40}
          height="16"
          fill="#e4ded0"
          stroke="#d2cbbe"
          strokeWidth="1"
          rx="2"
        />

        {/* ========================================================
            COLUMN NUMBERS (Every 5 columns: 1, 5, 10, 15, 20, 25, 30)
            ======================================================== */}
        {Array.from({ length: NUM_COLS }).map((_, i) => {
          const colNum = i + 1;
          const x = MARGIN_LEFT + i * COL_WIDTH;
          const isMarked = colNum === 1 || colNum % 5 === 0;
          return isMarked ? (
            <g key={colNum}>
              {/* Top column marker */}
              <text
                x={x}
                y="94"
                fill="#8c8273"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                textAnchor="middle"
              >
                {colNum}
              </text>
              {/* Bottom column marker */}
              <text
                x={x}
                y="350"
                fill="#8c8273"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                textAnchor="middle"
              >
                {colNum}
              </text>
            </g>
          ) : null;
        })}

        {/* ========================================================
            ROW LETTERS (a..j) along left & right margins
            ======================================================== */}
        {Object.entries(Y_ROWS).map(([row, y]) => (
          <g key={row}>
            {/* Left label */}
            <text
              x={MARGIN_LEFT - 14}
              y={y + 3}
              fill="#8c8273"
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {row}
            </text>
            {/* Right label */}
            <text
              x={MARGIN_LEFT + (NUM_COLS - 1) * COL_WIDTH + 14}
              y={y + 3}
              fill="#8c8273"
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {row}
            </text>
          </g>
        ))}

        {/* ========================================================
            HOLE GRIDS (Rails and Terminal Strips)
            ======================================================== */}
        {Array.from({ length: NUM_COLS }).map((_, i) => {
          const col = i + 1;
          const x = MARGIN_LEFT + i * COL_WIDTH;

          const renderHole = (holeId: string, yPos: number, isRail: boolean = false) => {
            const isHovered = hoveredHoleId === holeId;
            const node = getBaseNodeForHole(holeId);
            const isGroupHighlighted = hoveredNode && hoveredNode === node;
            const isStartHole = wireStartHoleId === holeId || ledStartHoleId === holeId;

            return (
              <g
                key={holeId}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredHoleId(holeId)}
                onMouseLeave={() => setHoveredHoleId(null)}
                onClick={e => {
                  e.stopPropagation();
                  handleHoleClick(holeId);
                }}
              >
                {/* Connected Strip Highlight */}
                {isGroupHighlighted && (
                  <rect
                    x={x - 8}
                    y={yPos - 8}
                    width="16"
                    height="16"
                    rx="3"
                    fill="#60a5fa"
                    fillOpacity="0.25"
                  />
                )}

                {/* Outer metallic socket contact */}
                <rect
                  x={x - 4.5}
                  y={yPos - 4.5}
                  width="9"
                  height="9"
                  rx="1.5"
                  fill="#c8c2b5"
                  stroke="#a9a293"
                  strokeWidth="0.6"
                />

                {/* Inner spring contact hole (black center) */}
                <rect
                  x={x - 2.8}
                  y={yPos - 2.8}
                  width="5.6"
                  height="5.6"
                  rx="0.8"
                  fill={isStartHole ? '#3b82f6' : '#26221c'}
                />

                {/* Hover indicator ring */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={yPos}
                    r="6.5"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          };

          return (
            <g key={col}>
              {/* Top Rails */}
              {renderHole(`railTop+_${col}`, Y_RAIL_TOP_PLUS, true)}
              {renderHole(`railTop-_${col}`, Y_RAIL_TOP_MINUS, true)}

              {/* Upper Terminal Strip (rows j, i, h, g, f) */}
              {renderHole(`j_${col}`, Y_ROWS['j'])}
              {renderHole(`i_${col}`, Y_ROWS['i'])}
              {renderHole(`h_${col}`, Y_ROWS['h'])}
              {renderHole(`g_${col}`, Y_ROWS['g'])}
              {renderHole(`f_${col}`, Y_ROWS['f'])}

              {/* Lower Terminal Strip (rows e, d, c, b, a) */}
              {renderHole(`e_${col}`, Y_ROWS['e'])}
              {renderHole(`d_${col}`, Y_ROWS['d'])}
              {renderHole(`c_${col}`, Y_ROWS['c'])}
              {renderHole(`b_${col}`, Y_ROWS['b'])}
              {renderHole(`a_${col}`, Y_ROWS['a'])}

              {/* Bottom Rails */}
              {renderHole(`railBottom-_${col}`, Y_RAIL_BOTTOM_MINUS, true)}
              {renderHole(`railBottom+_${col}`, Y_RAIL_BOTTOM_PLUS, true)}
            </g>
          );
        })}

        {/* ========================================================
            PLACED ICs
            ======================================================== */}
        {ics.map(ic => {
          const xStart = MARGIN_LEFT + (ic.startCol - 1) * COL_WIDTH;
          const isPowered = simResult.icPowerStatus.get(ic.id) ?? false;
          const isSelected = selectedElement?.type === 'ic' && selectedElement.id === ic.id;

          const def = IC_CATALOG[ic.type];
          const half = (def ? def.pinCount : 14) / 2;

          return (
            <g key={ic.id}>
              <IcShape
                ic={ic}
                xStart={xStart}
                yChannel={Y_DIVIDER_CHANNEL}
                colWidth={COL_WIDTH}
                isPowered={isPowered}
                isSelected={isSelected}
                onSelect={() => onSelectElement({ type: 'ic', id: ic.id })}
                onDelete={() => onDeleteElement('ic', ic.id)}
              />

              {/* Interactive invisible pins for hover tooltips */}
              {Array.from({ length: half }).map((_, idx) => {
                const lowerPinNum = idx + 1;
                const upperPinNum = def ? def.pinCount - idx : 14 - idx;
                const pinX = xStart + idx * COL_WIDTH + COL_WIDTH / 2;

                return (
                  <g key={idx}>
                    {/* Lower pin (row e) */}
                    <circle
                      cx={pinX}
                      cy={Y_ROWS['e']}
                      r="6"
                      fill="transparent"
                      className="cursor-help"
                      onMouseEnter={() =>
                        handlePinMouseEnter(ic, lowerPinNum, pinX, Y_ROWS['e'])
                      }
                      onMouseLeave={() => setHoveredPinInfo(null)}
                    />
                    {/* Upper pin (row f) */}
                    <circle
                      cx={pinX}
                      cy={Y_ROWS['f']}
                      r="6"
                      fill="transparent"
                      className="cursor-help"
                      onMouseEnter={() =>
                        handlePinMouseEnter(ic, upperPinNum, pinX, Y_ROWS['f'])
                      }
                      onMouseLeave={() => setHoveredPinInfo(null)}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* ========================================================
            PLACED LEDs
            ======================================================== */}
        {leds.map(led => {
          const anodePos = getHoleCoord(led.anodeHoleId);
          const cathodePos = getHoleCoord(led.cathodeHoleId);
          const isOn = simResult.ledStates.get(led.id) ?? false;
          const isSelected = selectedElement?.type === 'led' && selectedElement.id === led.id;

          return (
            <LedShape
              key={led.id}
              led={led}
              anodePos={anodePos}
              cathodePos={cathodePos}
              isOn={isOn}
              isSelected={isSelected}
              onSelect={() => onSelectElement({ type: 'led', id: led.id })}
              onDelete={() => onDeleteElement('led', led.id)}
            />
          );
        })}

        {/* ========================================================
            PLACED WIRES
            ======================================================== */}
        {wires.map(wire => {
          const fromPos = getHoleCoord(wire.fromHoleId);
          const toPos = getHoleCoord(wire.toHoleId);
          const isSelected = selectedElement?.type === 'wire' && selectedElement.id === wire.id;
          const hasConflict =
            simResult.conflictHoles.has(wire.fromHoleId) ||
            simResult.conflictHoles.has(wire.toHoleId);

          return (
            <WireShape
              key={wire.id}
              wire={wire}
              fromPos={fromPos}
              toPos={toPos}
              isSelected={isSelected}
              hasConflict={hasConflict}
              onSelect={() => onSelectElement({ type: 'wire', id: wire.id })}
              onDelete={() => onDeleteElement('wire', wire.id)}
              onFlipRailEnd={endpoint => onFlipWireRailEnd(wire.id, endpoint)}
            />
          );
        })}

        {/* ========================================================
            GHOST PREVIEW (When IC tool active and hovering)
            ======================================================== */}
        {activeTool.type === 'ic' && activeTool.icType && hoveredHoleId && (
          (() => {
            const parts = hoveredHoleId.split('_');
            const col = parts.length === 2 ? parseInt(parts[1], 10) : 1;
            const def = IC_CATALOG[activeTool.icType];
            const half = (def ? def.pinCount : 14) / 2;
            const endCol = col + half - 1;
            const isValid = col >= 1 && endCol <= NUM_COLS;
            const x = MARGIN_LEFT + (col - 1) * COL_WIDTH;

            return (
              <g opacity="0.6">
                <rect
                  x={x}
                  y={Y_DIVIDER_CHANNEL - 22}
                  width={half * COL_WIDTH}
                  height="44"
                  rx="4"
                  fill={isValid ? '#22c55e' : '#ef4444'}
                  stroke={isValid ? '#15803d' : '#b91c1c'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <text
                  x={x + (half * COL_WIDTH) / 2}
                  y={Y_DIVIDER_CHANNEL + 4}
                  fill="white"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {activeTool.icType}
                </text>
              </g>
            );
          })()
        )}

        {/* ========================================================
            PIN TOOLTIP OVERLAY
            ======================================================== */}
        {hoveredPinInfo && (
          <g transform={`translate(${hoveredPinInfo.x}, ${hoveredPinInfo.y})`} className="pointer-events-none">
            <rect
              x={-hoveredPinInfo.text.length * 3.5 - 6}
              y="-18"
              width={hoveredPinInfo.text.length * 7 + 12}
              height="20"
              rx="4"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1"
              className="filter drop-shadow-md"
            />
            <text
              x="0"
              y="-4"
              fill="#f8fafc"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {hoveredPinInfo.text}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
