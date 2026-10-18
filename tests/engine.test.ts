/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { UnionFind, buildNetlist } from '../src/engine/netlist';
import { IC_CATALOG } from '../src/engine/ics';
import { CircuitSimulator } from '../src/engine/simulate';
import { PlacedIc, PlacedLed, Wire } from '../src/types';

describe('1. Union-Find & Netlist Engine', () => {
  it('correctly unions and checks connectivity', () => {
    const uf = new UnionFind();
    uf.union('a', 'b');
    uf.union('b', 'c');
    expect(uf.connected('a', 'c')).toBe(true);
    expect(uf.connected('a', 'd')).toBe(false);
  });

  it('groups breadboard terminal strips and power rails correctly', () => {
    const netlist = buildNetlist([
      { id: 'w1', fromHoleId: 'socket-vcc', toHoleId: 'railTop+_1', color: 'red' },
      { id: 'w2', fromHoleId: 'socket-gnd', toHoleId: 'railTop-_1', color: 'black' },
    ]);

    // Rail top plus: all holes 1..30 should be connected to socket-vcc
    expect(netlist.isHoleVcc('railTop+_1')).toBe(true);
    expect(netlist.isHoleVcc('railTop+_15')).toBe(true);
    expect(netlist.isHoleVcc('railTop+_30')).toBe(true);

    // Rail top minus: all holes 1..30 should be connected to socket-gnd
    expect(netlist.isHoleGnd('railTop-_1')).toBe(true);
    expect(netlist.isHoleGnd('railTop-_20')).toBe(true);

    // Terminal strip vertical grouping: rows j, i, h, g, f in col 12 are connected together
    expect(netlist.areConnected('j_12', 'f_12')).toBe(true);
    // But upper strip col 12 is NOT connected to lower strip col 12 across center channel
    expect(netlist.areConnected('f_12', 'e_12')).toBe(false);
  });
});

describe('2. TTL Gate ICs (7486, 7408, 7432)', () => {
  it('7486 quad XOR gates behave correctly', () => {
    const ic = IC_CATALOG['7486'];
    expect(ic).toBeDefined();

    // Test Gate 1: pins 1, 2 -> 3
    expect(ic.evaluate!({ 1: 0, 2: 0 })[3]).toBe(0);
    expect(ic.evaluate!({ 1: 0, 2: 1 })[3]).toBe(1);
    expect(ic.evaluate!({ 1: 1, 2: 0 })[3]).toBe(1);
    expect(ic.evaluate!({ 1: 1, 2: 1 })[3]).toBe(0);

    // Unconnected (FLOAT) floats HIGH in TTL: 1 ^ 1 = 0
    expect(ic.evaluate!({ 1: 'FLOAT', 2: 'FLOAT' })[3]).toBe(0);
  });

  it('7408 quad AND gates behave correctly', () => {
    const ic = IC_CATALOG['7408'];
    expect(ic.evaluate!({ 1: 0, 2: 0 })[3]).toBe(0);
    expect(ic.evaluate!({ 1: 1, 2: 0 })[3]).toBe(0);
    expect(ic.evaluate!({ 1: 1, 2: 1 })[3]).toBe(1);
  });

  it('7432 quad OR gates behave correctly', () => {
    const ic = IC_CATALOG['7432'];
    expect(ic.evaluate!({ 1: 0, 2: 0 })[3]).toBe(0);
    expect(ic.evaluate!({ 1: 1, 2: 0 })[3]).toBe(1);
    expect(ic.evaluate!({ 1: 0, 2: 1 })[3]).toBe(1);
    expect(ic.evaluate!({ 1: 1, 2: 1 })[3]).toBe(1);
  });
});

