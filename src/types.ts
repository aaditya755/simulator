/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SignalValue = 0 | 1 | 'FLOAT' | 'CONFLICT';

export type WireColor = 'red' | 'black' | 'green' | 'yellow' | 'blue';

export type HoleType = 
  | 'rail-top-vcc' 
  | 'rail-top-gnd' 
  | 'strip-upper' 
  | 'strip-lower' 
  | 'rail-bottom-gnd' 
  | 'rail-bottom-vcc'
  | 'panel-socket';

export interface HoleLocation {
  id: string;
  type: HoleType;
  col: number;      // 1..30 or 0 for sockets
  row?: string;     // 'j','i','h','g','f','e','d','c','b','a'
  x: number;
  y: number;
}

export interface PlacedIc {
  id: string;
  type: string;     // e.g. '7408', '7486', '7483', etc.
  startCol: number; // Leftmost pin column (1..23 or 24)
  label?: string;
}

export interface PlacedLed {
  id: string;
  anodeHoleId: string;
  cathodeHoleId: string;
  label?: string;   // e.g. "Sum", "Cout", "Q0", etc.
  color?: string;
}

export interface PlacedResistor {
  id: string;
  hole1Id: string;
  hole2Id: string;
  value?: string;
}

export interface Wire {
  id: string;
  fromHoleId: string;
  toHoleId: string;
  color: WireColor;
  label?: string;   // e.g. "A", "B", "Cin"
}

export interface IcPinDef {
  pinNumber: number;
  name: string;
  isVcc?: boolean;
  isGnd?: boolean;
  isClock?: boolean;
  isInput?: boolean;
  isOutput?: boolean;
  isAsyncReset?: boolean;
  inverted?: boolean;
}

export interface IcDefinition {
  id: string;
  name: string;
  description: string;
  category: 'gate' | 'arithmetic' | 'mux-demux' | 'flipflop' | 'counter' | 'register';
  pinCount: 14 | 16;
  vccPin: number;
  gndPin: number;
  pins: IcPinDef[];
  // Combinational evaluation
  evaluate?: (inputs: Record<number, SignalValue>) => Record<number, SignalValue>;
  // Sequential evaluation
  initialState?: Record<string, any>;
  onClockEdge?: (
    edgePins: number[], 
    inputs: Record<number, SignalValue>, 
    currentState: Record<string, any>
  ) => { nextState: Record<string, any>; outputs: Record<number, SignalValue> };
  // Static state update (e.g. async clear/preset)
  evaluateSequential?: (
    inputs: Record<number, SignalValue>, 
    currentState: Record<string, any>
  ) => { nextState: Record<string, any>; outputs: Record<number, SignalValue> };
}

export interface ExperimentStep {
  text: string;
}

export interface TruthTableRow {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
}

export interface PresetWiring {
  ics: Array<{ type: string; startCol: number }>;
  wires: Array<{ from: string; to: string; color: WireColor; label?: string }>;
  leds: Array<{ anode: string; cathode: string; label: string }>;
}

export interface Experiment {
  id: string;
  number: string;
  title: string;
  aim: string;
  category: 'Gates' | 'Combinational' | 'Arithmetic' | 'Mux-Demux' | 'Sequential' | 'Counters' | 'Registers' | 'Free';
  partsNeeded: Array<{ name: string; count: number }>;
  inputNames: string[];
  outputNames: string[];
  steps: string[];
  truthTable?: TruthTableRow[];
  isSequential?: boolean;
  expectedSequence?: Array<{ step: number; clock: number; outputs: Record<string, number> }>;
  checkerType: 'combinational' | 'sequential' | 'free';
  sampleOptions?: { label: string; minterms?: number[]; pattern?: string; modulo?: number }[];
  preset?: PresetWiring;
}

export interface NetState {
  id: number;
  holes: Set<string>;
  value: SignalValue;
  hasConflict: boolean;
  isVcc: boolean;
  isGnd: boolean;
}

export interface CheckResult {
  passed: boolean;
  headline: string;
  details?: string;
  failedRowIndex?: number;
  hint?: string;
}
