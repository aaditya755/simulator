/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { EXPERIMENTS } from '../data/experiments';
import { Save, Download, Upload, Cpu, Sparkles, BookOpen } from 'lucide-react';

interface TitleBarProps {
  currentExpId: string;
  onSelectExperiment: (id: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onLoadPreset?: () => void;
  hasPreset?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentExpId,
  onSelectExperiment,
  onSave,
  onExport,
  onImport,
  onLoadPreset,
  hasPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-[#1f2a44] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shadow-md select-none shrink-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            Digital Electronics Lab Simulator
            <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono font-normal">
              TTL 74xx
            </span>
          </h1>
          <p className="text-[11px] text-slate-300">
            K.K. Wagh • Course 2301207 Digital Electronics Lab
          </p>
        </div>
      </div>

      {/* Middle: Experiment Selector */}
      <div className="flex items-center gap-2 max-w-xl w-full mx-4">
        <label className="text-xs text-slate-300 font-medium whitespace-nowrap">
          Experiment:
        </label>
        <select
          value={currentExpId}
          onChange={e => onSelectExperiment(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 w-full truncate"
        >
          {EXPERIMENTS.map(exp => (
            <option key={exp.id} value={exp.id}>
              {exp.number === 'Free' ? 'Free Build (no checks)' : `Exp ${exp.number}: ${exp.title}`}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {hasPreset && onLoadPreset && (
          <button
            onClick={onLoadPreset}
            title="Load the verified solution for this experiment to inspect or verify"
            className="flex items-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 text-emerald-100 hover:text-white px-2.5 py-1.5 rounded text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Load Sample Wiring</span>
          </button>
        )}

        <button
          onClick={onSave}
          title="Save circuit to local browser storage"
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-500/40 text-slate-100 px-3 py-1.5 rounded text-xs font-medium transition"
        >
          <Save className="w-3.5 h-3.5 text-blue-300" />
          <span>Save</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-2.5 py-1.5 rounded text-xs transition"
          >
            <span>Options</span>
            <span className="text-[10px]">▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onExport();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" /> Export JSON
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
