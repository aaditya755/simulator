/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckResult, Experiment, PlacedIc, PlacedLed, Wire } from '../types';
import { TruthTable } from './TruthTable';
import { PinGuide } from './PinGuide';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, BookOpen, Layers } from 'lucide-react';

interface ExperimentPanelProps {
  experiment: Experiment;
  ics: PlacedIc[];
  wires: Wire[];
  leds: PlacedLed[];
  checkResult: CheckResult | null;
  onRunCheck: () => void;
  hint: { status: 'info' | 'warning' | 'error' | 'success'; message: string };
  currentInputs?: Record<string, number>;
  currentOutputs?: Record<string, number>;
  onLoadPreset?: () => void;
}

export const ExperimentPanel: React.FC<ExperimentPanelProps> = ({
  experiment,
  ics,
  wires,
  leds,
  checkResult,
  onRunCheck,
  hint,
  currentInputs = {},
  currentOutputs = {},
  onLoadPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'pinout'>('guide');

  const handleCheckClick = () => {
    onRunCheck();
    if (checkResult?.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Unique IC types needed by this experiment
  const neededIcTypes = Array.from(
    new Set(
      experiment.partsNeeded
        .map(p => {
          const match = p.name.match(/74\d+/);
          return match ? match[0] : null;
        })
        .filter((t): t is string => t !== null)
    )
  );

  return (
    <aside className="w-80 bg-white border-l border-[#c9d0dc] flex flex-col h-full select-none shrink-0 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {experiment.number === 'Free' ? 'Sandbox' : `Experiment ${experiment.number}`}
          </div>
          <h2 className="text-xs font-bold text-slate-900 leading-tight">
            {experiment.title}
          </h2>
        </div>

        {/* Tab Switcher */}
        {neededIcTypes.length > 0 && (
          <div className="flex bg-slate-200/80 p-0.5 rounded text-[10px] font-semibold">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-2 py-0.5 rounded transition ${
                activeTab === 'guide' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Lab
            </button>
            <button
              onClick={() => setActiveTab('pinout')}
              className={`px-2 py-0.5 rounded transition ${
                activeTab === 'pinout' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pin Guide
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {activeTab === 'pinout' && neededIcTypes.length > 0 ? (
          <div>
            <PinGuide icTypes={neededIcTypes} />
          </div>
        ) : (
          <>
            {/* Aim */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <span className="font-bold text-slate-800 block mb-1">Aim:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{experiment.aim}</p>
            </div>

            {/* Quick Action: Load Sample Circuit */}
            {experiment.preset && onLoadPreset && (
              <button
                onClick={onLoadPreset}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Load Sample Circuit for this Assignment</span>
              </button>
            )}

            {/* Parts You Need */}
            {experiment.partsNeeded.length > 0 && (
              <div>
                <span className="font-bold text-slate-800 block mb-1.5 text-[11px]">
                  Parts You Need:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {experiment.partsNeeded.map(p => (
                    <span
                      key={p.name}
                      className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    >
                      <span className="font-bold">{p.count}x</span> {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Steps (3-6 plain-language steps) */}
            <div>
              <span className="font-bold text-slate-800 block mb-1.5 text-[11px]">
                Wiring Steps:
              </span>
              <ol className="space-y-1.5 pl-4 list-decimal text-slate-600 text-[11px] leading-snug">
                {experiment.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Live Truth Table / Sequence */}
            {experiment.truthTable && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Expected Truth Table:
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Live Input Row Highlighted
                  </span>
                </div>
                <TruthTable
                  rows={experiment.truthTable}
                  inputNames={experiment.inputNames}
                  outputNames={experiment.outputNames}
                  currentInputs={currentInputs}
                  currentOutputs={currentOutputs}
                  failedRowIndex={checkResult?.failedRowIndex}
                />
              </div>
            )}

            {/* Sequential Sequence Table if Sequential Counter */}
            {experiment.isSequential && experiment.expectedSequence && (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                <div className="bg-slate-100 px-2 py-1 border-b border-slate-200 font-semibold text-slate-700 text-[11px]">
                  Expected Clock Sequence:
                </div>
                <table className="w-full text-center text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-1 px-1 border-r">Clock #</th>
                      {experiment.outputNames.map(o => (
                        <th key={o} className="py-1 px-1 border-r">
                          {o}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {experiment.expectedSequence.map(seq => (
                      <tr key={seq.step} className="border-b border-slate-100 font-mono">
                        <td className="py-0.5 px-1 border-r text-slate-400">{seq.clock}</td>
                        {experiment.outputNames.map(o => (
                          <td key={o} className="py-0.5 px-1 border-r">
                            {seq.outputs[o] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Area: Plain-Language Hint + Check My Circuit */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 shrink-0">
        {/* Dynamic Circuit Hint Box */}
        <div
          className={`p-2 rounded-lg border text-[11px] leading-tight flex items-start gap-2 ${
            hint.status === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : hint.status === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : hint.status === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {hint.status === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : hint.status === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : hint.status === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          )}
          <span>{hint.message}</span>
        </div>

        {/* Verification Check Result Banner if verified */}
        {checkResult && (
          <div
            className={`p-2.5 rounded-lg border text-xs ${
              checkResult.passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              {checkResult.passed ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{checkResult.headline}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{checkResult.headline}</span>
                </>
              )}
            </div>
            {checkResult.details && (
              <p className="text-[11px] mt-0.5 leading-normal opacity-90">
                {checkResult.details}
              </p>
            )}
            {checkResult.hint && (
              <p className="text-[10px] mt-1 font-medium bg-white/70 p-1 rounded border border-rose-200">
                💡 {checkResult.hint}
              </p>
            )}
          </div>
        )}

        {/* "Check My Circuit" Action Button */}
        {experiment.checkerType !== 'free' ? (
          <button
            onClick={handleCheckClick}
            className="w-full bg-[#188038] hover:bg-[#136c2e] active:scale-[0.98] text-white py-2 px-3 rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check My Circuit</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-400 text-center py-1 italic">
            Free Build Mode (Validation Disabled)
          </div>
        )}
      </div>
    </aside>
  );
};