describe('3. 7483 4-Bit Binary Full Adder', () => {
  it('adds two 4-bit binary numbers with carry', () => {
    const ic = IC_CATALOG['7483'];
    expect(ic.vccPin).toBe(5);
    expect(ic.gndPin).toBe(12);

    // Test: 5 (0101) + 3 (0011) + Cin 0 = 8 (1000)
    // A: A1=1 (pin 10), A2=0 (pin 8), A3=1 (pin 3), A4=0 (pin 1)
    // B: B1=1 (pin 11), B2=1 (pin 7), B3=0 (pin 4), B4=0 (pin 16)
    // C0: pin 13 = 0
    const out = ic.evaluate!({
      10: 1, 8: 0, 3: 1, 1: 0, // A = 5
      11: 1, 7: 1, 4: 0, 16: 0, // B = 3
      13: 0,                   // C0 = 0
    });

    // Sum should be 8: S1=0 (pin 9), S2=0 (pin 6), S3=0 (pin 2), S4=1 (pin 15), C4=0 (pin 14)
    expect(out[9]).toBe(0);
    expect(out[6]).toBe(0);
    expect(out[2]).toBe(0);
    expect(out[15]).toBe(1);
    expect(out[14]).toBe(0);

    // Test with overflow / carry: 9 (1001) + 8 (1000) = 17 -> sum 1, carry 1
    const carryOut = ic.evaluate!({
      10: 1, 8: 0, 3: 0, 1: 1, // A = 9
      11: 0, 7: 0, 4: 0, 16: 1, // B = 8
      13: 0,                   // C0 = 0
    });
    expect(carryOut[9]).toBe(1); // S1 = 1
    expect(carryOut[6]).toBe(0); // S2 = 0
    expect(carryOut[2]).toBe(0); // S3 = 0
    expect(carryOut[15]).toBe(0); // S4 = 0
    expect(carryOut[14]).toBe(1); // C4 = 1
  });
});

