/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { CircuitSimulator } from '../src/engine/simulate';
import { checkCircuit } from '../src/engine/checker';
import { EXPERIMENTS } from '../src/data/experiments';
import { getCircuitHint } from '../src/data/hints';
import { PlacedIc, PlacedLed, Wire } from '../src/types';

describe('Acceptance Criteria Tests (Section 11)', () => {
  it('1. 7486 powered, inputs on rails, LED on pin 3 matches XOR output', () => {
    const sim = new CircuitSimulator();
    const ics: PlacedIc[] = [{ id: 'ic1', type: '7486', startCol: 5 }];
    // Col 5: pin 1 is e_5, pin 2 is e_6, pin 3 is e_7, pin 7 is e_11, pin 14 is f_5
    const wires: Wire[] = [
      { id: 'w1', fromHoleId: 'socket-vcc', toHoleId: 'railTop+_1', color: 'red' },
      { id: 'w2', fromHoleId: 'socket-gnd', toHoleId: 'railTop-_1', color: 'black' },
      // Power IC 7486
      { id: 'w3', fromHoleId: 'railTop+_5', toHoleId: 'f_5', color: 'red' }, // VCC pin 14
      { id: 'w4', fromHoleId: 'railTop-_11', toHoleId: 'e_11', color: 'black' }, // GND pin 7
      // Inputs: 1 to rail (+), 2 to rail (-) -> 1 XOR 0 = 1
      { id: 'wA', fromHoleId: 'railTop+_2', toHoleId: 'e_5', color: 'yellow' },
      { id: 'wB', fromHoleId: 'railTop-_2', toHoleId: 'e_6', color: 'yellow' },
    ];
    const leds: PlacedLed[] = [
      { id: 'led1', anodeHoleId: 'e_7', cathodeHoleId: 'railTop-_7' },
    ];

    // Simulate 1 XOR 0 -> LED ON
    let res = sim.simulate(ics, wires, leds);
    expect(res.icPowerStatus.get('ic1')).toBe(true);
    expect(res.ledStates.get('led1')).toBe(true);

    // Flip input B from rail - to rail + (1 XOR 1 = 0)
    const wiresFlipped = wires.map(w => w.id === 'wB' ? { ...w, fromHoleId: 'railTop+_2' } : w);
    res = sim.simulate(ics, wiresFlipped, leds);
    expect(res.ledStates.get('led1')).toBe(false);
  });

  it('2. Experiment 1 Full Adder wired correctly passes Check My Circuit; with one wire removed it fails with the failing row', () => {
    const exp1 = EXPERIMENTS.find(e => e.id === 'exp1')!;
    expect(exp1.preset).toBeDefined();

    const ics: PlacedIc[] = exp1.preset!.ics.map((ic, i) => ({ id: `ic-${i}`, type: ic.type, startCol: ic.startCol }));
    const wires: Wire[] = exp1.preset!.wires.map((w, i) => ({ id: `w-${i}`, fromHoleId: w.from, toHoleId: w.to, color: w.color, label: w.label }));
    const leds: PlacedLed[] = exp1.preset!.leds.map((l, i) => ({ id: `l-${i}`, anodeHoleId: l.anode, cathodeHoleId: l.cathode, label: l.label }));

    const checkPass = checkCircuit(exp1, ics, wires, leds);
    expect(checkPass.passed).toBe(true);
    expect(checkPass.headline).toContain('Well done');

    // Remove one critical wire (e.g. A input to XOR gate)
    const brokenWires = wires.filter(w => w.label !== 'A');
    const checkFail = checkCircuit(exp1, ics, brokenWires, leds);
    expect(checkFail.passed).toBe(false);
  });

  it('3. Unpowered IC 7483 specifies VCC pin 5 and GND pin 12 in the hint', () => {
    const exp3 = EXPERIMENTS.find(e => e.id === 'exp3')!;
    const ics: PlacedIc[] = [{ id: 'adder1', type: '7483', startCol: 5 }];
    const sim = new CircuitSimulator();
    const res = sim.simulate(ics, []);

    expect(res.icPowerStatus.get('adder1')).toBe(false);
    expect(res.unpoweredIcs[0].vccPin).toBe(5);
    expect(res.unpoweredIcs[0].gndPin).toBe(12);

    const hint = getCircuitHint(exp3, ics, [], [], res);
    expect(hint.message).toContain('pin 5');
    expect(hint.message).toContain('pin 12');
  });

  it('4. Floating TTL input pin on 7408 acts as HIGH (1)', () => {
    const sim = new CircuitSimulator();
    const ics: PlacedIc[] = [{ id: 'and1', type: '7408', startCol: 5 }];
    // Col 5: pin 1 is e_5, pin 2 is e_6, pin 3 is e_7, pin 7 is e_11, pin 14 is f_5
    const wires: Wire[] = [
      { id: 'w1', fromHoleId: 'socket-vcc', toHoleId: 'railTop+_1', color: 'red' },
      { id: 'w2', fromHoleId: 'socket-gnd', toHoleId: 'railTop-_1', color: 'black' },
      { id: 'w3', fromHoleId: 'railTop+_5', toHoleId: 'f_5', color: 'red' },
      { id: 'w4', fromHoleId: 'railTop-_11', toHoleId: 'e_11', color: 'black' },
      // Wire input 1 to rail + (HIGH). Leave input 2 UNCONNECTED (FLOAT).
      { id: 'wIn1', fromHoleId: 'railTop+_2', toHoleId: 'e_5', color: 'green' },
    ];
    const leds: PlacedLed[] = [{ id: 'ledOut', anodeHoleId: 'e_7', cathodeHoleId: 'railTop-_7' }];

    const res = sim.simulate(ics, wires, leds);
    // In TTL, floating input 2 reads as 1. Since input 1 is 1, 1 AND 1 = 1! LED must be ON.
    expect(res.ledStates.get('ledOut')).toBe(true);
  });

  it('8. Two outputs joined together produces conflict detection', () => {
    const sim = new CircuitSimulator();
    // Connect VCC (1) and GND (0) directly together
    const wires: Wire[] = [
      { id: 'w1', fromHoleId: 'socket-vcc', toHoleId: 'railTop+_1', color: 'red' },
      { id: 'w2', fromHoleId: 'socket-gnd', toHoleId: 'railTop+_1', color: 'black' }, // Shorted to same hole!
    ];
    const res = sim.simulate([], wires, []);
    expect(res.hasConflict).toBe(true);
  });
});
