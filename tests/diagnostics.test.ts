/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'vitest';
import { EXPERIMENTS } from '../src/data/experiments';
import { checkCircuit } from '../src/engine/checker';
import { CircuitSimulator } from '../src/engine/simulate';
import { PlacedIc, PlacedLed, Wire } from '../src/types';

describe('Diagnostic run for each failing experiment', () => {
  const ids = ['exp5', 'exp9', 'exp10', 'expA1', 'expA2', 'expA3', 'expA4'];

  for (const id of ids) {
    it(`diagnose ${id}`, () => {
      const exp = EXPERIMENTS.find(e => e.id === id)!;
      const preset = exp.preset!;
      const ics: PlacedIc[] = preset.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
      const wires: Wire[] = preset.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
      const leds: PlacedLed[] = preset.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

      const sim = new CircuitSimulator();
      const res = sim.simulate(ics, wires, leds);
      const checkRes = checkCircuit(exp, ics, wires, leds);

      console.log(`[DIAG ${id}] hasConflict:`, res.hasConflict);
      if (res.conflictHoles.size > 0) {
        console.log(`[DIAG ${id}] conflictHoles:`, Array.from(res.conflictHoles));
      }
      console.log(`[DIAG ${id}] check passed:`, checkRes.passed, checkRes.headline, checkRes.details);
    });
  }
});
