/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { EXPERIMENTS } from '../src/data/experiments';
import { checkCircuit } from '../src/engine/checker';
import { PlacedIc, PlacedLed, Wire } from '../src/types';

describe('Experiment Preset Wirings', () => {
  it('every syllabus experiment has a complete working preset wiring defined', () => {
    const syllabusExps = EXPERIMENTS.filter(e => e.id !== 'free');
    for (const exp of syllabusExps) {
      expect(exp.preset, `Experiment ${exp.id} should have a preset wiring`).toBeDefined();
      expect(exp.preset!.ics.length).toBeGreaterThan(0);
      expect(exp.preset!.wires.length).toBeGreaterThan(0);
      expect(exp.preset!.leds.length).toBeGreaterThan(0);
    }
  });

  it('Exp 2: Binary to Gray code preset passes verification', () => {
    const exp = EXPERIMENTS.find(e => e.id === 'exp2')!;
    const ics: PlacedIc[] = exp.preset!.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
    const wires: Wire[] = exp.preset!.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
    const leds: PlacedLed[] = exp.preset!.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

    const res = checkCircuit(exp, ics, wires, leds);
    expect(res.passed).toBe(true);
  });

  it('Exp 4: 8:1 Multiplexer preset passes verification', () => {
    const exp = EXPERIMENTS.find(e => e.id === 'exp4')!;
    const ics: PlacedIc[] = exp.preset!.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
    const wires: Wire[] = exp.preset!.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
    const leds: PlacedLed[] = exp.preset!.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

    const res = checkCircuit(exp, ics, wires, leds);
    expect(res.passed).toBe(true);
  });

  it('Exp 7: 2-bit Ripple counter preset passes verification', () => {
    const exp = EXPERIMENTS.find(e => e.id === 'exp7')!;
    const ics: PlacedIc[] = exp.preset!.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
    const wires: Wire[] = exp.preset!.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
    const leds: PlacedLed[] = exp.preset!.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

    const res = checkCircuit(exp, ics, wires, leds);
    expect(res.passed).toBe(true);
  });
});
