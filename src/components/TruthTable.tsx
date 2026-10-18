/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TruthTableRow } from '../types';

interface TruthTableProps {
  rows: TruthTableRow[];
  inputNames: string[];
  outputNames: string[];
  currentInputs?: Record<string, number>;
  currentOutputs?: Record<string, number>;
  failedRowIndex?: number;
}

export const TruthTable: React.FC<TruthTableProps> = ({
  rows,
  inputNames,
  outputNames,
  currentInputs = {},
  currentOutputs = {},
  failedRowIndex,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayRows = (!showAll && rows.length > 16) ? rows.slice(0, 16) : rows;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
      <div className="max-h-48 overflow-y-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 z-10">
              <th className="py-1 px-1.5 border-r border-slate-200 w-8">#</th>
              {inputNames.map(inName => (
                <th key={inName} className="py-1 px-1.5 border-r border-slate-200 bg-amber-50/70 text-amber-900">
                  {inName}
                </th>
              ))}
              {outputNames.map(outName => (
                <th key={outName} className="py-1 px-1.5 border-r border-slate-200 bg-emerald-50/70 text-emerald-900">
                  {outName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
            {displayRows.map((row, idx) => {
              // Check if this row matches the user's current inputs
              const isCurrent =
                Object.keys(currentInputs).length > 0 &&
                inputNames.every(name => currentInputs[name] === row.inputs[name]);

              const isFailed = failedRowIndex === idx;

              let rowClass = 'hover:bg-slate-50 border-b border-slate-100';
              if (isFailed) {
                rowClass = 'bg-rose-100 font-bold text-rose-900 border-b border-rose-300';
              } else if (isCurrent) {
                rowClass = 'bg-amber-100/90 font-bold text-slate-900 border-b border-amber-300';
              }

              return (
                <tr key={idx} className={rowClass}>
                  <td className="py-1 px-1 border-r border-slate-200 text-slate-400 text-[10px]">
                    {idx + 1}
                  </td>
                  {inputNames.map(inName => (
                    <td key={inName} className="py-1 px-1.5 border-r border-slate-200">
                      {row.inputs[inName] ?? '-'}
                    </td>
                  ))}
                  {outputNames.map(outName => (
                    <td key={outName} className="py-1 px-1.5 border-r border-slate-200">
                      {row.outputs[outName] ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 16 && (
        <div className="bg-slate-50 px-2 py-1 border-t border-slate-200 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            {showAll ? 'Show fewer rows' : `Show all ${rows.length} rows`}
          </button>
        </div>
      )}
    </div>
  );
};
