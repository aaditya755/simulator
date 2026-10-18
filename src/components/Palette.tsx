/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Experiment, WireColor } from '../types';
import { Star, Zap, CircleDot, Activity, Minus } from 'lucide-react';

interface PaletteProps {
  currentExperiment: Experiment;
  activeTool: {
    type: 'wire' | 'ic' | 'led' | 'resistor' | 'pointer' | 'delete';
    wireColor?: WireColor;
    icType?: string;
  };
  onSelectTool: (tool: {
    type: 'wire' | 'ic' | 'led' | 'resistor' | 'pointer' | 'delete';
    wireColor?: WireColor;
    icType?: string;
  }) => void;
}

export const Palette: React.FC<PaletteProps> = ({
  currentExperiment,
  activeTool,
  onSelectTool,
}) => {
  // Check if an item is needed by current experiment
  const isNeeded = (name: string) => {
    return currentExperiment.partsNeeded.some(
      p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase())
    );
  };

  const wireColors: Array<{ color: WireColor; bg: string; label: string; border: string }> = [
    { color: 'red', bg: '#ef4444', label: 'VCC (+5V)', border: '#b91c1c' },
    { color: 'black', bg: '#1e293b', label: 'GND (0V)', border: '#0f172a' },
    { color: 'green', bg: '#22c55e', label: 'Signal Green', border: '#15803d' },
    { color: 'yellow', bg: '#eab308', label: 'Signal Yellow', border: '#a16207' },
    { color: 'blue', bg: '#3b82f6', label: 'Signal Blue', border: '#1d4ed8' },
  ];

  const logicGates = [
    { type: '7408', name: 'AND (7408)', desc: 'IC 7408 (4 AND gates)' },
    { type: '7432', name: 'OR (7432)', desc: 'IC 7432 (4 OR gates)' },
    { type: '7404', name: 'NOT (7404)', desc: 'IC 7404 (6 NOT inverters)' },
    { type: '7400', name: 'NAND (7400)', desc: 'IC 7400 (4 NAND gates)' },
    { type: '7402', name: 'NOR (7402)', desc: 'IC 7402 (4 NOR gates)' },
    { type: '7486', name: 'XOR (7486)', desc: 'IC 7486 (4 XOR gates)' },
  ];

  const complexIcs = [
    { type: '7483', name: '7483 Adder', desc: '4-bit binary adder' },
    { type: '7490', name: '7490 Counter', desc: 'Decade / BCD counter' },
    { type: '7476', name: '7476 JK FF', desc: 'Dual JK flip-flop' },
    { type: '74151', name: '74151 MUX', desc: '8-to-1 multiplexer' },
    { type: '74138', name: '74138 Decoder', desc: '3-to-8 line decoder' },
    { type: '7410', name: '7410 3-NAND', desc: 'Triple 3-input NAND' },
    { type: '7420', name: '7420 4-NAND', desc: 'Dual 4-input NAND' },
  ];

  const registers = [
    { type: '7495', name: '7495 Shift Reg', desc: '4-bit parallel/serial' },
    { type: '74194', name: '74194 Universal', desc: '4-bit bidirectional' },
    { type: '7474', name: '7474 D FF', desc: 'Dual D flip-flop' },
    { type: '74175', name: '74175 Quad D', desc: 'Quad D register' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#c9d0dc] flex flex-col h-full overflow-y-auto select-none shrink-0 shadow-sm">
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
          <span>Components Palette</span>
          <span className="text-[10px] text-slate-500 font-normal">TTL 74xx</span>
        </h2>
      </div>

      <div className="p-3 space-y-4 flex-1">
        {/* Wire Selection */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Wires</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {wireColors.map(wc => {
              const isSelected = activeTool.type === 'wire' && activeTool.wireColor === wc.color;
              return (
                <button
                  key={wc.color}
                  onClick={() => onSelectTool({ type: 'wire', wireColor: wc.color })}
                  title={`Wire ${wc.label}`}
                  className={`h-7 rounded flex items-center justify-center border-2 transition ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-105 shadow-sm' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: wc.bg, borderColor: wc.border }}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Click start hole/socket, then click end hole.
          </p>
        </div>

        {/* Output & Pass-through */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5 text-rose-500" />
            <span>Output & Passive</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* LED */}
            <button
              onClick={() => onSelectTool({ type: 'led' })}
              className={`p-2 rounded-lg border text-left flex flex-col transition relative ${
                activeTool.type === 'led'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-xs text-slate-800">LED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              </div>
              <span className="text-[10px] text-slate-500">Built-in resistor</span>
              {isNeeded('LED') && (
                <span title="Needed for this experiment" className="absolute top-1 right-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                </span>
              )}
            </button>

            {/* Resistor */}
            <button
              onClick={() => onSelectTool({ type: 'resistor' })}
              className={`p-2 rounded-lg border text-left flex flex-col transition ${
                activeTool.type === 'resistor'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-xs text-slate-800">Resistor</span>
                <Minus className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <span className="text-[10px] text-slate-500">Optional bridge</span>
            </button>
          </div>
        </div>

        {/* Logic Gates */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Logic Gates</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {logicGates.map(g => {
              const isSelected = activeTool.type === 'ic' && activeTool.icType === g.type;
              const needed = isNeeded(g.type);
              return (
                <button
                  key={g.type}
                  onClick={() => onSelectTool({ type: 'ic', icType: g.type })}
                  className={`p-1.5 rounded-md border text-left relative transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{g.name}</span>
                    {needed && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{g.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MSI ICs */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>ICs (MSI / Arithmetic)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {complexIcs.map(g => {
              const isSelected = activeTool.type === 'ic' && activeTool.icType === g.type;
              const needed = isNeeded(g.type);
              return (
                <button
                  key={g.type}
                  onClick={() => onSelectTool({ type: 'ic', icType: g.type })}
                  className={`p-1.5 rounded-md border text-left relative transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{g.name}</span>
                    {needed && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{g.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registers & Sequential */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Registers & Flip-Flops</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {registers.map(g => {
              const isSelected = activeTool.type === 'ic' && activeTool.icType === g.type;
              const needed = isNeeded(g.type);
              return (
                <button
                  key={g.type}
                  onClick={() => onSelectTool({ type: 'ic', icType: g.type })}
                  className={`p-1.5 rounded-md border text-left relative transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{g.name}</span>
                    {needed && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{g.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Palette Footer Tip */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        💡 <span className="font-medium">Tip:</span> Click a part, then click a hole on the breadboard. Press <kbd className="bg-slate-200 px-1 rounded text-[10px]">Esc</kbd> to cancel.
      </div>
    </aside>
  );
};
