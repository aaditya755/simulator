/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlacedIc, PlacedLed, PlacedResistor, SignalValue, Wire } from '../types';
import { IC_CATALOG, toTtlBit } from './ics';
import { buildNetlist, getIcHoleForPin } from './netlist';

export interface ClockState {
  clk1: 0 | 1;
  clk2: 0 | 1;
}

export interface SimulationResult {
  netValues: Map<string, SignalValue>;          // netRoot -> value
  holeValues: Map<string, SignalValue>;         // holeId -> value
  icPowerStatus: Map<string, boolean>;          // icId -> isPowered
  icStates: Map<string, Record<string, any>>;   // icId -> state
  icPinValues: Map<string, Record<number, SignalValue>>; // icId -> { pin: value }
  ledStates: Map<string, boolean>;              // ledId -> isOn
  hasConflict: boolean;
  conflictHoles: Set<string>;
  unpoweredIcs: Array<{ ic: PlacedIc; vccPin: number; gndPin: number }>;
}

export class CircuitSimulator {
  // Retains internal state of sequential ICs across steps
  private icStates: Map<string, Record<string, any>> = new Map();
  private prevPinValues: Map<string, Record<number, SignalValue>> = new Map();

  resetState(): void {
    this.icStates.clear();
    this.prevPinValues.clear();
  }

  setIcState(icId: string, state: Record<string, any>): void {
    this.icStates.set(icId, { ...state });
  }

