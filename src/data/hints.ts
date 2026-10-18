/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckResult, Experiment, PlacedIc, PlacedLed, Wire } from '../types';
import { IC_CATALOG } from '../engine/ics';
import { buildNetlist, getIcHoleForPin } from '../engine/netlist';
import { SimulationResult } from '../engine/simulate';

/**
 * Evaluates the circuit against the plain-language hint rules in strict priority order.
 */
export function getCircuitHint(
  experiment: Experiment,
  ics: PlacedIc[],
  wires: Wire[],
  leds: PlacedLed[],
  simResult: SimulationResult
): { status: 'info' | 'warning' | 'error' | 'success'; message: string } {
  // If Free Build
  if (experiment.id === 'free') {
    if (simResult.hasConflict) {
      return { status: 'error', message: 'Two outputs are connected together. Remove one of the conflicting wires.' };
    }
    if (simResult.unpoweredIcs.length > 0) {
      const u = simResult.unpoweredIcs[0];
      return {
        status: 'warning',
        message: `IC ${u.ic.type} is not powered. Connect +5V to pin ${u.vccPin} and GND to pin ${u.gndPin}.`,
      };
    }
    return { status: 'info', message: 'Free Build mode: Place any ICs, LEDs and wires to test circuits freely.' };
  }

  // Rule 1: No IC placed yet
  if (ics.length === 0) {
    return {
      status: 'info',
      message: 'Place the IC from the left panel onto the breadboard first.',
    };
  }

  // Rule 2: An IC is not powered
  if (simResult.unpoweredIcs.length > 0) {
    const unpowered = simResult.unpoweredIcs[0];
    return {
      status: 'warning',
      message: `IC ${unpowered.ic.type} is not powered. Connect +5V to pin ${unpowered.vccPin} and GND to pin ${unpowered.gndPin}.`,
    };
  }

  // Rule 3: The supply VCC or GND socket is not wired
  const netlist = buildNetlist(wires);
  const vccConnected = wires.some(w => w.fromHoleId === 'socket-vcc' || w.toHoleId === 'socket-vcc');
  const gndConnected = wires.some(w => w.fromHoleId === 'socket-gnd' || w.toHoleId === 'socket-gnd');

  if (!vccConnected || !gndConnected) {
    return {
      status: 'warning',
      message: 'Wire the red VCC socket to a red (+) rail and the black GND socket to a blue (-) rail.',
    };
  }

  // Rule 4: A flip-flop or counter has no clock connected (if sequential)
  if (experiment.isSequential) {
    const clk1Hole = 'socket-clk1';
    for (const ic of ics) {
      const def = IC_CATALOG[ic.type];
      if (!def) continue;
      const clkPins = def.pins.filter(p => p.isClock);
      for (const cp of clkPins) {
        const pinHole = getIcHoleForPin(ic, cp.pinNumber);
        // Is it connected to clk1 socket or any clock source?
        const isClkConnected = netlist.areConnected(pinHole, clk1Hole) || 
          wires.some(w => w.fromHoleId === pinHole || w.toHoleId === pinHole);
        if (!isClkConnected) {
          return {
            status: 'warning',
            message: `Connect CLOCK 1 OUT to the clock pin (pin ${cp.pinNumber}) of IC ${ic.type}.`,
          };
        }
      }
    }
  }

  // Rule 5: An LED has cathode not connected to GND
  for (const led of leds) {
    if (!netlist.isHoleGnd(led.cathodeHoleId)) {
      return {
        status: 'warning',
        message: 'Connect the short leg (cathode) of the LED to the blue (-) ground rail.',
      };
    }
  }

  // Rule 6: Two outputs joined together (conflict)
  if (simResult.hasConflict) {
    return {
      status: 'error',
      message: 'Two outputs are connected together. Remove one of the conflicting connections.',
    };
  }

  return {
    status: 'info',
    message: 'Circuit is powered and ready. Click "Check My Circuit" to verify against the lab requirements.',
  };
}
