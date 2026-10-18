/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IcDefinition, SignalValue } from '../types';

/**
 * Resolves a signal to a binary 0 or 1 according to TTL logic rules.
 * Unconnected (FLOAT) inputs float HIGH (1).
 */
export function toTtlBit(val: SignalValue | undefined): number {
  if (val === 0) return 0;
  return 1; // 1, 'FLOAT', or undefined default to 1 in TTL
}

export const IC_CATALOG: Record<string, IcDefinition> = {
  // -------------------------------------------------------------
  // 7400: Quad 2-Input NAND
  // -------------------------------------------------------------
  '7400': {
    id: '7400',
    name: '7400',
    description: 'Quad 2-Input NAND Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: '1Y', isOutput: true },
      { pinNumber: 4, name: '2A', isInput: true },
      { pinNumber: 5, name: '2B', isInput: true },
      { pinNumber: 6, name: '2Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3Y', isOutput: true },
      { pinNumber: 9, name: '3A', isInput: true },
      { pinNumber: 10, name: '3B', isInput: true },
      { pinNumber: 11, name: '4Y', isOutput: true },
      { pinNumber: 12, name: '4A', isInput: true },
      { pinNumber: 13, name: '4B', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = !(toTtlBit(inputs[1]) && toTtlBit(inputs[2])) ? 1 : 0;
      const g2 = !(toTtlBit(inputs[4]) && toTtlBit(inputs[5])) ? 1 : 0;
      const g3 = !(toTtlBit(inputs[9]) && toTtlBit(inputs[10])) ? 1 : 0;
      const g4 = !(toTtlBit(inputs[12]) && toTtlBit(inputs[13])) ? 1 : 0;
      return { 3: g1, 6: g2, 8: g3, 11: g4 };
    },
  },

  // -------------------------------------------------------------
  // 7408: Quad 2-Input AND
  // -------------------------------------------------------------
  '7408': {
    id: '7408',
    name: '7408',
    description: 'Quad 2-Input AND Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: '1Y', isOutput: true },
      { pinNumber: 4, name: '2A', isInput: true },
      { pinNumber: 5, name: '2B', isInput: true },
      { pinNumber: 6, name: '2Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3Y', isOutput: true },
      { pinNumber: 9, name: '3A', isInput: true },
      { pinNumber: 10, name: '3B', isInput: true },
      { pinNumber: 11, name: '4Y', isOutput: true },
      { pinNumber: 12, name: '4A', isInput: true },
      { pinNumber: 13, name: '4B', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = toTtlBit(inputs[1]) && toTtlBit(inputs[2]) ? 1 : 0;
      const g2 = toTtlBit(inputs[4]) && toTtlBit(inputs[5]) ? 1 : 0;
      const g3 = toTtlBit(inputs[9]) && toTtlBit(inputs[10]) ? 1 : 0;
      const g4 = toTtlBit(inputs[12]) && toTtlBit(inputs[13]) ? 1 : 0;
      return { 3: g1, 6: g2, 8: g3, 11: g4 };
    },
  },

  // -------------------------------------------------------------
  // 7432: Quad 2-Input OR
  // -------------------------------------------------------------
  '7432': {
    id: '7432',
    name: '7432',
    description: 'Quad 2-Input OR Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: '1Y', isOutput: true },
      { pinNumber: 4, name: '2A', isInput: true },
      { pinNumber: 5, name: '2B', isInput: true },
      { pinNumber: 6, name: '2Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3Y', isOutput: true },
      { pinNumber: 9, name: '3A', isInput: true },
      { pinNumber: 10, name: '3B', isInput: true },
      { pinNumber: 11, name: '4Y', isOutput: true },
      { pinNumber: 12, name: '4A', isInput: true },
      { pinNumber: 13, name: '4B', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = toTtlBit(inputs[1]) || toTtlBit(inputs[2]) ? 1 : 0;
      const g2 = toTtlBit(inputs[4]) || toTtlBit(inputs[5]) ? 1 : 0;
      const g3 = toTtlBit(inputs[9]) || toTtlBit(inputs[10]) ? 1 : 0;
      const g4 = toTtlBit(inputs[12]) || toTtlBit(inputs[13]) ? 1 : 0;
      return { 3: g1, 6: g2, 8: g3, 11: g4 };
    },
  },

  // -------------------------------------------------------------
  // 7486: Quad 2-Input XOR
  // -------------------------------------------------------------
  '7486': {
    id: '7486',
    name: '7486',
    description: 'Quad 2-Input XOR Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: '1Y', isOutput: true },
      { pinNumber: 4, name: '2A', isInput: true },
      { pinNumber: 5, name: '2B', isInput: true },
      { pinNumber: 6, name: '2Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3Y', isOutput: true },
      { pinNumber: 9, name: '3A', isInput: true },
      { pinNumber: 10, name: '3B', isInput: true },
      { pinNumber: 11, name: '4Y', isOutput: true },
      { pinNumber: 12, name: '4A', isInput: true },
      { pinNumber: 13, name: '4B', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = toTtlBit(inputs[1]) ^ toTtlBit(inputs[2]);
      const g2 = toTtlBit(inputs[4]) ^ toTtlBit(inputs[5]);
      const g3 = toTtlBit(inputs[9]) ^ toTtlBit(inputs[10]);
      const g4 = toTtlBit(inputs[12]) ^ toTtlBit(inputs[13]);
      return { 3: g1 as 0 | 1, 6: g2 as 0 | 1, 8: g3 as 0 | 1, 11: g4 as 0 | 1 };
    },
  },

  // -------------------------------------------------------------
  // 7402: Quad 2-Input NOR
  // Pins: (2,3)->1 ; (5,6)->4 ; (8,9)->10 ; (11,12)->13
  // -------------------------------------------------------------
  '7402': {
    id: '7402',
    name: '7402',
    description: 'Quad 2-Input NOR Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1Y', isOutput: true },
      { pinNumber: 2, name: '1A', isInput: true },
      { pinNumber: 3, name: '1B', isInput: true },
      { pinNumber: 4, name: '2Y', isOutput: true },
      { pinNumber: 5, name: '2A', isInput: true },
      { pinNumber: 6, name: '2B', isInput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3A', isInput: true },
      { pinNumber: 9, name: '3B', isInput: true },
      { pinNumber: 10, name: '3Y', isOutput: true },
      { pinNumber: 11, name: '4A', isInput: true },
      { pinNumber: 12, name: '4B', isInput: true },
      { pinNumber: 13, name: '4Y', isOutput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = !(toTtlBit(inputs[2]) || toTtlBit(inputs[3])) ? 1 : 0;
      const g2 = !(toTtlBit(inputs[5]) || toTtlBit(inputs[6])) ? 1 : 0;
      const g3 = !(toTtlBit(inputs[8]) || toTtlBit(inputs[9])) ? 1 : 0;
      const g4 = !(toTtlBit(inputs[11]) || toTtlBit(inputs[12])) ? 1 : 0;
      return { 1: g1, 4: g2, 10: g3, 13: g4 };
    },
  },

  // -------------------------------------------------------------
  // 7404: Hex Inverter (NOT)
  // Pins: 1->2 ; 3->4 ; 5->6 ; 9->8 ; 11->10 ; 13->12
  // -------------------------------------------------------------
  '7404': {
    id: '7404',
    name: '7404',
    description: 'Hex Inverting Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1Y', isOutput: true },
      { pinNumber: 3, name: '2A', isInput: true },
      { pinNumber: 4, name: '2Y', isOutput: true },
      { pinNumber: 5, name: '3A', isInput: true },
      { pinNumber: 6, name: '3Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '4Y', isOutput: true },
      { pinNumber: 9, name: '4A', isInput: true },
      { pinNumber: 10, name: '5Y', isOutput: true },
      { pinNumber: 11, name: '5A', isInput: true },
      { pinNumber: 12, name: '6Y', isOutput: true },
      { pinNumber: 13, name: '6A', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      return {
        2: toTtlBit(inputs[1]) === 0 ? 1 : 0,
        4: toTtlBit(inputs[3]) === 0 ? 1 : 0,
        6: toTtlBit(inputs[5]) === 0 ? 1 : 0,
        8: toTtlBit(inputs[9]) === 0 ? 1 : 0,
        10: toTtlBit(inputs[11]) === 0 ? 1 : 0,
        12: toTtlBit(inputs[13]) === 0 ? 1 : 0,
      };
    },
  },

  // -------------------------------------------------------------
  // 7410: Triple 3-Input NAND
  // Pins: (1,2,13)->12 ; (3,4,5)->6 ; (9,10,11)->8
  // -------------------------------------------------------------
  '7410': {
    id: '7410',
    name: '7410',
    description: 'Triple 3-Input NAND Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: '2A', isInput: true },
      { pinNumber: 4, name: '2B', isInput: true },
      { pinNumber: 5, name: '2C', isInput: true },
      { pinNumber: 6, name: '2Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '3Y', isOutput: true },
      { pinNumber: 9, name: '3A', isInput: true },
      { pinNumber: 10, name: '3B', isInput: true },
      { pinNumber: 11, name: '3C', isInput: true },
      { pinNumber: 12, name: '1Y', isOutput: true },
      { pinNumber: 13, name: '1C', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = !(toTtlBit(inputs[1]) && toTtlBit(inputs[2]) && toTtlBit(inputs[13])) ? 1 : 0;
      const g2 = !(toTtlBit(inputs[3]) && toTtlBit(inputs[4]) && toTtlBit(inputs[5])) ? 1 : 0;
      const g3 = !(toTtlBit(inputs[9]) && toTtlBit(inputs[10]) && toTtlBit(inputs[11])) ? 1 : 0;
      return { 12: g1, 6: g2, 8: g3 };
    },
  },

  // -------------------------------------------------------------
  // 7420: Dual 4-Input NAND
  // Pins: (1,2,4,5)->6 ; (9,10,12,13)->8 ; pins 3, 11 NC
  // -------------------------------------------------------------
  '7420': {
    id: '7420',
    name: '7420',
    description: 'Dual 4-Input NAND Gates',
    category: 'gate',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1A', isInput: true },
      { pinNumber: 2, name: '1B', isInput: true },
      { pinNumber: 3, name: 'NC' },
      { pinNumber: 4, name: '1C', isInput: true },
      { pinNumber: 5, name: '1D', isInput: true },
      { pinNumber: 6, name: '1Y', isOutput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '2Y', isOutput: true },
      { pinNumber: 9, name: '2A', isInput: true },
      { pinNumber: 10, name: '2B', isInput: true },
      { pinNumber: 11, name: 'NC' },
      { pinNumber: 12, name: '2C', isInput: true },
      { pinNumber: 13, name: '2D', isInput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = !(toTtlBit(inputs[1]) && toTtlBit(inputs[2]) && toTtlBit(inputs[4]) && toTtlBit(inputs[5])) ? 1 : 0;
      const g2 = !(toTtlBit(inputs[9]) && toTtlBit(inputs[10]) && toTtlBit(inputs[12]) && toTtlBit(inputs[13])) ? 1 : 0;
      return { 6: g1, 8: g2 };
    },
  },

  // -------------------------------------------------------------
  // 7483: 4-Bit Binary Full Adder
  // 16-pin. VCC = pin 5, GND = pin 12.
  // A1=10, A2=8, A3=3, A4=1 ; B1=11, B2=7, B3=4, B4=16 ; C0=13 ; S1=9, S2=6, S3=2, S4=15 ; C4=14
  // -------------------------------------------------------------
  '7483': {
    id: '7483',
    name: '7483',
    description: '4-Bit Binary Full Adder with Fast Carry',
    category: 'arithmetic',
    pinCount: 16,
    vccPin: 5,
    gndPin: 12,
    pins: [
      { pinNumber: 1, name: 'A4', isInput: true },
      { pinNumber: 2, name: 'S3', isOutput: true },
      { pinNumber: 3, name: 'A3', isInput: true },
      { pinNumber: 4, name: 'B3', isInput: true },
      { pinNumber: 5, name: 'VCC', isVcc: true },
      { pinNumber: 6, name: 'S2', isOutput: true },
      { pinNumber: 7, name: 'B2', isInput: true },
      { pinNumber: 8, name: 'A2', isInput: true },
      { pinNumber: 9, name: 'S1', isOutput: true },
      { pinNumber: 10, name: 'A1', isInput: true },
      { pinNumber: 11, name: 'B1', isInput: true },
      { pinNumber: 12, name: 'GND', isGnd: true },
      { pinNumber: 13, name: 'C0', isInput: true },
      { pinNumber: 14, name: 'C4', isOutput: true },
      { pinNumber: 15, name: 'S4', isOutput: true },
      { pinNumber: 16, name: 'B4', isInput: true },
    ],
    evaluate: (inputs) => {
      const a1 = toTtlBit(inputs[10]);
      const a2 = toTtlBit(inputs[8]);
      const a3 = toTtlBit(inputs[3]);
      const a4 = toTtlBit(inputs[1]);

      const b1 = toTtlBit(inputs[11]);
      const b2 = toTtlBit(inputs[7]);
      const b3 = toTtlBit(inputs[4]);
      const b4 = toTtlBit(inputs[16]);

      const c0 = toTtlBit(inputs[13]);

      const a = a1 | (a2 << 1) | (a3 << 2) | (a4 << 3);
      const b = b1 | (b2 << 1) | (b3 << 2) | (b4 << 3);
      const sum = a + b + c0;

      const s1 = (sum & 0x01) ? 1 : 0;
      const s2 = (sum & 0x02) ? 1 : 0;
      const s3 = (sum & 0x04) ? 1 : 0;
      const s4 = (sum & 0x08) ? 1 : 0;
      const c4 = (sum & 0x10) ? 1 : 0;

      return { 9: s1, 6: s2, 2: s3, 15: s4, 14: c4 };
    },
  },

  // -------------------------------------------------------------
  // 7485: 4-Bit Magnitude Comparator
  // 16-pin. VCC = 16, GND = 8.
  // A inputs: A0=10, A1=12, A2=13, A3=15
  // B inputs: B0=9, B1=11, B2=14, B3=1
  // Cascading inputs: A<B_in=2, A=B_in=3, A>B_in=4
  // Outputs: A>B=5, A=B=6, A<B=7
  // -------------------------------------------------------------
  '7485': {
    id: '7485',
    name: '7485',
    description: '4-Bit Magnitude Comparator',
    category: 'arithmetic',
    pinCount: 16,
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pinNumber: 1, name: 'B3', isInput: true },
      { pinNumber: 2, name: 'I(A<B)', isInput: true },
      { pinNumber: 3, name: 'I(A=B)', isInput: true },
      { pinNumber: 4, name: 'I(A>B)', isInput: true },
      { pinNumber: 5, name: 'A>B', isOutput: true },
      { pinNumber: 6, name: 'A=B', isOutput: true },
      { pinNumber: 7, name: 'A<B', isOutput: true },
      { pinNumber: 8, name: 'GND', isGnd: true },
      { pinNumber: 9, name: 'B0', isInput: true },
      { pinNumber: 10, name: 'A0', isInput: true },
      { pinNumber: 11, name: 'B1', isInput: true },
      { pinNumber: 12, name: 'A1', isInput: true },
      { pinNumber: 13, name: 'A2', isInput: true },
      { pinNumber: 14, name: 'B2', isInput: true },
      { pinNumber: 15, name: 'A3', isInput: true },
      { pinNumber: 16, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const a0 = toTtlBit(inputs[10]);
      const a1 = toTtlBit(inputs[12]);
      const a2 = toTtlBit(inputs[13]);
      const a3 = toTtlBit(inputs[15]);

      const b0 = toTtlBit(inputs[9]);
      const b1 = toTtlBit(inputs[11]);
      const b2 = toTtlBit(inputs[14]);
      const b3 = toTtlBit(inputs[1]);

      const a = a0 | (a1 << 1) | (a2 << 2) | (a3 << 3);
      const b = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);

      let gt = 0;
      let eq = 0;
      let lt = 0;

      if (a > b) {
        gt = 1;
      } else if (a < b) {
        lt = 1;
      } else {
        // Equal: respect cascading inputs (default: I(A=B) determines eq)
        const iGt = toTtlBit(inputs[4]);
        const iEq = toTtlBit(inputs[3]);
        const iLt = toTtlBit(inputs[2]);
        if (iEq === 1) {
          eq = 1;
        } else if (iGt === 1 && iLt === 0) {
          gt = 1;
        } else if (iLt === 1 && iGt === 0) {
          lt = 1;
        }
      }

      return { 5: gt as 0 | 1, 6: eq as 0 | 1, 7: lt as 0 | 1 };
    },
  },

  // -------------------------------------------------------------
  // 74151: 8-to-1 Multiplexer
  // 16-pin. VCC = 16, GND = 8.
  // D0=4, D1=3, D2=2, D3=1, D4=15, D5=14, D6=13, D7=12
  // A=11, B=10, C=9; Strobe E=7 (active low); Y=5, W=6 (inverted Y)
  // -------------------------------------------------------------
  '74151': {
    id: '74151',
    name: '74151',
    description: '8-to-1 Line Multiplexer / Data Selector',
    category: 'mux-demux',
    pinCount: 16,
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pinNumber: 1, name: 'D3', isInput: true },
      { pinNumber: 2, name: 'D2', isInput: true },
      { pinNumber: 3, name: 'D1', isInput: true },
      { pinNumber: 4, name: 'D0', isInput: true },
      { pinNumber: 5, name: 'Y', isOutput: true },
      { pinNumber: 6, name: 'W', isOutput: true, inverted: true },
      { pinNumber: 7, name: 'E', isInput: true, inverted: true },
      { pinNumber: 8, name: 'GND', isGnd: true },
      { pinNumber: 9, name: 'C', isInput: true },
      { pinNumber: 10, name: 'B', isInput: true },
      { pinNumber: 11, name: 'A', isInput: true },
      { pinNumber: 12, name: 'D7', isInput: true },
      { pinNumber: 13, name: 'D6', isInput: true },
      { pinNumber: 14, name: 'D5', isInput: true },
      { pinNumber: 15, name: 'D4', isInput: true },
      { pinNumber: 16, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const strobeE = toTtlBit(inputs[7]);
      if (strobeE === 1) {
        // Disabled: Y=0, W=1
        return { 5: 0, 6: 1 };
      }
      const selA = toTtlBit(inputs[11]);
      const selB = toTtlBit(inputs[10]);
      const selC = toTtlBit(inputs[9]);
      const sel = selA | (selB << 1) | (selC << 2);

      const dPins = [4, 3, 2, 1, 15, 14, 13, 12];
      const selectedPin = dPins[sel];
      const val = toTtlBit(inputs[selectedPin]);
      return { 5: val as 0 | 1, 6: (val === 0 ? 1 : 0) };
    },
  },

  // -------------------------------------------------------------
  // 74138: 3-to-8 Line Decoder / Demultiplexer
  // 16-pin. VCC = 16, GND = 8.
  // A=1, B=2, C=3; G2A=4 (act low), G2B=5 (act low), G1=6 (act high)
  // Outputs Y0..Y7 are active low: Y0=15, Y1=14, Y2=13, Y3=12, Y4=11, Y5=10, Y6=9, Y7=7
  // -------------------------------------------------------------
  '74138': {
    id: '74138',
    name: '74138',
    description: '3-to-8 Line Decoder / Inverting Demultiplexer',
    category: 'mux-demux',
    pinCount: 16,
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pinNumber: 1, name: 'A', isInput: true },
      { pinNumber: 2, name: 'B', isInput: true },
      { pinNumber: 3, name: 'C', isInput: true },
      { pinNumber: 4, name: 'G2A', isInput: true, inverted: true },
      { pinNumber: 5, name: 'G2B', isInput: true, inverted: true },
      { pinNumber: 6, name: 'G1', isInput: true },
      { pinNumber: 7, name: 'Y7', isOutput: true, inverted: true },
      { pinNumber: 8, name: 'GND', isGnd: true },
      { pinNumber: 9, name: 'Y6', isOutput: true, inverted: true },
      { pinNumber: 10, name: 'Y5', isOutput: true, inverted: true },
      { pinNumber: 11, name: 'Y4', isOutput: true, inverted: true },
      { pinNumber: 12, name: 'Y3', isOutput: true, inverted: true },
      { pinNumber: 13, name: 'Y2', isOutput: true, inverted: true },
      { pinNumber: 14, name: 'Y1', isOutput: true, inverted: true },
      { pinNumber: 15, name: 'Y0', isOutput: true, inverted: true },
      { pinNumber: 16, name: 'VCC', isVcc: true },
    ],
    evaluate: (inputs) => {
      const g1 = toTtlBit(inputs[6]);
      const g2a = toTtlBit(inputs[4]);
      const g2b = toTtlBit(inputs[5]);

      const outPins = [15, 14, 13, 12, 11, 10, 9, 7];
      // Default all outputs HIGH (active low inactive)
      const res: Record<number, SignalValue> = {};
      for (const p of outPins) res[p] = 1;

      // Enabled only when G1=1 and G2A=0 and G2B=0
      if (g1 === 1 && g2a === 0 && g2b === 0) {
        const a = toTtlBit(inputs[1]);
        const b = toTtlBit(inputs[2]);
        const c = toTtlBit(inputs[3]);
        const sel = a | (b << 1) | (c << 2);
        res[outPins[sel]] = 0; // Active low
      }
      return res;
    },
  },

  // -------------------------------------------------------------
  // 7476: Dual JK Flip-Flop with Preset & Clear
  // 16-pin. VCC = 5, GND = 13. Negative-edge triggered.
  // FF1: CLK=1, PRE=2, CLR=3, J=4, K=16, Q=15, Q_bar=14
  // FF2: CLK=6, PRE=7, CLR=8, J=9, K=12, Q=11, Q_bar=10
  // PRE and CLR are active-low asynchronous.
  // -------------------------------------------------------------
  '7476': {
    id: '7476',
    name: '7476',
    description: 'Dual J-K Flip-Flop with Preset & Clear (Neg Edge)',
    category: 'flipflop',
    pinCount: 16,
    vccPin: 5,
    gndPin: 13,
    pins: [
      { pinNumber: 1, name: '1CLK', isClock: true, isInput: true },
      { pinNumber: 2, name: '1PRE', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 3, name: '1CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 4, name: '1J', isInput: true },
      { pinNumber: 5, name: 'VCC', isVcc: true },
      { pinNumber: 6, name: '2CLK', isClock: true, isInput: true },
      { pinNumber: 7, name: '2PRE', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 8, name: '2CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 9, name: '2J', isInput: true },
      { pinNumber: 10, name: '2Q~', isOutput: true, inverted: true },
      { pinNumber: 11, name: '2Q', isOutput: true },
      { pinNumber: 12, name: '2K', isInput: true },
      { pinNumber: 13, name: 'GND', isGnd: true },
      { pinNumber: 14, name: '1Q~', isOutput: true, inverted: true },
      { pinNumber: 15, name: '1Q', isOutput: true },
      { pinNumber: 16, name: '1K', isInput: true },
    ],
    initialState: { q1: 0, q2: 0 },
    evaluateSequential: (inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;

      // FF1 Asynchronous controls (active low)
      const pre1 = toTtlBit(inputs[2]);
      const clr1 = toTtlBit(inputs[3]);
      if (pre1 === 0 && clr1 === 1) q1 = 1;
      else if (pre1 === 1 && clr1 === 0) q1 = 0;
      else if (pre1 === 0 && clr1 === 0) q1 = 1; // Unstable/both high in TTL

      // FF2 Asynchronous controls
      const pre2 = toTtlBit(inputs[7]);
      const clr2 = toTtlBit(inputs[8]);
      if (pre2 === 0 && clr2 === 1) q2 = 1;
      else if (pre2 === 1 && clr2 === 0) q2 = 0;
      else if (pre2 === 0 && clr2 === 0) q2 = 1;

      return {
        nextState: { q1, q2 },
        outputs: {
          15: q1,
          14: q1 === 0 ? 1 : 0,
          11: q2,
          10: q2 === 0 ? 1 : 0,
        },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;

      // Negative edge on 1CLK (pin 1)
      if (edgePins.includes(1)) {
        const pre1 = toTtlBit(inputs[2]);
        const clr1 = toTtlBit(inputs[3]);
        if (pre1 === 1 && clr1 === 1) {
          const j = toTtlBit(inputs[4]);
          const k = toTtlBit(inputs[16]);
          if (j === 0 && k === 1) q1 = 0;
          else if (j === 1 && k === 0) q1 = 1;
          else if (j === 1 && k === 1) q1 = q1 === 0 ? 1 : 0; // toggle
        }
      }

      // Negative edge on 2CLK (pin 6)
      if (edgePins.includes(6)) {
        const pre2 = toTtlBit(inputs[7]);
        const clr2 = toTtlBit(inputs[8]);
        if (pre2 === 1 && clr2 === 1) {
          const j = toTtlBit(inputs[9]);
          const k = toTtlBit(inputs[12]);
          if (j === 0 && k === 1) q2 = 0;
          else if (j === 1 && k === 0) q2 = 1;
          else if (j === 1 && k === 1) q2 = q2 === 0 ? 1 : 0; // toggle
        }
      }

      return {
        nextState: { q1, q2 },
        outputs: {
          15: q1,
          14: q1 === 0 ? 1 : 0,
          11: q2,
          10: q2 === 0 ? 1 : 0,
        },
      };
    },
  },

  // -------------------------------------------------------------
  // 7474: Dual D-Type Flip-Flop with Preset & Clear
  // 14-pin. VCC = 14, GND = 7. Positive-edge triggered.
  // FF1: CLR=1, D=2, CLK=3, PRE=4, Q=5, Q_bar=6
  // FF2: CLR=13, D=12, CLK=11, PRE=10, Q=9, Q_bar=8
  // -------------------------------------------------------------
  '7474': {
    id: '7474',
    name: '7474',
    description: 'Dual D-Type Positive-Edge-Triggered Flip-Flop',
    category: 'flipflop',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: '1CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 2, name: '1D', isInput: true },
      { pinNumber: 3, name: '1CLK', isClock: true, isInput: true },
      { pinNumber: 4, name: '1PRE', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 5, name: '1Q', isOutput: true },
      { pinNumber: 6, name: '1Q~', isOutput: true, inverted: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: '2Q~', isOutput: true, inverted: true },
      { pinNumber: 9, name: '2Q', isOutput: true },
      { pinNumber: 10, name: '2PRE', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 11, name: '2CLK', isClock: true, isInput: true },
      { pinNumber: 12, name: '2D', isInput: true },
      { pinNumber: 13, name: '2CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    initialState: { q1: 0, q2: 0 },
    evaluateSequential: (inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;

      const clr1 = toTtlBit(inputs[1]);
      const pre1 = toTtlBit(inputs[4]);
      if (pre1 === 0 && clr1 === 1) q1 = 1;
      else if (pre1 === 1 && clr1 === 0) q1 = 0;
      else if (pre1 === 0 && clr1 === 0) q1 = 1;

      const clr2 = toTtlBit(inputs[13]);
      const pre2 = toTtlBit(inputs[10]);
      if (pre2 === 0 && clr2 === 1) q2 = 1;
      else if (pre2 === 1 && clr2 === 0) q2 = 0;
      else if (pre2 === 0 && clr2 === 0) q2 = 1;

      return {
        nextState: { q1, q2 },
        outputs: {
          5: q1,
          6: q1 === 0 ? 1 : 0,
          9: q2,
          8: q2 === 0 ? 1 : 0,
        },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;

      // Positive edge on 1CLK (pin 3)
      if (edgePins.includes(3)) {
        const clr1 = toTtlBit(inputs[1]);
        const pre1 = toTtlBit(inputs[4]);
        if (pre1 === 1 && clr1 === 1) {
          q1 = toTtlBit(inputs[2]);
        }
      }

      // Positive edge on 2CLK (pin 11)
      if (edgePins.includes(11)) {
        const clr2 = toTtlBit(inputs[13]);
        const pre2 = toTtlBit(inputs[10]);
        if (pre2 === 1 && clr2 === 1) {
          q2 = toTtlBit(inputs[12]);
        }
      }

      return {
        nextState: { q1, q2 },
        outputs: {
          5: q1,
          6: q1 === 0 ? 1 : 0,
          9: q2,
          8: q2 === 0 ? 1 : 0,
        },
      };
    },
  },

  // -------------------------------------------------------------
  // 7490: Decade Counter (Divide by 2 & Divide by 5)
  // 14-pin. VCC = 5, GND = 10. Negative-edge triggered.
  // CKA=14, CKB=1, R0(1)=2, R0(2)=3, R9(1)=6, R9(2)=7
  // QA=12, QB=9, QC=8, QD=11 ; NC: 4, 13
  // -------------------------------------------------------------
  '7490': {
    id: '7490',
    name: '7490',
    description: 'Decade / BCD Counter',
    category: 'counter',
    pinCount: 14,
    vccPin: 5,
    gndPin: 10,
    pins: [
      { pinNumber: 1, name: 'CKB', isClock: true, isInput: true },
      { pinNumber: 2, name: 'R0(1)', isAsyncReset: true, isInput: true },
      { pinNumber: 3, name: 'R0(2)', isAsyncReset: true, isInput: true },
      { pinNumber: 4, name: 'NC' },
      { pinNumber: 5, name: 'VCC', isVcc: true },
      { pinNumber: 6, name: 'R9(1)', isAsyncReset: true, isInput: true },
      { pinNumber: 7, name: 'R9(2)', isAsyncReset: true, isInput: true },
      { pinNumber: 8, name: 'QC', isOutput: true },
      { pinNumber: 9, name: 'QB', isOutput: true },
      { pinNumber: 10, name: 'GND', isGnd: true },
      { pinNumber: 11, name: 'QD', isOutput: true },
      { pinNumber: 12, name: 'QA', isOutput: true },
      { pinNumber: 13, name: 'NC' },
      { pinNumber: 14, name: 'CKA', isClock: true, isInput: true },
    ],
    initialState: { qa: 0, qbcd: 0 }, // qbcd is 0..4 (QB, QC, QD)
    evaluateSequential: (inputs, state) => {
      let qa = state.qa ?? 0;
      let qbcd = state.qbcd ?? 0;

      const r0_1 = toTtlBit(inputs[2]);
      const r0_2 = toTtlBit(inputs[3]);
      const r9_1 = toTtlBit(inputs[6]);
      const r9_2 = toTtlBit(inputs[7]);

      if (r0_1 === 1 && r0_2 === 1) {
        qa = 0;
        qbcd = 0;
      } else if (r9_1 === 1 && r9_2 === 1) {
        qa = 1;
        qbcd = 4; // QB=0, QC=0, QD=1 -> 1 + 8 = 9
      }

      // Convert qbcd (0..4) to QB, QC, QD
      // In 7490: 0->000, 1->010, 2->100, 3->110, 4->001 (BCD order: QD QC QB)
      let qb = 0, qc = 0, qd = 0;
      switch (qbcd) {
        case 0: qb = 0; qc = 0; qd = 0; break;
        case 1: qb = 1; qc = 0; qd = 0; break;
        case 2: qb = 0; qc = 1; qd = 0; break;
        case 3: qb = 1; qc = 1; qd = 0; break;
        case 4: qb = 0; qc = 0; qd = 1; break;
      }

      return {
        nextState: { qa, qbcd },
        outputs: {
          12: qa as 0 | 1,
          9: qb as 0 | 1,
          8: qc as 0 | 1,
          11: qd as 0 | 1,
        },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let qa = state.qa ?? 0;
      let qbcd = state.qbcd ?? 0;

      const r0_1 = toTtlBit(inputs[2]);
      const r0_2 = toTtlBit(inputs[3]);
      const r9_1 = toTtlBit(inputs[6]);
      const r9_2 = toTtlBit(inputs[7]);

      // If in reset or preset, clocks are ignored
      if ((r0_1 === 1 && r0_2 === 1) || (r9_1 === 1 && r9_2 === 1)) {
        return {
          nextState: { qa, qbcd },
          outputs: { 12: qa, 9: 0, 8: 0, 11: 0 },
        };
      }

      // CKA falling edge toggles QA
      if (edgePins.includes(14)) {
        qa = qa === 0 ? 1 : 0;
      }

      // CKB falling edge advances divide-by-5 counter (0 -> 1 -> 2 -> 3 -> 4 -> 0)
      if (edgePins.includes(1)) {
        qbcd = (qbcd + 1) % 5;
      }

      let qb = 0, qc = 0, qd = 0;
      switch (qbcd) {
        case 0: qb = 0; qc = 0; qd = 0; break;
        case 1: qb = 1; qc = 0; qd = 0; break;
        case 2: qb = 0; qc = 1; qd = 0; break;
        case 3: qb = 1; qc = 1; qd = 0; break;
        case 4: qb = 0; qc = 0; qd = 1; break;
      }

      return {
        nextState: { qa, qbcd },
        outputs: {
          12: qa as 0 | 1,
          9: qb as 0 | 1,
          8: qc as 0 | 1,
          11: qd as 0 | 1,
        },
      };
    },
  },

  // -------------------------------------------------------------
  // 7495: 4-Bit Parallel-Access Shift Register
  // 14-pin. VCC = 14, GND = 7.
  // Serial in=1; parallel A=2, B=3, C=4, D=5; Mode=6
  // Clock 2 (load)=8; Clock 1 (shift right)=9; QA=13, QB=12, QC=11, QD=10
  // Mode LOW: falling edge of Clk1 shifts right.
  // Mode HIGH: falling edge of Clk2 loads A-D.
  // -------------------------------------------------------------
  '7495': {
    id: '7495',
    name: '7495',
    description: '4-Bit Parallel-Access Shift Register',
    category: 'register',
    pinCount: 14,
    vccPin: 14,
    gndPin: 7,
    pins: [
      { pinNumber: 1, name: 'SER', isInput: true },
      { pinNumber: 2, name: 'A', isInput: true },
      { pinNumber: 3, name: 'B', isInput: true },
      { pinNumber: 4, name: 'C', isInput: true },
      { pinNumber: 5, name: 'D', isInput: true },
      { pinNumber: 6, name: 'MODE', isInput: true },
      { pinNumber: 7, name: 'GND', isGnd: true },
      { pinNumber: 8, name: 'CLK2', isClock: true, isInput: true },
      { pinNumber: 9, name: 'CLK1', isClock: true, isInput: true },
      { pinNumber: 10, name: 'QD', isOutput: true },
      { pinNumber: 11, name: 'QC', isOutput: true },
      { pinNumber: 12, name: 'QB', isOutput: true },
      { pinNumber: 13, name: 'QA', isOutput: true },
      { pinNumber: 14, name: 'VCC', isVcc: true },
    ],
    initialState: { qa: 0, qb: 0, qc: 0, qd: 0 },
    evaluateSequential: (_inputs, state) => {
      const qa = state.qa ?? 0;
      const qb = state.qb ?? 0;
      const qc = state.qc ?? 0;
      const qd = state.qd ?? 0;
      return {
        nextState: { qa, qb, qc, qd },
        outputs: { 13: qa, 12: qb, 11: qc, 10: qd },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let qa = state.qa ?? 0;
      let qb = state.qb ?? 0;
      let qc = state.qc ?? 0;
      let qd = state.qd ?? 0;

      const mode = toTtlBit(inputs[6]);

      // Mode LOW: falling edge of Clk 1 (pin 9) shifts right (SER -> QA -> QB -> QC -> QD)
      if (mode === 0 && edgePins.includes(9)) {
        const ser = toTtlBit(inputs[1]);
        qd = qc;
        qc = qb;
        qb = qa;
        qa = ser;
      }

      // Mode HIGH: falling edge of Clk 2 (pin 8) loads parallel A, B, C, D
      if (mode === 1 && edgePins.includes(8)) {
        qa = toTtlBit(inputs[2]);
        qb = toTtlBit(inputs[3]);
        qc = toTtlBit(inputs[4]);
        qd = toTtlBit(inputs[5]);
      }

      return {
        nextState: { qa, qb, qc, qd },
        outputs: { 13: qa, 12: qb, 11: qc, 10: qd },
      };
    },
  },

  // -------------------------------------------------------------
  // 74194: 4-Bit Bidirectional Universal Shift Register
  // 16-pin. VCC = 16, GND = 8.
  // CLR=1 (act low); SR=2; A=3, B=4, C=5, D=6; SL=7; S0=9, S1=10; CLK=11 (pos edge)
  // QD=12, QC=13, QB=14, QA=15
  // S1S0: 00 hold, 01 shift right, 10 shift left, 11 parallel load
  // -------------------------------------------------------------
  '74194': {
    id: '74194',
    name: '74194',
    description: '4-Bit Bidirectional Universal Shift Register',
    category: 'register',
    pinCount: 16,
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pinNumber: 1, name: 'CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 2, name: 'SR', isInput: true },
      { pinNumber: 3, name: 'A', isInput: true },
      { pinNumber: 4, name: 'B', isInput: true },
      { pinNumber: 5, name: 'C', isInput: true },
      { pinNumber: 6, name: 'D', isInput: true },
      { pinNumber: 7, name: 'SL', isInput: true },
      { pinNumber: 8, name: 'GND', isGnd: true },
      { pinNumber: 9, name: 'S0', isInput: true },
      { pinNumber: 10, name: 'S1', isInput: true },
      { pinNumber: 11, name: 'CLK', isClock: true, isInput: true },
      { pinNumber: 12, name: 'QD', isOutput: true },
      { pinNumber: 13, name: 'QC', isOutput: true },
      { pinNumber: 14, name: 'QB', isOutput: true },
      { pinNumber: 15, name: 'QA', isOutput: true },
      { pinNumber: 16, name: 'VCC', isVcc: true },
    ],
    initialState: { qa: 0, qb: 0, qc: 0, qd: 0 },
    evaluateSequential: (inputs, state) => {
      let qa = state.qa ?? 0;
      let qb = state.qb ?? 0;
      let qc = state.qc ?? 0;
      let qd = state.qd ?? 0;

      const clr = toTtlBit(inputs[1]);
      if (clr === 0) {
        qa = 0; qb = 0; qc = 0; qd = 0;
      }

      return {
        nextState: { qa, qb, qc, qd },
        outputs: { 15: qa, 14: qb, 13: qc, 12: qd },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let qa = state.qa ?? 0;
      let qb = state.qb ?? 0;
      let qc = state.qc ?? 0;
      let qd = state.qd ?? 0;

      const clr = toTtlBit(inputs[1]);
      if (clr === 0) {
        return {
          nextState: { qa: 0, qb: 0, qc: 0, qd: 0 },
          outputs: { 15: 0, 14: 0, 13: 0, 12: 0 },
        };
      }

      // Positive edge on CLK (pin 11)
      if (edgePins.includes(11)) {
        const s0 = toTtlBit(inputs[9]);
        const s1 = toTtlBit(inputs[10]);
        const mode = (s1 << 1) | s0;

        if (mode === 1) {
          // Shift right: SR -> QA -> QB -> QC -> QD
          const sr = toTtlBit(inputs[2]);
          qd = qc;
          qc = qb;
          qb = qa;
          qa = sr;
        } else if (mode === 2) {
          // Shift left: SL -> QD -> QC -> QB -> QA
          const sl = toTtlBit(inputs[7]);
          qa = qb;
          qb = qc;
          qc = qd;
          qd = sl;
        } else if (mode === 3) {
          // Parallel load
          qa = toTtlBit(inputs[3]);
          qb = toTtlBit(inputs[4]);
          qc = toTtlBit(inputs[5]);
          qd = toTtlBit(inputs[6]);
        }
      }

      return {
        nextState: { qa, qb, qc, qd },
        outputs: { 15: qa, 14: qb, 13: qc, 12: qd },
      };
    },
  },

  // -------------------------------------------------------------
  // 74175: Quad D-Type Flip-Flop with Clear
  // 16-pin. VCC = 16, GND = 8.
  // CLR=1 (act low); CLK=9 (pos edge); D1=4, D2=5, D3=12, D4=13
  // Q1=2, Q2=7, Q3=10, Q4=15 ; Q~1=3, Q~2=6, Q~3=11, Q~4=14
  // -------------------------------------------------------------
  '74175': {
    id: '74175',
    name: '74175',
    description: 'Quad D-Type Flip-Flop with Clear',
    category: 'register',
    pinCount: 16,
    vccPin: 16,
    gndPin: 8,
    pins: [
      { pinNumber: 1, name: 'CLR', isAsyncReset: true, isInput: true, inverted: true },
      { pinNumber: 2, name: '1Q', isOutput: true },
      { pinNumber: 3, name: '1Q~', isOutput: true, inverted: true },
      { pinNumber: 4, name: '1D', isInput: true },
      { pinNumber: 5, name: '2D', isInput: true },
      { pinNumber: 6, name: '2Q~', isOutput: true, inverted: true },
      { pinNumber: 7, name: '2Q', isOutput: true },
      { pinNumber: 8, name: 'GND', isGnd: true },
      { pinNumber: 9, name: 'CLK', isClock: true, isInput: true },
      { pinNumber: 10, name: '3Q', isOutput: true },
      { pinNumber: 11, name: '3Q~', isOutput: true, inverted: true },
      { pinNumber: 12, name: '3D', isInput: true },
      { pinNumber: 13, name: '4D', isInput: true },
      { pinNumber: 14, name: '4Q~', isOutput: true, inverted: true },
      { pinNumber: 15, name: '4Q', isOutput: true },
      { pinNumber: 16, name: 'VCC', isVcc: true },
    ],
    initialState: { q1: 0, q2: 0, q3: 0, q4: 0 },
    evaluateSequential: (inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;
      let q3 = state.q3 ?? 0;
      let q4 = state.q4 ?? 0;

      const clr = toTtlBit(inputs[1]);
      if (clr === 0) {
        q1 = 0; q2 = 0; q3 = 0; q4 = 0;
      }

      return {
        nextState: { q1, q2, q3, q4 },
        outputs: {
          2: q1, 3: q1 === 0 ? 1 : 0,
          7: q2, 6: q2 === 0 ? 1 : 0,
          10: q3, 11: q3 === 0 ? 1 : 0,
          15: q4, 14: q4 === 0 ? 1 : 0,
        },
      };
    },
    onClockEdge: (edgePins, inputs, state) => {
      let q1 = state.q1 ?? 0;
      let q2 = state.q2 ?? 0;
      let q3 = state.q3 ?? 0;
      let q4 = state.q4 ?? 0;

      const clr = toTtlBit(inputs[1]);
      if (clr === 0) {
        return {
          nextState: { q1: 0, q2: 0, q3: 0, q4: 0 },
          outputs: { 2: 0, 3: 1, 7: 0, 6: 1, 10: 0, 11: 1, 15: 0, 14: 1 },
        };
      }

      // Positive edge on CLK (pin 9)
      if (edgePins.includes(9)) {
        q1 = toTtlBit(inputs[4]);
        q2 = toTtlBit(inputs[5]);
        q3 = toTtlBit(inputs[12]);
        q4 = toTtlBit(inputs[13]);
      }

      return {
        nextState: { q1, q2, q3, q4 },
        outputs: {
          2: q1, 3: q1 === 0 ? 1 : 0,
          7: q2, 6: q2 === 0 ? 1 : 0,
          10: q3, 11: q3 === 0 ? 1 : 0,
          15: q4, 14: q4 === 0 ? 1 : 0,
        },
      };
    },
  },
};
