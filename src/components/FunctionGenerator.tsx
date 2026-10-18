/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FunctionGeneratorProps {
  clk1Freq: number;
  setClk1Freq: (f: number) => void;
  clk2Freq: number;
  setClk2Freq: (f: number) => void;
  clk1State: 0 | 1;
  clk2State: 0 | 1;
  onPulseClk1: () => void;
  onPulseClk2: () => void;
  onSocketClick: (socketId: string) => void;
  wireStartHoleId: string | null;
}

export const FunctionGenerator: React.FC<FunctionGeneratorProps> = ({
  clk1Freq,
  setClk1Freq,
  clk2Freq,
  setClk2Freq,
  clk1State,
  clk2State,
  onPulseClk1,
  onPulseClk2,
  onSocketClick,
  wireStartHoleId,
}) => {
  return (
    <div className="bg-[#2b3347] border border-[#3f4a64] rounded-lg p-2.5 text-white shadow-md select-none flex-1">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-700/60">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
          Dual Clock Function Generator
        </span>
        <span className="text-[10px] text-slate-400 font-mono">0.5 - 5.0 Hz</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Clock 1 Block */}
        <div className="bg-[#212838] p-2 rounded border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-200">CLOCK 1</span>
            {/* Blinking indicator LED */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                  clk1State === 1
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-amber-950/60 border border-amber-900'
                }`}
              />
              <span className="text-[9px] font-mono text-slate-400">
                {clk1State === 1 ? 'HI' : 'LO'}
              </span>
            </div>
          </div>

          {/* 7-Segment Green Digital Readout */}
          <div className="bg-[#0b1d12] border border-[#143d22] rounded px-2 py-0.5 mb-2 flex items-center justify-between">
            <span className="text-[10px] text-[#1c6434] font-mono">FREQ</span>
            <span className="text-[#39ff6a] font-digital font-bold text-base tracking-widest">
              {clk1Freq.toFixed(1)} <span className="text-xs">Hz</span>
            </span>
          </div>

          {/* Frequency Slider */}
          <div className="mb-2">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={clk1Freq}
              onChange={e => setClk1Freq(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Controls: Socket + Pulse Button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
            {/* Round Socket to wire from */}
            <button
              onClick={() => onSocketClick('socket-clk1')}
              title="Click to connect a wire to CLOCK 1 OUT"
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border transition ${
                wireStartHoleId === 'socket-clk1'
                  ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900 shadow-inner" />
              <span>CLK 1 OUT</span>
            </button>

            {/* Manual Pulse */}
            <button
              onClick={onPulseClk1}
              title="Send a single manual high pulse"
              className="bg-slate-700 hover:bg-slate-600 active:bg-slate-800 border border-slate-500 text-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase transition"
            >
              Pulse
            </button>
          </div>
        </div>

        {/* Clock 2 Block */}
        <div className="bg-[#212838] p-2 rounded border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-200">CLOCK 2</span>
            {/* Blinking indicator LED */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                  clk2State === 1
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-amber-950/60 border border-amber-900'
                }`}
              />
              <span className="text-[9px] font-mono text-slate-400">
                {clk2State === 1 ? 'HI' : 'LO'}
              </span>
            </div>
          </div>

          {/* 7-Segment Green Digital Readout */}
          <div className="bg-[#0b1d12] border border-[#143d22] rounded px-2 py-0.5 mb-2 flex items-center justify-between">
            <span className="text-[10px] text-[#1c6434] font-mono">FREQ</span>
            <span className="text-[#39ff6a] font-digital font-bold text-base tracking-widest">
              {clk2Freq.toFixed(1)} <span className="text-xs">Hz</span>
            </span>
          </div>

          {/* Frequency Slider */}
          <div className="mb-2">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={clk2Freq}
              onChange={e => setClk2Freq(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Controls: Socket + Pulse Button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
            {/* Round Socket to wire from */}
            <button
              onClick={() => onSocketClick('socket-clk2')}
              title="Click to connect a wire to CLOCK 2 OUT"
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border transition ${
                wireStartHoleId === 'socket-clk2'
                  ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900 shadow-inner" />
              <span>CLK 2 OUT</span>
            </button>

            {/* Manual Pulse */}
            <button
              onClick={onPulseClk2}
              title="Send a single manual high pulse"
              className="bg-slate-700 hover:bg-slate-600 active:bg-slate-800 border border-slate-500 text-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase transition"
            >
              Pulse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
