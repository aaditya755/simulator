/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { EXPERIMENTS } from '../src/data/experiments';
import { checkCircuit } from '../src/engine/checker';
import { CircuitSimulator } from '../src/engine/simulate';
import { PlacedIc, PlacedLed, Wire } from '../src/types';

describe('Comprehensive Audit of All 14 Syllabus Experiments', () => {
  const syllabus = EXPERIMENTS.filter(e => e.id !== 'free');

  for (const exp of syllabus) {
    it(`Experiment ${exp.number} (${exp.title}): verify preset circuit powers ICs and passes check`, () => {
      expect(exp.preset, `Exp ${exp.number} must have a preset wiring`).toBeDefined();
      const preset = exp.preset!;

      const ics: PlacedIc[] = preset.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
      const wires: Wire[] = preset.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
      const leds: PlacedLed[] = preset.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

      const sim = new CircuitSimulator();
      const res = sim.simulate(ics, wires, leds);

      // 1. All ICs must be powered
      for (const ic of ics) {
        expect(res.icPowerStatus.get(ic.id), `IC ${ic.type} in Exp ${exp.number} must be powered`).toBe(true);
      }

      // 2. Must not have electrical short/conflict
      expect(res.hasConflict, `Exp ${exp.number} must not have conflict`).toBe(false);

      // 3. Must have LEDs placed
      expect(leds.length, `Exp ${exp.number} must have LEDs`).toBeGreaterThan(0);

      // 4. checkCircuit must pass
      const checkRes = checkCircuit(exp, ics, wires, leds);
      if (!checkRes.passed) {
        console.error(`Check failed for Exp ${exp.number}:`, checkRes.headline, checkRes.details, checkRes.hint);
      }
      expect(checkRes.passed, `Exp ${exp.number} checkCircuit: ${checkRes.headline} - ${checkRes.details}`).toBe(true);
    });
  }
});
