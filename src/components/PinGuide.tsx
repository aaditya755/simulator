/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IC_CATALOG } from '../engine/ics';

interface PinGuideProps {
  icTypes: string[];
}

export const PinGuide: React.FC<PinGuideProps> = ({ icTypes }) => {
  const [selectedType, setSelectedType] = useState<string>(icTypes[0] || '7408');
  const ic = IC_CATALOG[selectedType] || IC_CATALOG['7408'];

  if (!ic) return null;

  const half = ic.pinCount / 2;
  const lowerPins = ic.pins.filter(p => p.pinNumber <= half);
  const upperPins = ic.pins.filter(p => p.pinNumber > half).reverse();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-700">IC Pinout Guide:</span>
        {icTypes.length > 1 ? (
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-800"
          >
            {icTypes.map(t => (
              <option key={t} value={t}>
                IC {t}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono font-bold text-blue-700">IC {ic.name}</span>
        )}
      </div>

      <div className="text-slate-500 mb-2 italic">{ic.description}</div>

      {/* Visual IC representation */}
      <div className="bg-slate-900 text-white rounded-md p-3 relative font-mono text-[10px]">
        {/* Notch on left */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-4 border-2 border-slate-700 bg-slate-800 rounded-r-full" />

        {/* Upper Pins row (reversed: 14..8 or 16..9) */}
        <div className="flex justify-between pl-4 pr-1 mb-3">
          {upperPins.map(p => {
            const isVcc = p.pinNumber === ic.vccPin;
            const isGnd = p.pinNumber === ic.gndPin;
            return (
              <div key={p.pinNumber} className="flex flex-col items-center">
                <span
                  className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                    isVcc ? 'bg-red-500 text-white' : isGnd ? 'bg-blue-500 text-white' : 'text-slate-300'
                  }`}
                >
                  {p.name}
                </span>
                <span className="text-slate-400 mt-0.5">{p.pinNumber}</span>
              </div>
            );
          })}
        </div>

        {/* IC Body Center */}
        <div className="text-center font-bold tracking-widest text-slate-400 border-y border-slate-800 py-1 my-1">
          {ic.name}
        </div>

        {/* Lower Pins row (1..half) */}
        <div className="flex justify-between pl-4 pr-1 mt-3">
          {lowerPins.map(p => {
            const isVcc = p.pinNumber === ic.vccPin;
            const isGnd = p.pinNumber === ic.gndPin;
            return (
              <div key={p.pinNumber} className="flex flex-col items-center">
                <span className="text-slate-400 mb-0.5">{p.pinNumber}</span>
                <span
                  className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                    isVcc ? 'bg-red-500 text-white' : isGnd ? 'bg-blue-500 text-white' : 'text-slate-300'
                  }`}
                >
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Power notes */}
      <div className="mt-2 flex gap-4 text-[11px] font-medium text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          VCC (+5V): Pin {ic.vccPin}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          GND: Pin {ic.gndPin}
        </span>
      </div>
    </div>
  );
};
