/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Mail,
  CheckCircle,
  Copy,
  ExternalLink,
  Cpu,
  Zap,
  Activity,
  Layers,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'help' | 'guide' | 'troubleshoot' | 'ics'>('help');
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const contactEmail = 'filessheet@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs select-none">
      <div
        className="bg-[#1e293b] border border-slate-700 text-slate-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Help & Support Center
              </h2>
              <p className="text-xs text-slate-400">
                Digital Electronics Lab Simulator • K.K. Wagh TTL 74xx Lab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 bg-slate-800/30 px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            Help & Contact Support
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            How to Use Simulator
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'troubleshoot'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Troubleshooting & LEDs
          </button>
          <button
            onClick={() => setActiveTab('ics')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'ics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            IC Pinout Quick Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* TAB 1: HELP & CONTACT SUPPORT */}
          {activeTab === 'help' && (
            <div className="space-y-5">
              {/* Highlighted Support Card */}
              <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-800/50 border border-blue-500/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-400 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">
                      Direct Support & Query Resolution
                    </h3>
                    <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                      If you encounter any issues with circuit simulations, IC placements, LED behaviors, or need help with any lab experiment or assignment, please reach out directly:
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/70 border border-slate-700/80 rounded-lg p-2.5 px-3">
                      <span className="text-xs text-slate-400">Contact Email:</span>
                      <span className="font-mono text-sm font-bold text-emerald-400 select-all">
                        {contactEmail}
                      </span>
                      <button
                        onClick={handleCopyEmail}
                        className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                        title="Copy email to clipboard"
                      >
                        {copiedEmail ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </button>
                      <a
                        href={`mailto:${contactEmail}?subject=Digital%20Electronics%20Lab%20Query`}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs px-2.5 py-1.5 rounded font-medium transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send Mail</span>
                      </a>
                      <a
                        href="https://simulator-jgl1.onrender.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs px-2.5 py-1.5 rounded font-medium transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Hosted Web App</span>
                      </a>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300/90 font-medium bg-emerald-950/40 border border-emerald-500/30 rounded-md p-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        Contact on this email and query will be resolved promptly!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Queries We Resolve */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Circuit & Simulation Queries
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>LED blinking or circuit logic not triggering</li>
                    <li>Questions about wiring assignments (Exp 1 - 10, A1 - A4)</li>
                    <li>Building custom sequential or combinational circuits</li>
                    <li>Truth table verification or grading feedback</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Feature & Component Requests
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Requesting new TTL 74xx integrated circuits</li>
                    <li>Simulator UI improvements, shortcuts, or presets</li>
                    <li>Exporting / importing lab circuit assignments</li>
                    <li>Assistance for lab exams, viva preparation, or projects</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2 text-blue-400">
                  <Layers className="w-4 h-4" /> 1. How Breadboard Holes Work
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  The breadboard is divided horizontally by the center divider channel (Row <strong>f</strong> above, Row <strong>e</strong> below).
                </p>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  <li><strong>Upper Terminal Strip:</strong> Rows <strong>j, i, h, g, f</strong> in the same column are connected internally.</li>
                  <li><strong>Lower Terminal Strip:</strong> Rows <strong>e, d, c, b, a</strong> in the same column are connected internally.</li>
                  <li><strong>Power Rails (+ and -):</strong> Top and bottom rails run horizontally across all 30 columns.</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2 text-emerald-400">
                  <Cpu className="w-4 h-4" /> 2. Placing ICs & Precise Pin Fit
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">
                  ICs straddle the center divider channel so their pins seat precisely inside the hole boxes:
                </p>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  <li>Pins 1 to N/2 plug squarely into Row <strong>e</strong> (lower strip).</li>
                  <li>Pins N/2+1 to N plug squarely into Row <strong>f</strong> (upper strip).</li>
                  <li>Pin tips and leads fit cleanly within the metallic socket boxes without protruding.</li>
                  <li>Every IC must have its <strong>VCC pin tied to +5V</strong> and its <strong>GND pin tied to 0V</strong>.</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2 text-amber-400">
                  <Activity className="w-4 h-4" /> 3. Connecting LEDs & Running Clocks
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                  <li><strong>Adding an LED:</strong> Click the LED tool in the left palette. Click the first hole (Anode) and then the second hole (Cathode).</li>
                  <li><strong>Polarity:</strong> Anode must receive HIGH logic (1) and Cathode must be connected to GND (0).</li>
                  <li><strong>Clocks & Running:</strong> Use the Function Generator at top-left. Click <strong>Pulse</strong> for single step or <strong>Run</strong> in the bottom bar for continuous clocking. Sequential counter LEDs will blink in real time!</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOTING & LEDS */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="font-bold text-amber-400 text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Why is my LED not lighting up or blinking?
                </h4>
                <div className="space-y-2 text-slate-300">
                  <div>
                    <strong className="text-white">1. Are Anode and Cathode plugged into the same column?</strong>
                    <p className="text-slate-400 mt-0.5">
                      Because rows e-a in a column are connected internally, plugging both legs into the same column shorts the LED. Plug Anode into the IC output column (e.g., Row d) and Cathode into an adjacent column or the GND rail!
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">2. Is the IC powered?</strong>
                    <p className="text-slate-400 mt-0.5">
                      Check if the IC shows as unpowered. Wire the +5V supply socket to the breadboard top rail, and connect the IC's VCC pin (e.g. Pin 14 or 16) to the + rail, and GND pin to the - rail.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">3. Is the clock running for sequential circuits?</strong>
                    <p className="text-slate-400 mt-0.5">
                      Counters and flip-flops (Exp 7, 8, 9, 10, A4) advance on clock transitions. Click the <strong>Pulse</strong> button on the Function Generator or press <strong>Run</strong> in the bottom bar to watch LEDs blink through their count sequence!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="font-bold text-blue-400 text-sm mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Tap Wire Quick-Flip Feature
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  To quickly toggle input logic levels during manual truth table verification, click any wire endpoint seated on a power rail (+ or -). It will instantly flip between +5V (1) and GND (0) without rewiring!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: IC PINOUT GUIDE */}
          {activeTab === 'ics' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Quick pin summary for standard TTL 74xx ICs used in the lab:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7400 Quad 2-Input NAND</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • Gates: 1(1A,1B,1Y), 2(2A,2B,2Y)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7404 Hex Inverter (NOT)</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • Gates: 1(1A,1Y), 2(2A,2Y)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7408 Quad 2-Input AND</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • Gates: 1(1A,1B,1Y), 2(2A,2B,2Y)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7432 Quad 2-Input OR</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • Gates: 1(1A,1B,1Y), 2(2A,2B,2Y)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7486 Quad 2-Input XOR</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • Gates: 1(1A,1B,1Y), 2(2A,2B,2Y)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7485 4-Bit Magnitude Comparator</div>
                  <div className="text-slate-400 text-[11px]">16 pins • VCC: 16, GND: 8 • A0-A3, B0-B3 • Outputs: A&gt;B(5), A=B(6), A&lt;B(7)</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7483 4-Bit Binary Full Adder</div>
                  <div className="text-slate-400 text-[11px]">16 pins • VCC: 5, GND: 12 • Inputs: A1-A4, B1-B4, C0 • Sums: S1-S4, C4</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7490 BCD / Decade Counter</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 5, GND: 10 • Clocks: CKA(14), CKB(1) • Outputs: QA, QB, QC, QD</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7476 Dual JK Flip-Flop</div>
                  <div className="text-slate-400 text-[11px]">16 pins • VCC: 5, GND: 13 • 1CLK(1), 1PRE(2), 1CLR(3), 1J(4), 1K(16)...</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                  <div className="font-bold text-white">7474 Dual D Flip-Flop</div>
                  <div className="text-slate-400 text-[11px]">14 pins • VCC: 14, GND: 7 • 1CLR(1), 1D(2), 1CLK(3), 1PRE(4), 1Q(5), 1Q̄(6)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-700/80 bg-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Direct Support:</span>
            <span className="font-mono text-emerald-400 font-semibold">{contactEmail}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold transition"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
};
