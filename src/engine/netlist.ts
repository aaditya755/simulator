/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlacedIc, PlacedLed, PlacedResistor, Wire } from '../types';
import { IC_CATALOG } from './ics';

export class UnionFind {
  parent: Map<string, string> = new Map();

  find(id: string): string {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      return id;
    }
    const p = this.parent.get(id)!;
    if (p !== id) {
      const root = this.find(p);
      this.parent.set(id, root);
      return root;
    }
    return p;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b);
  }
}

/**
 * Standard hole IDs:
 *  - Top positive rail: `railTop+_${col}` (1..30)
 *  - Top negative rail: `railTop-_${col}` (1..30)
 *  - Upper strip: `${row}_${col}` where row in ['j','i','h','g','f']
 *  - Lower strip: `${row}_${col}` where row in ['e','d','c','b','a']
 *  - Bottom negative rail: `railBottom-_${col}` (1..30)
 *  - Bottom positive rail: `railBottom+_${col}` (1..30)
 *  - Panel sockets: `socket-vcc`, `socket-gnd`, `socket-clk1`, `socket-clk2`
 */

export const ROWS_UPPER = ['j', 'i', 'h', 'g', 'f'] as const;
export const ROWS_LOWER = ['e', 'd', 'c', 'b', 'a'] as const;
export const NUM_COLS = 30;

/**
 * Returns the breadboard hole connected to an IC pin.
 * In a standard breadboard, IC pins straddle the center channel:
 * Pin 1..N/2 on row 'e' (lower half, cols startCol..startCol+N/2-1)
 * Pin N/2+1..N on row 'f' (upper half, cols startCol+N/2-1..startCol)
 */
export function getIcHoleForPin(ic: PlacedIc, pinNumber: number): string {
  const def = IC_CATALOG[ic.type];
  const half = def ? def.pinCount / 2 : 7;

  if (pinNumber <= half) {
    // Lower half pins 1..half: col = startCol + (pinNumber - 1), row 'e'
    const col = ic.startCol + (pinNumber - 1);
    return `e_${col}`;
  } else {
    // Upper half pins (half+1)..N: pin counts right to left!
    // pin (half+1) is at startCol + half - 1
    // pin N is at startCol
    const offset = def.pinCount - pinNumber;
    const col = ic.startCol + offset;
    return `f_${col}`;
  }
}

/**
 * Returns the column and row for a pin of an IC
 */
export function getIcPinCol(ic: PlacedIc, pinNumber: number): { col: number; row: 'e' | 'f' } {
  const def = IC_CATALOG[ic.type];
  const half = def ? def.pinCount / 2 : 7;
  if (pinNumber <= half) {
    return { col: ic.startCol + (pinNumber - 1), row: 'e' };
  } else {
    const offset = (def ? def.pinCount : 14) - pinNumber;
    return { col: ic.startCol + offset, row: 'f' };
  }
}

/**
 * Returns which internal breadboard node a hole belongs to prior to wiring.
 * - Each column's upper 5 holes are in `strip_upper_${col}`
 * - Each column's lower 5 holes are in `strip_lower_${col}`
 * - Top rails are continuous across all 30 cols
 * - Bottom rails are continuous across all 30 cols
 */
export function getBaseNodeForHole(holeId: string): string {
  if (holeId.startsWith('railTop+')) return 'rail_top_plus';
  if (holeId.startsWith('railTop-')) return 'rail_top_minus';
  if (holeId.startsWith('railBottom-')) return 'rail_bottom_minus';
  if (holeId.startsWith('railBottom+')) return 'rail_bottom_plus';
  if (holeId.startsWith('socket-')) return holeId;

  const parts = holeId.split('_');
  if (parts.length === 2) {
    const [row, col] = parts;
    if (ROWS_UPPER.includes(row as any)) {
      return `strip_upper_${col}`;
    }
    if (ROWS_LOWER.includes(row as any)) {
      return `strip_lower_${col}`;
    }
  }
  return holeId;
}

export interface NetlistResult {
  uf: UnionFind;
  holeToNet: Map<string, string>;
  netToHoles: Map<string, Set<string>>;
  isHoleVcc: (holeId: string) => boolean;
  isHoleGnd: (holeId: string) => boolean;
  isHoleClk1: (holeId: string) => boolean;
  isHoleClk2: (holeId: string) => boolean;
  areConnected: (holeA: string, holeB: string) => boolean;
}

/**
 * Builds the complete electrical netlist from breadboard internal connections,
 * placed resistors, and wires.
 */
export function buildNetlist(
  wires: Wire[],
  resistors: PlacedResistor[] = []
): NetlistResult {
  const uf = new UnionFind();

  // 1. Connect internal breadboard holes to their base node
  for (let c = 1; c <= NUM_COLS; c++) {
    const upperBase = `strip_upper_${c}`;
    for (const r of ROWS_UPPER) {
      uf.union(`${r}_${c}`, upperBase);
    }

    const lowerBase = `strip_lower_${c}`;
    for (const r of ROWS_LOWER) {
      uf.union(`${r}_${c}`, lowerBase);
    }

    // Top rails
    uf.union(`railTop+_${c}`, 'rail_top_plus');
    uf.union(`railTop-_${c}`, 'rail_top_minus');

    // Bottom rails
    uf.union(`railBottom-_${c}`, 'rail_bottom_minus');
    uf.union(`railBottom+_${c}`, 'rail_bottom_plus');
  }

  // 2. Resistors connect two holes together
  for (const res of resistors) {
    if (res.hole1Id && res.hole2Id) {
      uf.union(res.hole1Id, res.hole2Id);
    }
  }

  // 3. Wires connect two holes or sockets together
  for (const wire of wires) {
    if (wire.fromHoleId && wire.toHoleId) {
      uf.union(wire.fromHoleId, wire.toHoleId);
    }
  }

  const vccNet = uf.find('socket-vcc');
  const gndNet = uf.find('socket-gnd');
  const clk1Net = uf.find('socket-clk1');
  const clk2Net = uf.find('socket-clk2');

  const holeToNet = new Map<string, string>();
  const netToHoles = new Map<string, Set<string>>();

  return {
    uf,
    holeToNet,
    netToHoles,
    isHoleVcc: (h: string) => uf.find(h) === vccNet,
    isHoleGnd: (h: string) => uf.find(h) === gndNet,
    isHoleClk1: (h: string) => uf.find(h) === clk1Net,
    isHoleClk2: (h: string) => uf.find(h) === clk2Net,
    areConnected: (a: string, b: string) => uf.find(a) === uf.find(b),
  };
}