describe('4. 7476 Dual JK Flip-Flop & Ripple Counter', () => {
  it('toggles on negative clock edge when J=1, K=1', () => {
    const ic = IC_CATALOG['7476'];
    const state = { q1: 0, q2: 0 };

    // Inputs: PRE=1, CLR=1 (inactive), J=1 (pin 4), K=1 (pin 16)
    const inputs = { 2: 1 as const, 3: 1 as const, 4: 1 as const, 16: 1 as const };

    // 1st negative edge on 1CLK (pin 1)
    const res1 = ic.onClockEdge!([1], inputs, state);
    expect(res1.nextState.q1).toBe(1);
    expect(res1.outputs[15]).toBe(1); // 1Q
    expect(res1.outputs[14]).toBe(0); // 1Q~

    // 2nd negative edge on 1CLK
    const res2 = ic.onClockEdge!([1], inputs, res1.nextState);
    expect(res2.nextState.q1).toBe(0);
    expect(res2.outputs[15]).toBe(0);
    expect(res2.outputs[14]).toBe(1);
  });

  it('simulates a 2-bit asynchronous ripple counter', () => {
    const sim = new CircuitSimulator();

    // Build circuit:
    // IC 7476 at startCol 10
    // VCC at pin 5 (e_14), GND at pin 13 (f_13)
    const ics: PlacedIc[] = [{ id: 'ic-7476', type: '7476', startCol: 10 }];
    const wires: Wire[] = [
      // Power supply to rails
      { id: 'w1', fromHoleId: 'socket-vcc', toHoleId: 'railTop+_1', color: 'red' },
      { id: 'w2', fromHoleId: 'socket-gnd', toHoleId: 'railTop-_1', color: 'black' },
      { id: 'w3', fromHoleId: 'railTop+_30', toHoleId: 'railBottom+_30', color: 'red' },
      { id: 'w4', fromHoleId: 'railTop-_30', toHoleId: 'railBottom-_30', color: 'black' },
      // Power IC: VCC pin 5 is e_14, GND pin 13 is f_13
      { id: 'w5', fromHoleId: 'railTop+_14', toHoleId: 'e_14', color: 'red' },
      { id: 'w6', fromHoleId: 'railBottom-_13', toHoleId: 'f_13', color: 'black' },
      // PRE & CLR inactive (+5V)
      { id: 'w7', fromHoleId: 'railTop+_11', toHoleId: 'e_11', color: 'red' }, // 1PRE (pin 2)
      { id: 'w8', fromHoleId: 'railTop+_12', toHoleId: 'e_12', color: 'red' }, // 1CLR (pin 3)
      { id: 'w9', fromHoleId: 'railTop+_16', toHoleId: 'e_16', color: 'red' }, // 2PRE (pin 7)
      { id: 'w10', fromHoleId: 'railTop+_17', toHoleId: 'e_17', color: 'red' }, // 2CLR (pin 8)
      // J & K tied to +5V (toggle)
      { id: 'w11', fromHoleId: 'railTop+_13', toHoleId: 'e_13', color: 'red' }, // 1J (pin 4)
      { id: 'w12', fromHoleId: 'railBottom+_10', toHoleId: 'f_10', color: 'red' }, // 1K (pin 16)
      { id: 'w13', fromHoleId: 'railBottom+_17', toHoleId: 'f_17', color: 'red' }, // 2J (pin 9)
      { id: 'w14', fromHoleId: 'railBottom+_14', toHoleId: 'f_14', color: 'red' }, // 2K (pin 12)
      // Clock 1 -> FF1 CLK (pin 1, e_10)
      { id: 'w15', fromHoleId: 'socket-clk1', toHoleId: 'e_10', color: 'green' },
      // FF1 1Q (pin 15, f_11) -> FF2 2CLK (pin 6, e_15)
      { id: 'w16', fromHoleId: 'f_11', toHoleId: 'e_15', color: 'yellow' },
    ];

    const leds: PlacedLed[] = [
      { id: 'led-q0', anodeHoleId: 'f_11', cathodeHoleId: 'railBottom-_11', label: 'Q0' },
      { id: 'led-q1', anodeHoleId: 'f_15', cathodeHoleId: 'railBottom-_15', label: 'Q1' },
    ];

    // Initial state: clock = 0
    let res = sim.simulate(ics, wires, leds, [], { clk1: 0, clk2: 0 });
    expect(res.ledStates.get('led-q0')).toBe(false);
    expect(res.ledStates.get('led-q1')).toBe(false);

    // Pulse 1: Clock High then Low (falling edge triggers FF1)
    sim.simulate(ics, wires, leds, [], { clk1: 1, clk2: 0 });
    res = sim.simulate(ics, wires, leds, [], { clk1: 0, clk2: 0 });
    // State should now be Q1=0, Q0=1 (Count = 1)
    expect(res.ledStates.get('led-q0')).toBe(true);
    expect(res.ledStates.get('led-q1')).toBe(false);

    // Pulse 2: Clock High then Low (FF1 toggles 1 -> 0; falling edge on FF2 triggers FF2 0 -> 1)
    sim.simulate(ics, wires, leds, [], { clk1: 1, clk2: 0 });
    res = sim.simulate(ics, wires, leds, [], { clk1: 0, clk2: 0 });
    // State should now be Q1=1, Q0=0 (Count = 2)
    expect(res.ledStates.get('led-q0')).toBe(false);
    expect(res.ledStates.get('led-q1')).toBe(true);

    // Pulse 3: Count = 3 (Q1=1, Q0=1)
    sim.simulate(ics, wires, leds, [], { clk1: 1, clk2: 0 });
    res = sim.simulate(ics, wires, leds, [], { clk1: 0, clk2: 0 });
    expect(res.ledStates.get('led-q0')).toBe(true);
    expect(res.ledStates.get('led-q1')).toBe(true);

    // Pulse 4: Count = 0 (Q1=0, Q0=0 - wrapped around)
    sim.simulate(ics, wires, leds, [], { clk1: 1, clk2: 0 });
    res = sim.simulate(ics, wires, leds, [], { clk1: 0, clk2: 0 });
    expect(res.ledStates.get('led-q0')).toBe(false);
    expect(res.ledStates.get('led-q1')).toBe(false);
  });
});
