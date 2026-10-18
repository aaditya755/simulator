/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SupplyPanelProps {
  onSocketClick: (socketId: string) => void;
  wireStartHoleId: string | null;
  vccConnected: boolean;
  gndConnected: boolean;
}

export const SupplyPanel: React.FC<SupplyPanelProps> = ({
  onSocketClick,
  wireStartHoleId,
  vccConnected,
  gndConnected,
}) => {
  return (
    <div className="bg-[#2b3347] border border-[#3f4a64] rounded-lg p-2.5 text-white shadow-md select-none w-64 shrink-0 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-700/60">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
          5V Regulated DC Supply
        </span>
        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          TTL Standard
        </span>
      </div>

      {/* 7-Segment Green Voltage Readout */}
      <div className="bg-[#0b1d12] border border-[#143d22] rounded px-3 py-1 my-1 flex items-center justify-between">
        <span className="text-[10px] text-[#1c6434] font-mono">OUTPUT</span>
        <span className="text-[#39ff6a] font-digital font-bold text-xl tracking-widest">
          +5.0 <span className="text-sm">V</span>
        </span>
      </div>

      {/* Sockets: VCC (+5V) and GND */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Red VCC Socket */}
        <button
          onClick={() => onSocketClick('socket-vcc')}
          title="Click to connect a wire from +5V VCC to a red (+) power rail"
          className={`flex items-center gap-1.5 p-1.5 rounded text-xs font-semibold border transition ${
            wireStartHoleId === 'socket-vcc'
              ? 'bg-red-700 border-red-400 text-white ring-2 ring-red-400'
              : 'bg-[#212838] hover:bg-slate-700 border-slate-600 text-slate-200'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-slate-900 shadow-inner flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">+</span>
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-red-400 leading-tight">VCC</div>
            <div className="text-[9px] text-slate-400">+5V DC</div>
          </div>
        </button>

        {/* Black GND Socket */}
        <button
          onClick={() => onSocketClick('socket-gnd')}
          title="Click to connect a wire from GND to a blue (-) ground rail"
          className={`flex items-center gap-1.5 p-1.5 rounded text-xs font-semibold border transition ${
            wireStartHoleId === 'socket-gnd'
              ? 'bg-slate-900 border-blue-400 text-white ring-2 ring-blue-400'
              : 'bg-[#212838] hover:bg-slate-700 border-slate-600 text-slate-200'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-black border-2 border-slate-700 shadow-inner flex items-center justify-center">
            <span className="text-[9px] font-bold text-slate-300 leading-none">−</span>
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-300 leading-tight">GND</div>
            <div className="text-[9px] text-slate-400">0V Ground</div>
          </div>
        </button>
      </div>

      <div className="text-[9px] text-slate-400 pt-1 text-center">
        {!vccConnected || !gndConnected ? (
          <span className="text-amber-300">⚠️ Wire VCC and GND to the rails</span>
        ) : (
          <span className="text-emerald-400">✓ Rails powered</span>
        )}
      </div>
    </div>
  );
};
