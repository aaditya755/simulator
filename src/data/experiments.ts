/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Experiment, TruthTableRow, PresetWiring } from '../types';

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
    const p = d2 ^ d1 ^ d0; // Even parity bit
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
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
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
        { anode: 'e_10', cathode: 'railBottom-_10', label: 'Sum' },
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
    preset: {
      ics: [
        { type: '7486', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power 7486 (col 11): VCC pin 14 (f_11), GND pin 7 (e_17)
        { from: 'railTop+_11', to: 'f_11', color: 'red' },
        { from: 'railBottom-_17', to: 'e_17', color: 'black' },
        // Inputs B3, B2, B1, B0
        { from: 'railTop+_5', to: 'e_5', color: 'yellow', label: 'B3' },
        { from: 'railTop+_6', to: 'e_6', color: 'yellow', label: 'B2' },
        { from: 'railTop+_7', to: 'e_7', color: 'yellow', label: 'B1' },
        { from: 'railTop+_8', to: 'e_8', color: 'yellow', label: 'B0' },
        // Gate 1: B3 ^ B2 -> G2 (pins 1, 2 -> 3; e_11, e_12 -> e_13)
        { from: 'e_5', to: 'e_11', color: 'green' },
        { from: 'e_6', to: 'e_12', color: 'green' },
        // Gate 2: B2 ^ B1 -> G1 (pins 4, 5 -> 6; e_14, e_15 -> e_16)
        { from: 'e_6', to: 'e_14', color: 'green' },
        { from: 'e_7', to: 'e_15', color: 'green' },
        // Gate 3: B1 ^ B0 -> G0 (pins 9, 10 -> 8; f_16, f_15 -> f_17)
        { from: 'e_7', to: 'f_16', color: 'green' },
        { from: 'e_8', to: 'f_15', color: 'green' },
      ],
      leds: [
        { anode: 'e_5', cathode: 'railBottom-_5', label: 'G3' },
        { anode: 'e_13', cathode: 'railBottom-_13', label: 'G2' },
        { anode: 'e_16', cathode: 'railBottom-_16', label: 'G1' },
        { anode: 'f_17', cathode: 'railTop-_17', label: 'G0' },
      ],
    },
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
      { name: '7483 (Adder)', count: 1 },
      { name: 'LED', count: 5 },
    ],
    inputNames: ['A4', 'A3', 'A2', 'A1', 'B4', 'B3', 'B2', 'B1'],
    outputNames: ['C4', 'S4', 'S3', 'S2', 'S1'],
    steps: [
      'Place IC 7483 4-bit binary adder. Note: VCC is pin 5, GND is pin 12.',
      'Feed the 4-bit numbers A and B into Adder inputs with carry-in C0 tied to GND.',
      'Connect LEDs on sum outputs S1, S2, S3, S4, and carry out C4.',
      'Test addition with different binary values and verify the sum on the LEDs.',
    ],
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '7483', startCol: 10 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // 7483 (startCol 10): VCC pin 5 (e_14), GND pin 12 (f_13)
        { from: 'railTop+_14', to: 'e_14', color: 'red' },
        { from: 'railBottom-_13', to: 'f_13', color: 'black' },
        // C0 (pin 13, f_14) tied to GND
        { from: 'railTop-_14', to: 'f_14', color: 'black' },
        // Inputs A1..A4 and B1..B4 tied to rails
        // A1 (pin 10, e_19), A2 (pin 8, e_17), A3 (pin 3, e_12), A4 (pin 1, e_10)
        { from: 'railTop+_2', to: 'e_19', color: 'yellow', label: 'A1' },
        { from: 'railTop-_3', to: 'e_17', color: 'yellow', label: 'A2' },
        { from: 'railTop+_4', to: 'e_12', color: 'yellow', label: 'A3' },
        { from: 'railTop-_5', to: 'e_10', color: 'yellow', label: 'A4' },
        // B1 (pin 11, e_20), B2 (pin 7, e_16), B3 (pin 4, e_13), B4 (pin 16, f_11)
        { from: 'railTop+_6', to: 'e_20', color: 'yellow', label: 'B1' },
        { from: 'railTop+_7', to: 'e_16', color: 'yellow', label: 'B2' },
        { from: 'railTop-_8', to: 'e_13', color: 'yellow', label: 'B3' },
        { from: 'railTop-_9', to: 'f_11', color: 'yellow', label: 'B4' },
      ],
      leds: [
        // S1 (pin 9, e_18), S2 (pin 6, e_15), S3 (pin 2, e_11), S4 (pin 15, f_12), C4 (pin 14, f_15)
        { anode: 'e_18', cathode: 'railBottom-_18', label: 'S1' },
        { anode: 'e_15', cathode: 'railBottom-_15', label: 'S2' },
        { anode: 'e_11', cathode: 'railBottom-_11', label: 'S3' },
        { anode: 'f_12', cathode: 'railTop-_12', label: 'S4' },
        { anode: 'f_15', cathode: 'railTop-_15', label: 'C4' },
      ],
    },
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
      'For minterms where F=1 (1, 2, 4, 7), tie the corresponding data input (D0..D7) to the +5V rail.',
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
    preset: {
      ics: [
        { type: '74151', startCol: 10 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power 74151 (col 10): VCC pin 16 (f_10), GND pin 8 (e_17)
        { from: 'railTop+_10', to: 'f_10', color: 'red' },
        { from: 'railBottom-_17', to: 'e_17', color: 'black' },
        // Strobe E (pin 7, e_16) tied to GND (active low enable)
        { from: 'railBottom-_16', to: 'e_16', color: 'black' },
        // Select inputs: A (pin 11, f_15), B (pin 10, f_16), C (pin 9, f_17)
        { from: 'railTop+_2', to: 'f_15', color: 'yellow', label: 'A' },
        { from: 'railTop+_3', to: 'f_16', color: 'yellow', label: 'B' },
        { from: 'railTop+_4', to: 'f_17', color: 'yellow', label: 'C' },
        // Data inputs for minterms 1, 2, 4, 7:
        // D0 (pin 4, e_13) -> 0
        { from: 'railBottom-_13', to: 'e_13', color: 'black' },
        // D1 (pin 3, e_12) -> 1
        { from: 'railBottom+_12', to: 'e_12', color: 'red' },
        // D2 (pin 2, e_11) -> 1
        { from: 'railBottom+_11', to: 'e_11', color: 'red' },
        // D3 (pin 1, e_10) -> 0
        { from: 'railBottom-_10', to: 'e_10', color: 'black' },
        // D4 (pin 15, f_11) -> 1
        { from: 'railTop+_11', to: 'f_11', color: 'red' },
        // D5 (pin 14, f_12) -> 0
        { from: 'railTop-_12', to: 'f_12', color: 'black' },
        // D6 (pin 13, f_13) -> 0
        { from: 'railTop-_13', to: 'f_13', color: 'black' },
        // D7 (pin 12, f_14) -> 1
        { from: 'railTop+_14', to: 'f_14', color: 'red' },
      ],
      leds: [
        // Y output (pin 5, e_14)
        { anode: 'e_14', cathode: 'railBottom-_14', label: 'Y' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment 5: 2-bit comparator using logic gates / IC 7485
  // -----------------------------------------------------------------
  {
    id: 'exp5',
    number: '5',
    title: '2-bit Comparator (IC 7485)',
    category: 'Gates',
    aim: 'To design and wire a 2-bit magnitude comparator using the 4-bit magnitude comparator IC 7485 to compare two 2-bit numbers A (A1,A0) and B (B1,B0) and indicate A>B, A=B, and A<B on LEDs.',
    partsNeeded: [
      { name: '7485 (Comparator)', count: 1 },
      { name: 'LED', count: 3 },
    ],
    inputNames: ['A1', 'A0', 'B1', 'B0'],
    outputNames: ['A>B', 'A=B', 'A<B'],
    steps: [
      'Place IC 7485: Pin 16 to +5V (VCC), Pin 8 to GND.',
      'Cascading inputs: Connect I(A=B) (pin 3) to +5V rail, I(A>B) (pin 4) to GND, and I(A<B) (pin 2) to GND.',
      'Ground unused higher bits: A3 (pin 15), B3 (pin 1), A2 (pin 13), B2 (pin 14) to GND rail.',
      'Connect inputs A1 (pin 12), A0 (pin 10), B1 (pin 11), B0 (pin 9) to your input wires.',
      'Connect LEDs on outputs A>B (pin 5), A=B (pin 6), and A<B (pin 7) with cathodes to GND.',
      'Tap input wires on the power rails to compare different 2-bit binary values.',
    ],
    truthTable: generateComparatorTable(),
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '7485', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power 7485: Pin 16 (f_11) to VCC, Pin 8 (e_18) to GND
        { from: 'railTop+_11', to: 'f_11', color: 'red' },
        { from: 'railBottom-_18', to: 'e_18', color: 'black' },
        // Cascading: Pin 3 (e_13) to +5V; Pin 2 (e_12) to GND; Pin 4 (e_14) to GND
        { from: 'railBottom+_13', to: 'e_13', color: 'red' },
        { from: 'railBottom-_12', to: 'e_12', color: 'black' },
        { from: 'railBottom-_14', to: 'e_14', color: 'black' },
        // Unused: A3 (f_12), B3 (e_11), A2 (f_14), B2 (f_13) to GND
        { from: 'railTop-_12', to: 'f_12', color: 'black' },
        { from: 'railBottom-_11', to: 'e_11', color: 'black' },
        { from: 'railTop-_14', to: 'f_14', color: 'black' },
        { from: 'railTop-_13', to: 'f_13', color: 'black' },
        // Inputs A1 (f_15), A0 (f_17), B1 (f_16), B0 (f_18)
        { from: 'railTop+_2', to: 'f_15', color: 'yellow', label: 'A1' },
        { from: 'railTop-_3', to: 'f_17', color: 'yellow', label: 'A0' },
        { from: 'railTop-_4', to: 'f_16', color: 'yellow', label: 'B1' },
        { from: 'railTop+_5', to: 'f_18', color: 'yellow', label: 'B0' },
      ],
      leds: [
        { anode: 'e_15', cathode: 'railBottom-_15', label: 'A>B' },
        { anode: 'e_16', cathode: 'railBottom-_16', label: 'A=B' },
        { anode: 'e_17', cathode: 'railBottom-_17', label: 'A<B' },
      ],
    },
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
      { name: 'LED', count: 1 },
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
    preset: {
      ics: [
        { type: '7486', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // 7486 (col 11): VCC pin 14 (f_11), GND pin 7 (e_17)
        { from: 'railTop+_11', to: 'f_11', color: 'red' },
        { from: 'railBottom-_17', to: 'e_17', color: 'black' },
        // Inputs D2, D1, D0
        { from: 'railTop+_5', to: 'e_11', color: 'yellow', label: 'D2' },
        { from: 'railTop+_6', to: 'e_12', color: 'yellow', label: 'D1' },
        { from: 'railTop+_7', to: 'e_15', color: 'yellow', label: 'D0' },
        // Gate 1 out (pin 3, e_13) to Gate 2 in (pin 4, e_14)
        { from: 'e_13', to: 'e_14', color: 'green' },
      ],
      leds: [
        // P out from Gate 2 out (pin 6, e_16)
        { anode: 'e_16', cathode: 'railBottom-_16', label: 'P' },
      ],
    },
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
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // IC 7476 (startCol 10): Pin 5 = e_14 (VCC), Pin 13 = f_13 (GND)
        { from: 'railTop+_14', to: 'e_14', color: 'red' },
        { from: 'railBottom-_13', to: 'f_13', color: 'black' },
        // PRE & CLR tied to +5V:
        { from: 'railTop+_11', to: 'e_11', color: 'red' },
        { from: 'railTop+_12', to: 'e_12', color: 'red' },
        { from: 'railTop+_16', to: 'e_16', color: 'red' },
        { from: 'railTop+_17', to: 'e_17', color: 'red' },
        // J & K tied to +5V:
        { from: 'railTop+_13', to: 'e_13', color: 'red' },
        { from: 'railBottom+_10', to: 'f_10', color: 'red' },
        { from: 'railBottom+_17', to: 'f_17', color: 'red' },
        { from: 'railBottom+_14', to: 'f_14', color: 'red' },
        // Clock 1 OUT to FF1 CLK (pin 1, e_10)
        { from: 'socket-clk1', to: 'e_10', color: 'green' },
        // FF1 1Q (pin 15, f_11) to FF2 2CLK (pin 6, e_15)
        { from: 'f_11', to: 'e_15', color: 'yellow' },
      ],
      leds: [
        { anode: 'f_11', cathode: 'railBottom-_11', label: 'Q0' },
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
    preset: {
      ics: [
        { type: '7476', startCol: 8 },
        { type: '7486', startCol: 20 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // 7476 (startCol 8): Pin 5 = e_12 (VCC), Pin 13 = f_11 (GND)
        { from: 'railTop+_12', to: 'e_12', color: 'red' },
        { from: 'railBottom-_11', to: 'f_11', color: 'black' },
        // 7486 (startCol 20): Pin 14 = f_20 (VCC), Pin 7 = e_26 (GND)
        { from: 'railTop+_20', to: 'f_20', color: 'red' },
        { from: 'railBottom-_26', to: 'e_26', color: 'black' },
        // PRE & CLR tied to +5V:
        { from: 'railTop+_9', to: 'e_9', color: 'red' },
        { from: 'railTop+_10', to: 'e_10', color: 'red' },
        { from: 'railTop+_14', to: 'e_14', color: 'red' },
        { from: 'railTop+_15', to: 'e_15', color: 'red' },
        // J0 & K0 tied to +5V (FF0 always toggles)
        { from: 'railTop+_11', to: 'e_11', color: 'red' },
        { from: 'railBottom+_8', to: 'f_8', color: 'red' },
        // Shared Clock 1 OUT to 1CLK (e_8) and 2CLK (e_13)
        { from: 'socket-clk1', to: 'e_8', color: 'green' },
        { from: 'e_8', to: 'e_13', color: 'green' },
        // Mode control M on rail
        { from: 'railTop-_2', to: 'e_20', color: 'yellow', label: 'M' },
        // Q0 (f_9) to XOR gate 1 input (e_21)
        { from: 'f_9', to: 'e_21', color: 'green' },
        // XOR gate 1 out (e_22) to J1 (f_15) and K1 (f_12)
        { from: 'e_22', to: 'f_15', color: 'yellow' },
        { from: 'f_15', to: 'f_12', color: 'yellow' },
      ],
      leds: [
        { anode: 'f_9', cathode: 'railBottom-_9', label: 'Q0' },
        { anode: 'f_13', cathode: 'railBottom-_13', label: 'Q1' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment 9: Modulo-N counter using Decade counter IC 7490
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
    preset: {
      ics: [
        { type: '7490', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // 7490 (startCol 11): Pin 5 = e_15 (VCC), Pin 10 = f_15 (GND)
        { from: 'railTop+_15', to: 'e_15', color: 'red' },
        { from: 'railBottom-_15', to: 'f_15', color: 'black' },
        // CLOCK 1 OUT to CKA (pin 14, f_11)
        { from: 'socket-clk1', to: 'f_11', color: 'green' },
        // QA (pin 12, f_13) to CKB (pin 1, e_11) for BCD ripple
        { from: 'f_13', to: 'e_11', color: 'yellow' },
        // R9(1) pin 6 (e_16) & R9(2) pin 7 (e_17) tied to GND
        { from: 'railBottom-_16', to: 'e_16', color: 'black' },
        { from: 'railBottom-_17', to: 'e_17', color: 'black' },
        // Mod-6 reset: QC (pin 8, f_17) -> R0(1) (pin 2, e_12)
        // QB (pin 9, f_16) -> R0(2) (pin 3, e_13)
        { from: 'f_17', to: 'e_12', color: 'green' },
        { from: 'f_16', to: 'e_13', color: 'green' },
      ],
      leds: [
        { anode: 'f_13', cathode: 'railTop-_13', label: 'QA' },
        { anode: 'f_16', cathode: 'railTop-_16', label: 'QB' },
        { anode: 'f_17', cathode: 'railTop-_17', label: 'QC' },
        { anode: 'f_14', cathode: 'railTop-_14', label: 'QD' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment 10: Sequence generator and detector using JK flip-flop
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // Experiment 10: Sequence generator using JK flip-flop (7476)
  // -----------------------------------------------------------------
  {
    id: 'exp10',
    number: '10',
    title: 'Sequence generator using JK flip-flop (7476)',
    category: 'Sequential',
    aim: 'To design and wire a 2-bit sequence generator (00 -> 01 -> 11 -> 10 -> 00) using JK flip-flop IC 7476, driven by CLOCK 1 OUT, and observe sequential state transitions on LEDs.',
    partsNeeded: [
      { name: '7476 (Dual JK FF)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['CLK'],
    outputNames: ['Q1', 'Q0'],
    steps: [
      'Place IC 7476: Pin 5 = VCC (+5V), Pin 13 = GND.',
      'Tie all PRE and CLR inputs (pins 2, 3, 7, 8) to the +5V rail.',
      'Connect CLOCK 1 OUT to both flip-flop clock pins (pin 1 and pin 6).',
      'Feedback for Johnson sequence: J0 (pin 4) to 2Q~ (pin 10), K0 (pin 16) to 2Q (pin 11).',
      'J1 (pin 9) to 1Q (pin 15), K1 (pin 12) to 1Q~ (pin 14).',
      'Connect LEDs on Q1 (pin 11) and Q0 (pin 15) with cathodes to GND.',
      'Press Run or Pulse to observe the counting sequence 00 -> 01 -> 11 -> 10 -> 00.',
    ],
    isSequential: true,
    checkerType: 'sequential',
    expectedSequence: [
      { step: 0, clock: 0, outputs: { Q1: 0, Q0: 0 } },
      { step: 1, clock: 1, outputs: { Q1: 0, Q0: 1 } },
      { step: 2, clock: 2, outputs: { Q1: 1, Q0: 1 } },
      { step: 3, clock: 3, outputs: { Q1: 1, Q0: 0 } },
      { step: 4, clock: 4, outputs: { Q1: 0, Q0: 0 } },
    ],
    preset: {
      ics: [
        { type: '7476', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power: VCC pin 5 (e_15), GND pin 13 (f_14)
        { from: 'railTop+_15', to: 'e_15', color: 'red' },
        { from: 'railTop-_14', to: 'f_14', color: 'black' },
        // Inactive PRE/CLR to +5V: Pin 2 (e_12), Pin 3 (e_13), Pin 7 (e_17), Pin 8 (e_18)
        { from: 'railBottom+_12', to: 'e_12', color: 'red' },
        { from: 'railBottom+_13', to: 'e_13', color: 'red' },
        { from: 'railBottom+_17', to: 'e_17', color: 'red' },
        { from: 'railBottom+_18', to: 'e_18', color: 'red' },
        // Shared Clock 1 OUT to 1CLK (e_11) and 2CLK (e_16)
        { from: 'socket-clk1', to: 'e_11', color: 'green' },
        { from: 'e_11', to: 'e_16', color: 'green' },
        // J0 (pin 4, e_14) <- 2Q~ (pin 10, f_17)
        { from: 'f_17', to: 'e_14', color: 'yellow' },
        // K0 (pin 16, f_11) <- 2Q (pin 11, f_16)
        { from: 'f_16', to: 'f_11', color: 'yellow' },
        // J1 (pin 9, f_18) <- 1Q (pin 15, f_12)
        { from: 'f_12', to: 'f_18', color: 'yellow' },
        // K1 (pin 12, f_15) <- 1Q~ (pin 14, f_13)
        { from: 'f_13', to: 'f_15', color: 'yellow' },
      ],
      leds: [
        { anode: 'f_16', cathode: 'railTop-_16', label: 'Q1' },
        { anode: 'f_12', cathode: 'railTop-_12', label: 'Q0' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment A1: Full Subtractor using logic gates
  // -----------------------------------------------------------------
  {
    id: 'expA1',
    number: 'A1',
    title: 'Full Subtractor using logic gates (7486, 7400)',
    category: 'Gates',
    aim: 'To design and implement a Full Subtractor circuit using XOR (7486) and NAND (7400) gates and verify its truth table for Difference (Diff) and Borrow out (Bout).',
    partsNeeded: [
      { name: '7486 (XOR)', count: 1 },
      { name: '7400 (NAND)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['A', 'B', 'Bin'],
    outputNames: ['Diff', 'Bout'],
    steps: [
      'Place IC 7486 (XOR) and IC 7400 (NAND); connect pin 14 to +5V and pin 7 to GND for both.',
      'Difference: Feed A and B into XOR gate 1 (pins 1, 2). Connect output (pin 3) and Bin to XOR gate 2 (pins 4, 5). Pin 6 gives Diff.',
      'Inverters via 7486: Tie pin 10 to +5V so gate 3 inverts pin 9 (A) -> output pin 8 is ~A. Tie pin 13 to +5V so gate 4 inverts pin 12 (A xor B) -> output pin 11 is ~(A xor B).',
      'Borrow via NAND gates: NAND ~A with B on gate 1 (pins 1, 2). NAND ~(A xor B) with Bin on gate 2 (pins 4, 5).',
      'Combine outputs in NAND gate 3 (pins 9, 10). Pin 8 produces Bout.',
      'Verify all 8 rows on Diff and Bout LEDs.',
    ],
    truthTable: generateFullSubtractorTable(),
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '7486', startCol: 6 },
        { type: '7400', startCol: 18 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power 7486: Pin 14 (f_6) to VCC, Pin 7 (e_12) to GND
        { from: 'railTop+_6', to: 'f_6', color: 'red' },
        { from: 'railBottom-_12', to: 'e_12', color: 'black' },
        // Power 7400: Pin 14 (f_18) to VCC, Pin 7 (e_24) to GND
        { from: 'railTop+_18', to: 'f_18', color: 'red' },
        { from: 'railBottom-_24', to: 'e_24', color: 'black' },
        // Inverters on 7486: Pin 10 (f_10) to +5V; Pin 13 (f_7) to +5V
        { from: 'railTop+_10', to: 'f_10', color: 'red' },
        { from: 'railTop+_7', to: 'f_7', color: 'red' },
        // Inputs A, B, Bin
        { from: 'railTop+_2', to: 'e_6', color: 'yellow', label: 'A' },
        { from: 'e_6', to: 'f_11', color: 'yellow' },
        { from: 'railTop+_3', to: 'e_7', color: 'yellow', label: 'B' },
        { from: 'e_7', to: 'e_19', color: 'yellow' },
        { from: 'railTop+_4', to: 'e_10', color: 'yellow', label: 'Bin' },
        { from: 'e_10', to: 'e_22', color: 'yellow' },
        // XOR 1 out (e_8) to XOR 2 in (e_9) and to Inverter in (f_8)
        { from: 'e_8', to: 'e_9', color: 'green' },
        { from: 'e_8', to: 'f_8', color: 'green' },
        // NAND 1: ~A (f_12) to e_18
        { from: 'f_12', to: 'e_18', color: 'green' },
        // NAND 2: ~(A^B) (f_9) to e_21
        { from: 'f_9', to: 'e_21', color: 'green' },
        // NAND 3: inputs from NAND 1 out (e_20 -> f_23) and NAND 2 out (e_23 -> f_22)
        { from: 'e_20', to: 'f_23', color: 'green' },
        { from: 'e_23', to: 'f_22', color: 'green' },
      ],
      leds: [
        { anode: 'e_11', cathode: 'railBottom-_11', label: 'Diff' },
        { anode: 'f_24', cathode: 'railTop-_24', label: 'Bout' },
      ],
    },
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
      'Place IC 7483: connect Pin 5 to +5V (VCC), Pin 12 to GND.',
      'Connect BCD inputs B0..B3 to adder A inputs: B0 to A1 (pin 10), B1 to A2 (pin 8), B2 to A3 (pin 3), B3 to A4 (pin 1).',
      'Tie B inputs to binary 3 (0011): B1 (pin 11) to +5V, B2 (pin 7) to +5V, B3 (pin 4) to GND, B4 (pin 16) to GND.',
      'Tie carry input C0 (pin 13) to GND.',
      'Outputs S1..S4 produce the Excess-3 digits E0..E3.',
    ],
    truthTable: generateBcdToExcess3Table(),
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '7483', startCol: 11 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power: VCC pin 5 (e_15), GND pin 12 (f_15)
        { from: 'railTop+_15', to: 'e_15', color: 'red' },
        { from: 'railTop-_15', to: 'f_15', color: 'black' },
        // C0 pin 13 (f_14) to GND
        { from: 'railTop-_14', to: 'f_14', color: 'black' },
        // B inputs tied to 3 (binary 0011):
        { from: 'railTop+_16', to: 'f_16', color: 'red' },
        { from: 'railBottom+_17', to: 'e_17', color: 'red' },
        { from: 'railBottom-_14', to: 'e_14', color: 'black' },
        { from: 'railTop-_11', to: 'f_11', color: 'black' },
        // A inputs from BCD inputs B0..B3:
        { from: 'railTop+_2', to: 'f_17', color: 'yellow', label: 'B0' },
        { from: 'railTop-_3', to: 'e_18', color: 'yellow', label: 'B1' },
        { from: 'railTop-_4', to: 'e_13', color: 'yellow', label: 'B2' },
        { from: 'railTop-_5', to: 'e_11', color: 'yellow', label: 'B3' },
      ],
      leds: [
        { anode: 'f_18', cathode: 'railTop-_18', label: 'E0' },
        { anode: 'e_16', cathode: 'railBottom-_16', label: 'E1' },
        { anode: 'e_12', cathode: 'railBottom-_12', label: 'E2' },
        { anode: 'f_12', cathode: 'railTop-_12', label: 'E3' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment A3: Full Adder using Decoder (74138)
  // -----------------------------------------------------------------
  {
    id: 'expA3',
    number: 'A3',
    title: 'Full Adder using 3-to-8 Decoder (74138)',
    category: 'Mux-Demux',
    aim: 'To implement a Full Adder using the active-low 3-to-8 decoder IC 74138 and multi-input NAND gates (7420).',
    partsNeeded: [
      { name: '74138 (Decoder)', count: 1 },
      { name: '7420 (4-input NAND)', count: 1 },
      { name: 'LED', count: 2 },
    ],
    inputNames: ['A', 'B', 'Cin'],
    outputNames: ['Sum', 'Cout'],
    steps: [
      'Place IC 74138: Pin 16 to +5V, Pin 8 to GND. Enable it: G1=1, G2A=0, G2B=0.',
      'Connect inputs A (pin 1), B (pin 2), Cin (pin 3) to your input wires.',
      'Sum = Σm(1,2,4,7). Connect decoder outputs Y1, Y2, Y4, Y7 into 7420 NAND gate 1 (pins 1, 2, 4, 5). Pin 6 gives Sum.',
      'Cout = Σm(3,5,6,7). Connect decoder outputs Y3, Y5, Y6, Y7 into 7420 NAND gate 2 (pins 9, 10, 12, 13). Pin 8 gives Cout.',
      'Verify all 8 rows on Sum and Cout LEDs.',
    ],
    truthTable: generateFullAdderTable(),
    checkerType: 'combinational',
    preset: {
      ics: [
        { type: '74138', startCol: 6 },
        { type: '7420', startCol: 18 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power 74138: Pin 16 (f_6) to VCC, Pin 8 (e_13) to GND
        { from: 'railTop+_6', to: 'f_6', color: 'red' },
        { from: 'railBottom-_13', to: 'e_13', color: 'black' },
        // Power 7420: Pin 14 (f_18) to VCC, Pin 7 (e_24) to GND
        { from: 'railTop+_18', to: 'f_18', color: 'red' },
        { from: 'railBottom-_24', to: 'e_24', color: 'black' },
        // 74138 enables: G1 (pin 6, e_11) to +5V; G2A (pin 4, e_9) to GND; G2B (pin 5, e_10) to GND
        { from: 'railBottom+_11', to: 'e_11', color: 'red' },
        { from: 'railBottom-_9', to: 'e_9', color: 'black' },
        { from: 'railBottom-_10', to: 'e_10', color: 'black' },
        // Inputs: A (pin 1, e_6), B (pin 2, e_7), Cin (pin 3, e_8)
        { from: 'railTop+_2', to: 'e_6', color: 'yellow', label: 'A' },
        { from: 'railTop+_3', to: 'e_7', color: 'yellow', label: 'B' },
        { from: 'railTop+_4', to: 'e_8', color: 'yellow', label: 'Cin' },
        // Sum = NAND(Y1, Y2, Y4, Y7) into 7420 gate 1 (pins 1, 2, 4, 5)
        { from: 'f_8', to: 'e_18', color: 'green' },
        { from: 'f_9', to: 'e_19', color: 'green' },
        { from: 'f_11', to: 'e_21', color: 'green' },
        { from: 'e_12', to: 'e_22', color: 'green' },
        // Cout = NAND(Y3, Y5, Y6, Y7) into 7420 gate 2 (pins 9, 10, 12, 13)
        { from: 'f_10', to: 'f_23', color: 'green' },
        { from: 'f_12', to: 'f_22', color: 'green' },
        { from: 'f_13', to: 'f_20', color: 'green' },
        { from: 'e_12', to: 'f_19', color: 'green' },
      ],
      leds: [
        { anode: 'e_23', cathode: 'railBottom-_23', label: 'Sum' },
        { anode: 'f_24', cathode: 'railTop-_24', label: 'Cout' },
      ],
    },
  },

  // -----------------------------------------------------------------
  // Experiment A4: Shift register using D Flip-Flop (7474)
  // -----------------------------------------------------------------
  {
    id: 'expA4',
    number: 'A4',
    title: '4-bit Serial-In Serial-Out Shift Register (7474)',
    category: 'Registers',
    aim: 'To wire a 4-bit SISO shift register using two 7474 dual D flip-flop ICs and observe data shifting sequentially on positive clock edges.',
    partsNeeded: [
      { name: '7474 (Dual D FF)', count: 2 },
      { name: 'LED', count: 4 },
    ],
    inputNames: ['Data', 'CLK'],
    outputNames: ['Q3', 'Q2', 'Q1', 'Q0'],
    steps: [
      'Place two 7474 ICs; connect pin 14 to +5V and pin 7 to GND for both.',
      'Tie all CLR and PRE pins (pins 1, 4, 10, 13) to +5V rail.',
      'Connect CLOCK 1 OUT to the clock pins (pins 3, 11) of both flip-flops.',
      'Wire Data input to 1D (pin 2) of the first IC.',
      'Cascade: 1Q (pin 5) to 2D (pin 12), 2Q (pin 9) to 3D (pin 2), 3Q (pin 5) to 4D (pin 12).',
      'Place LEDs on each Q output (Q0, Q1, Q2, Q3) to observe data shifting from left to right.',
    ],
    isSequential: true,
    checkerType: 'sequential',
    expectedSequence: [
      { step: 0, clock: 0, outputs: { Q3: 0, Q2: 0, Q1: 0, Q0: 0 } },
      { step: 1, clock: 1, outputs: { Q3: 0, Q2: 0, Q1: 0, Q0: 1 } },
      { step: 2, clock: 2, outputs: { Q3: 0, Q2: 0, Q1: 1, Q0: 1 } },
      { step: 3, clock: 3, outputs: { Q3: 0, Q2: 1, Q1: 1, Q0: 1 } },
      { step: 4, clock: 4, outputs: { Q3: 1, Q2: 1, Q1: 1, Q0: 1 } },
    ],
    preset: {
      ics: [
        { type: '7474', startCol: 6 },
        { type: '7474', startCol: 18 },
      ],
      wires: [
        { from: 'socket-vcc', to: 'railTop+_1', color: 'red' },
        { from: 'socket-gnd', to: 'railTop-_1', color: 'black' },
        { from: 'railTop+_30', to: 'railBottom+_30', color: 'red' },
        { from: 'railTop-_30', to: 'railBottom-_30', color: 'black' },
        // Power IC 1: VCC (f_6), GND (e_12)
        { from: 'railTop+_6', to: 'f_6', color: 'red' },
        { from: 'railBottom-_12', to: 'e_12', color: 'black' },
        // Power IC 2: VCC (f_18), GND (e_24)
        { from: 'railTop+_18', to: 'f_18', color: 'red' },
        { from: 'railBottom-_24', to: 'e_24', color: 'black' },
        // Inactive PRE/CLR (+5V):
        { from: 'railBottom+_6', to: 'e_6', color: 'red' },
        { from: 'railBottom+_9', to: 'e_9', color: 'red' },
        { from: 'railTop+_7', to: 'f_7', color: 'red' },
        { from: 'railTop+_10', to: 'f_10', color: 'red' },
        { from: 'railBottom+_18', to: 'e_18', color: 'red' },
        { from: 'railBottom+_21', to: 'e_21', color: 'red' },
        { from: 'railTop+_19', to: 'f_19', color: 'red' },
        { from: 'railTop+_22', to: 'f_22', color: 'red' },
        // Shared Clock: 1CLK (e_8), 2CLK (f_9), 3CLK (e_20), 4CLK (f_21)
        { from: 'socket-clk1', to: 'e_8', color: 'green' },
        { from: 'e_8', to: 'f_9', color: 'green' },
        { from: 'f_9', to: 'e_20', color: 'green' },
        { from: 'e_20', to: 'f_21', color: 'green' },
        // Serial Data Input to 1D (e_7)
        { from: 'railTop+_2', to: 'e_7', color: 'yellow', label: 'Data' },
        // Cascades:
        { from: 'e_10', to: 'f_8', color: 'yellow' },
        { from: 'f_11', to: 'e_19', color: 'yellow' },
        { from: 'e_22', to: 'f_20', color: 'yellow' },
      ],
      leds: [
        { anode: 'e_10', cathode: 'railBottom-_10', label: 'Q0' },
        { anode: 'f_11', cathode: 'railTop-_11', label: 'Q1' },
        { anode: 'e_22', cathode: 'railBottom-_22', label: 'Q2' },
        { anode: 'f_23', cathode: 'railTop-_23', label: 'Q3' },
      ],
    },
  },
];
