/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Square, RotateCcw, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BottomBarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  selectedElement: { type: string; id: string } | null;
  onDeleteSelected: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  isRunning,
  onRun,
  onStop,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  selectedElement,
  onDeleteSelected,
}) => {
  return (
    <div className="bg-white border-t border-[#c9d0dc] px-4 py-2 flex items-center justify-between select-none shadow-sm shrink-0">
      {/* Left: Clock / Simulation Execution Controls */}
      <div className="flex items-center gap-2">
        {/* Run Button (green #188038) */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white shadow-sm transition ${
            isRunning
              ? 'bg-emerald-800 opacity-60 cursor-not-allowed'
              : 'bg-[#188038] hover:bg-[#136c2e] active:scale-95'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Clocks</span>
        </button>

        {/* Stop Button (red #d93025) */}
        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white shadow-sm transition ${
            !isRunning
              ? 'bg-rose-800 opacity-60 cursor-not-allowed'
              : 'bg-[#d93025] hover:bg-[#b8241b] active:scale-95'
          }`}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>

        {/* Reset Button (orange #f29900) */}
        <button
          onClick={onReset}
          title="Reset flip-flops & counters to 0 and pause clocks"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#f29900] hover:bg-[#d88700] active:scale-95 shadow-sm transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Logic</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-300 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          title="Clear all components from the breadboard"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Board</span>
        </button>

        {/* Delete Selection if active */}
        {selectedElement && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 transition border border-rose-300 animate-pulse"
          >
            <span>Delete Selected {selectedElement.type.toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Middle: Student reminder */}
      <div className="hidden lg:flex items-center text-[11px] text-slate-500 font-medium">
        💡 No timing diagrams here. Watch the LEDs glow live on the breadboard!
      </div>

      {/* Right: Zoom & Pan controls */}
      <div className="flex items-center gap-1 text-slate-700">
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono w-12 text-center text-slate-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onResetZoom}
          title="Reset View to 100%"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 ml-1"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
