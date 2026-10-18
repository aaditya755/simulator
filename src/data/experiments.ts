/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Experiment, TruthTableRow } from '../types';

// Helper to generate full adder truth table
function generateFullAdderTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let a = 0; a <= 1; a++) {
    for (let b = 0; b <= 1; b++) {
      for (let cin = 0; cin <= 1; cin++) {
        const sum = a ^ b ^ cin;
        const cout = (a & b) | (cin & (a ^ b));
        rows.push({
          inputs: { A: a, B: b, Cin: cin },
          outputs: { Sum: sum, Cout: cout },
        });
      }
    }
  }
  return rows;
}

// Helper to generate Full Subtractor table
function generateFullSubtractorTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let a = 0; a <= 1; a++) {
    for (let b = 0; b <= 1; b++) {
      for (let bin = 0; bin <= 1; bin++) {
        const diff = a ^ b ^ bin;
        const notA = a === 0 ? 1 : 0;
        const bout = (notA & b) | (bin & (notA ^ (b === 0 ? 1 : 0) ? 0 : 1));
        // Standard full subtractor: Bout = (~A & B) | (~(A ^ B) & Bin)
        const boutStandard = (notA & b) | (((a ^ b) === 0 ? 1 : 0) & bin);
        rows.push({
          inputs: { A: a, B: b, Bin: bin },
          outputs: { Diff: diff, Bout: boutStandard },
        });
      }
    }
  }
  return rows;
}

// Helper for Binary to Gray table (16 rows)
function generateBinaryToGrayTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let i = 0; i < 16; i++) {
    const b3 = (i >> 3) & 1;
    const b2 = (i >> 2) & 1;
    const b1 = (i >> 1) & 1;
    const b0 = i & 1;

    const g3 = b3;
    const g2 = b3 ^ b2;
    const g1 = b2 ^ b1;
    const g0 = b1 ^ b0;

    rows.push({
      inputs: { B3: b3, B2: b2, B1: b1, B0: b0 },
      outputs: { G3: g3, G2: g2, G1: g1, G0: g0 },
    });
  }
  return rows;
}

// Helper for 2-bit Comparator table (16 rows)
function generateComparatorTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const a1 = (a >> 1) & 1;
      const a0 = a & 1;
      const b1 = (b >> 1) & 1;
      const b0 = b & 1;

      rows.push({
        inputs: { A1: a1, A0: a0, B1: b1, B0: b0 },
        outputs: {
          'A>B': a > b ? 1 : 0,
          'A=B': a === b ? 1 : 0,
          'A<B': a < b ? 1 : 0,
        },
      });
    }
  }
  return rows;
}

// Helper for Parity generator & checker
function generateParityTable(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let i = 0; i < 8; i++) {
    const d2 = (i >> 2) & 1;
    const d1 = (i >> 1) & 1;
    const d0 = i & 1;
    const p = d2 ^ d1 ^ d0; // Even parity bit (total 1s including P is even)
    rows.push({
      inputs: { D2: d2, D1: d1, D0: d0 },
      outputs: { P: p },
    });
  }
  return rows;
}

// Helper for MUX minterm functions
export function generateMuxTable(minterms: number[] = [1, 2, 4, 7]): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let i = 0; i < 8; i++) {
    const c = (i >> 2) & 1;
    const b = (i >> 1) & 1;
    const a = i & 1;
    const y = minterms.includes(i) ? 1 : 0;
    rows.push({
      inputs: { C: c, B: b, A: a },
      outputs: { Y: y },
    });
  }
  return rows;
}

// Helper for BCD to Excess-3 (10 rows for valid BCD digits)
function generateBcdToExcess3Table(): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  for (let bcd = 0; bcd <= 9; bcd++) {
    const xs3 = bcd + 3;
    rows.push({
      inputs: {
        B3: (bcd >> 3) & 1,
        B2: (bcd >> 2) & 1,
        B1: (bcd >> 1) & 1,
        B0: bcd & 1,
      },
      outputs: {
        E3: (xs3 >> 3) & 1,
        E2: (xs3 >> 2) & 1,
        E1: (xs3 >> 1) & 1,
        E0: xs3 & 1,
      },
    });
  }
  return rows;
}