  simulate(
    ics: PlacedIc[],
    wires: Wire[],
    leds: PlacedLed[] = [],
    resistors: PlacedResistor[] = [],
    clocks: ClockState = { clk1: 0, clk2: 0 },
    forceInputs?: Record<string, 0 | 1> // For experiment checking harness
  ): SimulationResult {
    const netlist = buildNetlist(wires, resistors);
    const uf = netlist.uf;

    const vccRoot = uf.find('socket-vcc');
    const gndRoot = uf.find('socket-gnd');
    const clk1Root = uf.find('socket-clk1');
    const clk2Root = uf.find('socket-clk2');

    // 1. Check power for each IC
    const icPowerStatus = new Map<string, boolean>();
    const unpoweredIcs: Array<{ ic: PlacedIc; vccPin: number; gndPin: number }> = [];

    for (const ic of ics) {
      const def = IC_CATALOG[ic.type];
      if (!def) continue;

      const vccHole = getIcHoleForPin(ic, def.vccPin);
      const gndHole = getIcHoleForPin(ic, def.gndPin);

      const hasVcc = uf.find(vccHole) === vccRoot;
      const hasGnd = uf.find(gndHole) === gndRoot;

      const isPowered = hasVcc && hasGnd;
      icPowerStatus.set(ic.id, isPowered);
      if (!isPowered) {
        unpoweredIcs.push({ ic, vccPin: def.vccPin, gndPin: def.gndPin });
      }
    }

    // Initialize IC states if not yet initialized
    for (const ic of ics) {
      const def = IC_CATALOG[ic.type];
      if (def && def.initialState && !this.icStates.has(ic.id)) {
        this.icStates.set(ic.id, { ...def.initialState });
      }
    }

    // Keep track of outputs driven by ICs
    const icOutputs = new Map<string, Record<number, SignalValue>>();
    for (const ic of ics) {
      icOutputs.set(ic.id, {});
    }

    // Helper to resolve nets given current drivers
    const resolveNets = (): {
      netValues: Map<string, SignalValue>;
      conflictNets: Set<string>;
    } => {
      const netDrivers = new Map<string, Set<0 | 1>>();

      const addDriver = (root: string, val: 0 | 1) => {
        if (!netDrivers.has(root)) netDrivers.set(root, new Set());
        netDrivers.get(root)!.add(val);
      };

      // Fixed drivers from panels
      addDriver(vccRoot, 1);
      addDriver(gndRoot, 0);
      addDriver(clk1Root, clocks.clk1);
      addDriver(clk2Root, clocks.clk2);

      // Force inputs for automated experiment checking
      if (forceInputs) {
        for (const [holeId, forcedVal] of Object.entries(forceInputs)) {
          addDriver(uf.find(holeId), forcedVal);
        }
      }

      // IC output drivers (only if powered)
      for (const ic of ics) {
        if (!icPowerStatus.get(ic.id)) continue;
        const outputs = icOutputs.get(ic.id) || {};
        for (const [pinStr, val] of Object.entries(outputs)) {
          const pin = Number(pinStr);
          if (val === 0 || val === 1) {
            const hole = getIcHoleForPin(ic, pin);
            addDriver(uf.find(hole), val);
          }
        }
      }

      const netValues = new Map<string, SignalValue>();
      const conflictNets = new Set<string>();

      for (const [root, drivers] of netDrivers.entries()) {
        if (drivers.size > 1) {
          netValues.set(root, 'CONFLICT');
          conflictNets.add(root);
        } else if (drivers.size === 1) {
          netValues.set(root, Array.from(drivers)[0]);
        }
      }

      return { netValues, conflictNets };
    };

    // Helper to read current pin value for an IC
    const getPinValue = (ic: PlacedIc, pin: number, netValues: Map<string, SignalValue>): SignalValue => {
      const hole = getIcHoleForPin(ic, pin);
      const root = uf.find(hole);
      return netValues.get(root) ?? 'FLOAT';
    };

    // Simulation loop for ripple propagation
    let outerIterations = 0;
    const MAX_OUTER_CYCLES = 20;

    let hasConflict = false;
    let conflictNets = new Set<string>();
    let netValues = new Map<string, SignalValue>();

    while (outerIterations < MAX_OUTER_CYCLES) {
      outerIterations++;
      let stateChangedInCycle = false;

      // Inner combinational convergence loop
      let combIterations = 0;
      const MAX_COMB = 50;
      let combChanged = true;

      while (combChanged && combIterations < MAX_COMB) {
        combIterations++;
        combChanged = false;

        const resolved = resolveNets();
        netValues = resolved.netValues;
        conflictNets = resolved.conflictNets;
        if (conflictNets.size > 0) hasConflict = true;

        for (const ic of ics) {
          if (!icPowerStatus.get(ic.id)) {
            // Unpowered IC drives FLOAT
            const currOut = icOutputs.get(ic.id) || {};
            for (const k of Object.keys(currOut)) {
              delete currOut[Number(k)];
            }
            continue;
          }

          const def = IC_CATALOG[ic.type];
          if (!def) continue;

          // Gather input pin values
          const inVals: Record<number, SignalValue> = {};
          for (const p of def.pins) {
            inVals[p.pinNumber] = getPinValue(ic, p.pinNumber, netValues);
          }

          let newOutputs: Record<number, SignalValue> = {};

          if (def.evaluate) {
            newOutputs = def.evaluate(inVals);
          } else if (def.evaluateSequential) {
            const state = this.icStates.get(ic.id) || {};
            const res = def.evaluateSequential(inVals, state);
            this.icStates.set(ic.id, res.nextState);
            newOutputs = res.outputs;
          }

          const currOut = icOutputs.get(ic.id) || {};
          for (const [pinStr, val] of Object.entries(newOutputs)) {
            const pin = Number(pinStr);
            if (currOut[pin] !== val) {
              currOut[pin] = val;
              combChanged = true;
            }
          }
        }
      }

      // Edge detection for sequential ICs
      // Compare current clock pin values with prevPinValues
      for (const ic of ics) {
        if (!icPowerStatus.get(ic.id)) continue;
        const def = IC_CATALOG[ic.type];
        if (!def || !def.onClockEdge) continue;

        const prevPins = this.prevPinValues.get(ic.id);
        if (!prevPins) {
          // First time this IC is evaluated - establish baseline without firing clock edge
          continue;
        }
        const activeEdgePins: number[] = [];

        // Check clock pins for edges
        const inVals: Record<number, SignalValue> = {};
        for (const p of def.pins) {
          inVals[p.pinNumber] = getPinValue(ic, p.pinNumber, netValues);
          if (p.isClock) {
            const currentLevel = toTtlBit(inVals[p.pinNumber]);
            const prevLevel = prevPins[p.pinNumber] !== undefined ? toTtlBit(prevPins[p.pinNumber]) : currentLevel;

            // Negative-edge vs Positive-edge:
            // 7476, 7490, 7495 are negative-edge triggered
            // 7474, 74194, 74175 are positive-edge triggered
            const isNegEdgeTriggered = ['7476', '7490', '7495'].includes(ic.type);
            if (isNegEdgeTriggered) {
              if (prevLevel === 1 && currentLevel === 0) {
                activeEdgePins.push(p.pinNumber);
              }
            } else {
              if (prevLevel === 0 && currentLevel === 1) {
                activeEdgePins.push(p.pinNumber);
              }
            }
          }
        }

        if (activeEdgePins.length > 0) {
          const currentState = this.icStates.get(ic.id) || {};
          const seqResult = def.onClockEdge(activeEdgePins, inVals, currentState);
          this.icStates.set(ic.id, seqResult.nextState);

          const currOut = icOutputs.get(ic.id) || {};
          for (const [pinStr, val] of Object.entries(seqResult.outputs)) {
            const pin = Number(pinStr);
            if (currOut[pin] !== val) {
              currOut[pin] = val;
              stateChangedInCycle = true;
            }
          }
        }
      }

      // Update stored pin values for next edge check
      for (const ic of ics) {
        const def = IC_CATALOG[ic.type];
        if (!def) continue;
        const currPins: Record<number, SignalValue> = {};
        for (const p of def.pins) {
          currPins[p.pinNumber] = getPinValue(ic, p.pinNumber, netValues);
        }
        this.prevPinValues.set(ic.id, currPins);
      }

      if (!stateChangedInCycle) {
        break; // Reached stable state
      }
    }

    // Build final hole values map and conflict holes
    const holeValues = new Map<string, SignalValue>();
    const conflictHoles = new Set<string>();

    const checkHole = (h: string) => {
      const root = uf.find(h);
      const val = netValues.get(root) ?? 'FLOAT';
      holeValues.set(h, val);
      if (conflictNets.has(root)) {
        conflictHoles.add(h);
      }
    };

    for (const wire of wires) {
      checkHole(wire.fromHoleId);
      checkHole(wire.toHoleId);
    }

    for (const ic of ics) {
      const def = IC_CATALOG[ic.type];
      if (!def) continue;
      for (let p = 1; p <= def.pinCount; p++) {
        const h = getIcHoleForPin(ic, p);
        checkHole(h);
      }
    }

    for (const led of leds) {
      checkHole(led.anodeHoleId);
      checkHole(led.cathodeHoleId);
    }

    // Pin values map for inspect tooltips
    const icPinValues = new Map<string, Record<number, SignalValue>>();
    for (const ic of ics) {
      const def = IC_CATALOG[ic.type];
      if (!def) continue;
      const pVals: Record<number, SignalValue> = {};
      for (const p of def.pins) {
        const h = getIcHoleForPin(ic, p.pinNumber);
        const root = uf.find(h);
        pVals[p.pinNumber] = netValues.get(root) ?? 'FLOAT';
      }
      icPinValues.set(ic.id, pVals);
    }

    // Evaluate LED states: Anode must be 1 AND Cathode must be 0 (GND)
    const ledStates = new Map<string, boolean>();
    for (const led of leds) {
      const aVal = netValues.get(uf.find(led.anodeHoleId));
      const cVal = netValues.get(uf.find(led.cathodeHoleId));
      const isOn = aVal === 1 && cVal === 0;
      ledStates.set(led.id, isOn);
    }

    return {
      netValues,
      holeValues,
      icPowerStatus,
      icStates: new Map(this.icStates),
      icPinValues,
      ledStates,
      hasConflict,
      conflictHoles,
      unpoweredIcs,
    };
  }
}

export const globalSimulator = new CircuitSimulator();