export const EXPERIMENTS: Experiment[] = [
  // -----------------------------------------------------------------
  // Free Build
  // -----------------------------------------------------------------
  {
    id: 'free',
    number: 'Free',
    title: 'Free Build (no checks)',
    category: 'Free',
    aim: 'Freely construct and experiment with any TTL logic gates, counters, registers, and indicators on the breadboard without restrictions or test criteria.',
    partsNeeded: [],
    inputNames: [],
    outputNames: [],
    steps: [
      'Select any IC from the left palette and click on the breadboard to place it.',
      'Connect the red VCC (+5V) and black GND sockets to the breadboard power rails.',
      'Wire the IC power pins to the rails (VCC to + rail, GND to - rail).',
      'Plug LEDs into the board (anode to output pin, cathode to - rail).',
      'Connect wires to rails or function generator clocks to test your logic.',
    ],
    checkerType: 'free',
  },

  // -----------------------------------------------------------------
  // Experiment 1: Full Adder using logic gates
  // -----------------------------------------------------------------
  {
    id: 'exp1',
    number: '1',
    title: 'Full Adder using logic gates',
    category: 'Gates',
    aim: 'To design, wire and verify a Full Adder circuit using basic TTL logic gates (XOR 7486, AND 7408, OR 7432) and verify its truth table for all 8 combinations of inputs A, B, and Cin.',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: '7408 (AND)', count: 1 },
      { name: '7432 (OR)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['A', 'B', 'Cin'],
    outputNames: ['Sum', 'Cout'],
    steps: [
      'Place IC 7486 (XOR), IC 7408 (AND), and IC 7432 (OR) on the breadboard straddling the center channel.',
      'Power the ICs: connect pin 14 of each IC to the + rail, and pin 7 of each to the - rail.',
      'Wire the +5V VCC and GND supply sockets to the breadboard top rails.',
      'Wire inputs A and B to XOR 1 (pins 1, 2) and AND 1 (pins 1, 2).',
      'Wire XOR 1 output (pin 3) and Cin to XOR 2 (pins 4, 5). Pin 6 gives Sum.',
      'Wire Cin and (A xor B) to AND 2 (pins 4, 5). Connect AND 1 out (pin 3) and AND 2 out (pin 6) to OR 1 (pins 1, 2). Pin 3 gives Cout.',
      'Place LEDs for Sum and Cout with cathodes to - rail. Tap input wires on rails to flip 0 and 1.',
    ],
    truthTable: generateFullAdderTable(),
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '7486', startCol: 5 },
        { type: '7408', startCol: 14 },
        { type: '7432', startCol: 22 },
      ],
      wires: [
        // Power supply to rails
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        // Bottom rails tied to top rails
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // IC Power: 7486 (col 5) VCC pin 14 (f_5), GND pin 7 (e_11)
        { from: 'railTop+_5', to: 'f_5', color: 'red' },
        { from: 'railBottom-_11', to: 'e_11', color: 'black' },
        // IC Power: 7408 (col 14) VCC pin 14 (f_14), GND pin 7 (e_20)
        { from: 'railTop+_14', to: 'f_14', color: 'red' },
        { from: 'railBottom-_20', to: 'e_20', color: 'black' },
        // IC Power: 7432 (col 22) VCC pin 14 (f_22), GND pin 7 (e_28)
        { from: 'railTop+_22', to: 'f_22', color: 'red' },
        { from: 'railBottom-_28', to: 'e_28', color: 'black' },
        // Inputs A (col 2), B (col 3), Cin (col 4)
        { from: 'railTop+_2', to: 'e_5', color: 'yellow', label: 'A' },
        { from: 'railTop+_3', to: 'e_6', color: 'yellow', label: 'B' },
        { from: 'railTop+_4', to: 'e_8', color: 'yellow', label: 'Cin' },
        // Connect A & B to 7408 AND pins 1 & 2 (e_14, e_15)
        { from: 'e_5', to: 'e_14', color: 'green' },
        { from: 'e_6', to: 'e_15', color: 'green' },
        // 7486 XOR 1 out (e_7) to XOR 2 input (e_9)
        { from: 'e_7', to: 'e_9', color: 'green' },
        // Cin (e_8) also to 7408 AND 2 input (e_18)
        { from: 'e_8', to: 'e_18', color: 'green' },
        // XOR 1 out (e_7) also to 7408 AND 2 input (e_17)
        { from: 'e_7', to: 'e_17', color: 'green' },
        // AND 1 out (e_16) to 7432 OR input 1 (e_22)
        { from: 'e_16', to: 'e_22', color: 'green' },
        // AND 2 out (e_19) to 7432 OR input 2 (e_23)
        { from: 'e_19', to: 'e_23', color: 'green' },
      ],
      leds: [
        // Sum from 7486 pin 6 (e_10) to GND
        { anode: 'e_10', cathode: 'railBottom-_10', label: 'Sum' },
        // Cout from 7432 pin 3 (e_24) to GND
        { anode: 'e_24', cathode: 'railBottom-_24', label: 'Cout' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment 2: Code converter: Binary to Gray
  // -----------------------------------------------------------------
  {
    id: 'exp2',
    number: '2',
    title: 'Code converter: Binary to Gray code',
    category: 'Combinational',
    aim: 'To design and implement a 4-bit Binary to Gray code converter using XOR gates (IC 7486) and verify all 16 input combinations.',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: 'LED', count: 4 },
    ],
    inputNames: ['B3', 'B2', 'B1', 'B0'],
    outputNames: ['G3', 'G2', 'G1', 'G0'],
    steps: [
      'Place IC 7486 on the breadboard and connect pin 14 to +5V and pin 7 to GND.',
      'B3 directly passes through to G3 (G3 = B3).',
      'Connect B3 and B2 to XOR gate 1 (pins 1, 2). Pin 3 gives G2.',
      'Connect B2 and B1 to XOR gate 2 (pins 4, 5). Pin 6 gives G1.',
      'Connect B1 and B0 to XOR gate 3 (pins 9, 10). Pin 8 gives G0.',
      'Connect 4 LEDs with cathodes to GND to monitor G3, G2, G1, and G0.',
    ],
    truthTable: generateBinaryToGrayTable(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment 3: BCD Adder using 7483
  // -----------------------------------------------------------------
  {
    id: 'exp3',
    number: '3',
    title: 'BCD Adder using IC 7483',
    category: 'Arithmetic',
    aim: 'To construct and test a BCD Adder using 4-bit binary adder ICs (7483) and logic gates to add two BCD digits (0-9) and generate a valid BCD sum with carry.',
    partsNeeded: [
      { name: '7483 (Adder)', count: 2 },
      { name: '7408 (AND)', count: 1 },
      { name: '7432 (OR)', count: 1 },
      { name: 'LED', count: 5 },
    ],
    inputNames: ['A3', 'A2', 'A1', 'A0', 'B3', 'B2', 'B1', 'B0'],
    outputNames: ['Cout', 'S3', 'S2', 'S1', 'S0'],
    steps: [
      'Place two 7483 4-bit adders. Note: VCC is pin 5, GND is pin 12.',
      'Feed the two 4-bit BCD numbers A and B into Adder 1 with carry-in C0 tied to GND.',
      'Detect when binary sum exceeds 9 using condition: C4 + S3.S2 + S3.S1 (using AND and OR gates).',
      'The detection output forms the final BCD carry and feeds 0110 (binary 6) to the B inputs of Adder 2.',
      'The sum outputs of Adder 2 form the final BCD sum digits S3..S0.',
    ],
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment 4: Boolean expression using Multiplexer
  // -----------------------------------------------------------------
  {
    id: 'exp4',
    number: '4',
    title: 'Boolean expression using Multiplexer (74151)',
    category: 'Mux-Demux',
    aim: 'To implement a given 3-variable Boolean function using the 8-to-1 Multiplexer IC 74151 and verify its output against the truth table.',
    partsNeeded: [
      { name: '74151 (8:1 MUX)', count: 1 },
      { name: 'LED', count: 1 },
    ],
    inputNames: ['C', 'B', 'A'],
    outputNames: ['Y'],
    steps: [
      'Place IC 74151: pin 16 to +5V, pin 8 to GND, pin 7 (Strobe E) to GND.',
      'Connect select lines A (pin 11), B (pin 10), and C (pin 9) to your input wires.',
      'For minterms where F=1, tie the corresponding data input (D0..D7) to the +5V rail.',
      'For minterms where F=0, tie the corresponding data input to the GND rail.',
      'Connect an LED to output Y (pin 5) with cathode to GND.',
    ],
    sampleOptions: [
      { label: 'F(C,B,A) = Σm(1,2,4,7)', minterms: [1, 2, 4, 7] },
      { label: 'F(C,B,A) = Σm(0,3,5,6)', minterms: [0, 3, 5, 6] },
      { label: 'F(C,B,A) = Σm(1,3,5,6)', minterms: [1, 3, 5, 6] },
    ],
    truthTable: generateMuxTable([1, 2, 4, 7]),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment 5: 2-bit comparator using logic gates
  // -----------------------------------------------------------------
  {
    id: 'exp5',
    number: '5',
    title: '2-bit Comparator using logic gates',
    category: 'Gates',
    aim: 'To design and wire a 2-bit magnitude comparator using logic gates (7486, 7404, 7408, 7432) to compare two 2-bit numbers A (A1,A0) and B (B1,B0) and indicate A>B, A=B, and A<B.',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: '7404 (NOT)', count: 1 },
      { name: '7408 (AND)', count: 1 },
      { name: '7432 (OR)', count: 1 },
      { name: 'LED', count: 3 },
    ],
    inputNames: ['A1', 'A0', 'B1', 'B0'],
    outputNames: ['A>B', 'A=B', 'A<B'],
    steps: [
      'Power all gate ICs: pin 14 to +5V, pin 7 to GND.',
      'Condition A=B: (A1 XNOR B1) AND (A0 XNOR B0). Wire XOR gates followed by inverters, then AND them.',
      'Condition A>B: A1.(~B1) + (A1 XNOR B1).A0.(~B0).',
      'Condition A<B: (~A1).B1 + (A1 XNOR B1).(~A0).B0.',
      'Connect 3 LEDs to monitor A>B, A=B, and A<B respectively.',
    ],
    truthTable: generateComparatorTable(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment 6: Parity generator and checker
  // -----------------------------------------------------------------
  {
    id: 'exp6',
    number: '6',
    title: 'Parity Generator and Checker',
    category: 'Gates',
    aim: 'To design an even parity generator for 3 data bits (D2, D1, D0) and a parity checker circuit using IC 7486 XOR gates.',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['D2', 'D1', 'D0'],
    outputNames: ['P'],
    steps: [
      'Place IC 7486 on the breadboard; connect pin 14 to +5V and pin 7 to GND.',
      'Feed D2 and D1 into XOR gate 1 (pins 1, 2).',
      'Feed XOR 1 output (pin 3) and D0 into XOR gate 2 (pins 4, 5).',
      'The output of XOR gate 2 (pin 6) provides the even parity bit P.',
      'Connect an LED to pin 6 with cathode to GND.',
    ],
    truthTable: generateParityTable(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment 7: 2-bit Ripple counter using JK flip-flop
  // -----------------------------------------------------------------
  {
    id: 'exp7',
    number: '7',
    title: '2-bit Ripple Counter using JK flip-flop (7476)',
    category: 'Sequential',
    aim: 'To design and wire a 2-bit asynchronous ripple counter using the dual JK flip-flop IC 7476, driven by CLOCK 1, and observe counting states 00 -> 01 -> 10 -> 11 -> 00.',
    partsNeeded: [
      { name: '7476 (Dual JK FF)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['CLK'],
    outputNames: ['Q1', 'Q0'],
    steps: [
      'Place IC 7476: Note pinout! Pin 5 = VCC (+5V), Pin 13 = GND.',
      'For both flip-flops, tie PRE and CLR pins (pins 2, 3, 7, 8) to the +5V rail (inactive).',
      'Set both flip-flops in toggle mode by tying J and K pins (pins 4, 16, 9, 12) to +5V.',
      'Connect CLOCK 1 OUT to FF1 clock (pin 1). FF1 output 1Q (pin 15) is Q0 (LSB).',
      'Connect 1Q (pin 15) to FF2 clock (pin 6). FF2 output 2Q (pin 11) is Q1 (MSB).',
      'Place LEDs on Q1 and Q0 with cathodes to GND. Press Run or Pulse to watch it count.',
    ],
    isSequential: true,
    expectedSequence: [
      { step: 0, clock: 0, outputs: { Q1: 0, Q0: 0 } },
      { step: 1, clock: 1, outputs: { Q1: 0, Q0: 1 } },
      { step: 2, clock: 2, outputs: { Q1: 1, Q0: 0 } },
      { step: 3, clock: 3, outputs: { Q1: 1, Q0: 1 } },
      { step: 4, clock: 4, outputs: { Q1: 0, Q0: 0 } },
    ],
    checkerType: 'sequential',
    preset: {
      ics: [
        { type: '7476', startCol: 10 },
      ],
      wires: [
        // Power supply to rails
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // IC 7476 (startCol 10): Pin 5 = e_14 (VCC), Pin 13 = f_13 (GND)
        { from: 'railTop+_14', to: 'e_14', color: 'red' },
        { from: 'railBottom-_13', to: 'f_13', color: 'black' },
        // PRE & CLR tied to +5V:
        // FF1: pin 2 (e_11), pin 3 (e_12)
        { from: 'railTop+_11', to: 'e_11', color: 'red' },
        { from: 'railTop+_12', to: 'e_12', color: 'red' },
        // FF2: pin 7 (e_16), pin 8 (e_17)
        { from: 'railTop+_16', to: 'e_16', color: 'red' },
        { from: 'railTop+_17', to: 'e_17', color: 'red' },
        // J & K tied to +5V:
        // FF1: 1J pin 4 (e_13), 1K pin 16 (f_10)
        { from: 'railTop+_13', to: 'e_13', color: 'red' },
        { from: 'railBottom+_10', to: 'f_10', color: 'red' },
        // FF2: 2J pin 9 (f_17), 2K pin 12 (f_14)
        { from: 'railBottom+_17', to: 'f_17', color: 'red' },
        { from: 'railBottom+_14', to: 'f_14', color: 'red' },
        // Clock 1 OUT to FF1 CLK (pin 1, e_10)
        { from: 'socket-clk1', to: 'e_10', color: 'green' },
        // FF1 1Q (pin 15, f_11) to FF2 2CLK (pin 6, e_15)
        { from: 'f_11', to: 'e_15', color: 'yellow' },
      ],
      leds: [
        // Q0 from FF1 1Q (f_11) to GND
        { anode: 'f_11', cathode: 'railBottom-_11', label: 'Q0' },
        // Q1 from FF2 2Q (f_15) to GND
        { anode: 'f_15', cathode: 'railBottom-_15', label: 'Q1' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment 8: Synchronous 2-bit Up/Down counter with mode control
  // -----------------------------------------------------------------
  {
    id: 'exp8',
    number: '8',
    title: 'Synchronous 2-bit Up/Down counter (7476, 7486)',
    category: 'Sequential',
    aim: 'To wire and verify a synchronous 2-bit up/down counter using JK flip-flop IC 7476 and XOR gate IC 7486 with mode control M (M=0 for Up, M=1 for Down).',
    partsNeeded: [
      { name: '7476 (Dual JK FF)', count: 1 },
      { name: '7486 (XOR)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['M', 'CLK'],
    outputNames: ['Q1', 'Q0'],
    steps: [
      'Place IC 7476 and IC 7486; wire their VCC and GND pins to the rails.',
      'Tie PRE and CLR pins to +5V (inactive).',
      'Both flip-flops share CLOCK 1 OUT (connected to pin 1 and pin 6).',
      'FF0 has J0=K0=1 (tied to +5V).',
      'Connect Q0 and Mode input M to XOR gate 1. Its output feeds J1 and K1 of FF1.',
      'When M=0, counts 00, 01, 10, 11, 00... (Up). When M=1, counts 00, 11, 10, 01, 00... (Down).',
    ],
    isSequential: true,
    checkerType: 'sequential',
  },

  // -----------------------------------------------------------------
  // Experiment 9: Modulo-N counter using 7490
  // -----------------------------------------------------------------
  {
    id: 'exp9',
    number: '9',
    title: 'Modulo-N counter using Decade Counter IC 7490',
    category: 'Counters',
    aim: 'To design a Modulo-N counter (e.g. Mod-6) using IC 7490 decade counter and an AND gate (7408) to reset the count when it reaches N.',
    partsNeeded: [
      { name: '7490 (Decade Counter)', count: 1 },
      { name: '7408 (AND)', count: 1 },
      { name: 'LED', count: 4 },
    ],
    inputNames: ['CLK'],
    outputNames: ['QD', 'QC', 'QB', 'QA'],
    steps: [
      'Place IC 7490: Pin 5 = VCC (+5V), Pin 10 = GND.',
      'Connect CLOCK 1 OUT to CKA (pin 14).',
      'To enable full BCD counting, wire QA (pin 12) to CKB (pin 1).',
      'Ground the set-9 pins R9(1) (pin 6) and R9(2) (pin 7).',
      'For Mod-6 (binary 0110): feed QC (pin 8) and QB (pin 9) to reset pins R0(1) (pin 2) and R0(2) (pin 3).',
      'The counter will count 0, 1, 2, 3, 4, 5, then immediately reset to 0.',
    ],
    sampleOptions: [
      { label: 'Mod-6 Counter (0 to 5)', modulo: 6 },
      { label: 'Mod-5 Counter (0 to 4)', modulo: 5 },
      { label: 'Mod-7 Counter (0 to 6)', modulo: 7 },
      { label: 'Mod-8 Counter (0 to 7)', modulo: 8 },
    ],
    isSequential: true,
    checkerType: 'sequential',
  },

  // -----------------------------------------------------------------
  // Experiment 10: Sequence generator and detector using JK FF
  // -----------------------------------------------------------------
  {
    id: 'exp10',
    number: '10',
    title: 'Sequence generator and detector (7476, gates)',
    category: 'Sequential',
    aim: 'To design and implement a sequence detector using JK flip-flops to detect the binary sequence "101" from a serial input stream.',
    partsNeeded: [
      { name: '7476 (Dual JK FF)', count: 1 },
      { name: '7408 (AND)', count: 1 },
      { name: '7404 (NOT)', count: 1 },
      { name: 'LED', count: 3 },
    ],
    inputNames: ['X', 'CLK'],
    outputNames: ['Z', 'Q1', 'Q0'],
    steps: [
      'Place IC 7476, 7408 and 7404 and connect power and ground.',
      'Wire the flip-flops synchronously to CLOCK 1 OUT.',
      'Use serial input X to transition between states representing past bits.',
      'Output Z lights up whenever the sequence "101" is successfully detected.',
    ],
    isSequential: true,
    checkerType: 'sequential',
  },

  // -----------------------------------------------------------------
  // Experiment A1: Full Subtractor using logic gates
  // -----------------------------------------------------------------
  {
    id: 'expA1',
    number: 'A1',
    title: 'Full Subtractor using logic gates',
    category: 'Gates',
    aim: 'To design and implement a Full Subtractor circuit using XOR (7486), NOT (7404), AND (7408), and OR (7432) gates and verify its truth table for Diff and Bout.',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: '7404 (NOT)', count: 1 },
      { name: '7408 (AND)', count: 1 },
      { name: '7432 (OR)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['A', 'B', 'Bin'],
    outputNames: ['Diff', 'Bout'],
    steps: [
      'Power all gate ICs: pin 14 to +5V, pin 7 to GND.',
      'Difference = A xor B xor Bin (using two XOR gates in 7486).',
      'Invert input A using 7404: ~A.',
      'Wire (~A).B and Bin.(~(A xor B)) using AND gates in 7408.',
      'OR the two product terms in 7432 to produce Borrow out (Bout).',
      'Verify the 8 rows in the truth table.',
    ],
    truthTable: generateFullSubtractorTable(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment A2: Code converter: BCD to Excess-3
  // -----------------------------------------------------------------
  {
    id: 'expA2',
    number: 'A2',
    title: 'Code converter: BCD to Excess-3 (7483)',
    category: 'Combinational',
    aim: 'To convert a 4-bit BCD digit (0-9) to Excess-3 code using 4-bit binary adder IC 7483 by adding binary 0011 (3).',
    partsNeeded: [
      { name: '7483 (Adder)', count: 1 },
      { name: 'LED', count: 4 },
    ],
    inputNames: ['B3', 'B2', 'B1', 'B0'],
    outputNames: ['E3', 'E2', 'E1', 'E0'],
    steps: [
      'Place IC 7483: connect Pin 5 to +5V, Pin 12 to GND.',
      'Connect BCD inputs B3..B0 to A4..A1 pins of 7483.',
      'Tie B inputs to binary 3 (0011): B4=0, B3=0, B2=1, B1=1.',
      'Tie carry input C0 (pin 13) to GND.',
      'Outputs S4..S1 produce the Excess-3 digits E3..E0.',
    ],
    truthTable: generateBcdToExcess3Table(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment A3: Full Adder using Decoder (74138)
  // -----------------------------------------------------------------
  {
    id: 'expA3',
    number: 'A3',
    title: 'Full Adder using 3-to-8 Decoder (74138)',
    category: 'Mux-Demux',
    aim: 'To implement a Full Adder using the active-low 3-to-8 decoder IC 74138 and multi-input NAND gates (7410, 7420).',
    partsNeeded: [
      { name: '74138 (Decoder)', count: 1 },
      { name: '7420 (4-input NAND)', count: 1 },
      { name: '7410 (3-input NAND)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['C', 'B', 'A'],
    outputNames: ['Sum', 'Cout'],
    steps: [
      'Place IC 74138: Pin 16 to +5V, Pin 8 to GND. Enable it: G1=1, G2A=0, G2B=0.',
      'Connect inputs C, B, A to pins 3, 2, 1.',
      'Sum = Σm(1,2,4,7). Connect decoder outputs Y1, Y2, Y4, Y7 into a 4-input NAND gate (7420).',
      'Cout = Σm(3,5,6,7). Connect decoder outputs Y3, Y5, Y6, Y7 into a 4-input NAND gate.',
      'The NAND gate outputs directly give the active-high Sum and Cout.',
    ],
    truthTable: generateFullAdderTable(),
    checkerType: 'combinational',
  },

  // -----------------------------------------------------------------
  // Experiment A4: Shift register using D Flip-Flop (7474)
  // -----------------------------------------------------------------
  {
    id: 'expA4',
    number: 'A4',
    title: '4-bit Serial-In Serial-Out Shift Register (7474)',
    category: 'Registers',
    aim: 'To wire a 4-bit SISO shift register using two 7474 dual D flip-flop ICs and observe data shifting on positive clock edges.',
    partsNeeded: [
      { name: '7474 (Dual D FF)', count: 2 },
      { name: 'LED', count: 4 },
    ],
    inputNames: ['Data', 'CLK'],
    outputNames: ['Q3', 'Q2', 'Q1', 'Q0'],
    steps: [
      'Place two 7474 ICs; connect pin 14 to +5V and pin 7 to GND for both.',
      'Tie all CLR and PRE pins to +5V.',
      'Connect CLOCK 1 OUT to the clock pins of all 4 flip-flops.',
      'Wire Data input into 1D of the first FF.',
      'Cascade 1Q to 2D of FF1, 2Q to 1D of FF2, and so on.',
      'Place LEDs on each Q output to observe data shifting from left to right.',
    ],
    isSequential: true,
    checkerType: 'sequential',
  },
];
