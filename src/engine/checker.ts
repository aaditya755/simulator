/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckResult, Experiment, PlacedIc, PlacedLed, PlacedResistor, Wire } from '../types';
import { CircuitSimulator } from './simulate';

export interface CircuitBinding {
  inputHoles: Record<string, string>; // InputName -> HoleId on circuit where input wire lands
  outputLeds: Record<string, string>; // OutputName -> LedId
}

/**
 * Automatically discovers likely input wires and output LEDs
 * An input wire is one that connects a power rail (+ or -) to an IC pin or internal strip.
 */
export function autoDetectBindings(
  experiment: Experiment,
  wires: Wire[],
  leds: PlacedLed[]
): CircuitBinding {
  const isRail = (id: string) => id.startsWith('railTop') || id.startsWith('railBottom');

  // Candidate input wires: one end on rail, other end on breadboard terminal strip
  const inputWires = wires.filter(w => 
    (isRail(w.fromHoleId) && !isRail(w.toHoleId) && !w.toHoleId.startsWith('socket')) ||
    (isRail(w.toHoleId) && !isRail(w.fromHoleId) && !w.fromHoleId.startsWith('socket'))
  );

  const inputHoles: Record<string, string> = {};
  const expInputs = experiment.inputNames.filter(name => name !== 'CLK');

  for (let i = 0; i < expInputs.length; i++) {
    const inputName = expInputs[i];
    // First check if user explicitly labeled a wire
    const labeledWire = inputWires.find(w => w.label?.toLowerCase() === inputName.toLowerCase());
    if (labeledWire) {
      inputHoles[inputName] = isRail(labeledWire.fromHoleId) ? labeledWire.toHoleId : labeledWire.fromHoleId;
    } else if (i < inputWires.length) {
      const w = inputWires[i];
      inputHoles[inputName] = isRail(w.fromHoleId) ? w.toHoleId : w.fromHoleId;
    }
  }

  // Candidate output LEDs
  const outputLeds: Record<string, string> = {};
  for (let i = 0; i < experiment.outputNames.length; i++) {
    const outName = experiment.outputNames[i];
    const labeledLed = leds.find(l => l.label?.toLowerCase() === outName.toLowerCase());
    if (labeledLed) {
      outputLeds[outName] = labeledLed.id;
    } else if (i < leds.length) {
      outputLeds[outName] = leds[i].id;
    }
  }

  return { inputHoles, outputLeds };
}

/**
 * Checks a combinational or sequential experiment
 */
export function checkCircuit(
  experiment: Experiment,
  ics: PlacedIc[],
  wires: Wire[],
  leds: PlacedLed[],
  resistors: PlacedResistor[] = [],
  customBindings?: CircuitBinding
): CheckResult {
  if (experiment.checkerType === 'free') {
    return {
      passed: true,
      headline: 'Free Build Mode',
      details: 'No tests required in Free Build.',
    };
  }

  if (ics.length === 0) {
    return {
      passed: false,
      headline: 'No IC Placed',
      details: 'Please place the required ICs on the breadboard first.',
      hint: 'Select the IC from the left panel and click on the breadboard.',
    };
  }

  const bindings = customBindings || autoDetectBindings(experiment, wires, leds);
  const sim = new CircuitSimulator();

  // Initial check: is circuit powered?
  const initialSim = sim.simulate(ics, wires, leds, resistors, { clk1: 0, clk2: 0 });
  if (initialSim.unpoweredIcs.length > 0) {
    const u = initialSim.unpoweredIcs[0];
    return {
      passed: false,
      headline: 'IC Not Powered',
      details: `IC ${u.ic.type} is not receiving power. Connect +5V to pin ${u.vccPin} and GND to pin ${u.gndPin}.`,
      hint: `Check that your VCC wire connects to pin ${u.vccPin} and your GND wire connects to pin ${u.gndPin}.`,
    };
  }

  if (initialSim.hasConflict) {
    return {
      passed: false,
      headline: 'Short Circuit / Output Conflict',
      details: 'Two outputs or power rails are directly shorted together.',
      hint: 'Check your connections. Remove one of the conflicting wires.',
    };
  }

  // -------------------------------------------------------------
  // Combinational Experiment Checking
  // -------------------------------------------------------------
  if (experiment.checkerType === 'combinational' && experiment.truthTable) {
    const table = experiment.truthTable;
    const requiredInputs = experiment.inputNames;
    const requiredOutputs = experiment.outputNames;

    // Check that we have bindings for required inputs and outputs
    for (const inName of requiredInputs) {
      if (!bindings.inputHoles[inName]) {
        return {
          passed: false,
          headline: `Input "${inName}" Not Found`,
          details: `Could not identify an input wire for "${inName}". Wire a connection from the power rails to the circuit input.`,
          hint: `Connect a wire from the + or - rail to the pin for input ${inName}.`,
        };
      }
    }

    for (const outName of requiredOutputs) {
      if (!bindings.outputLeds[outName]) {
        return {
          passed: false,
          headline: `Output LED "${outName}" Not Found`,
          details: `Could not identify an output LED for "${outName}". Place an LED with anode on the output pin and cathode to GND.`,
          hint: `Plug an LED into the breadboard to monitor "${outName}".`,
        };
      }
    }

    // Temporarily disconnect the rail wires leading to the input holes so the test driver can set 0 and 1
    const inputHolesSet = new Set(Object.values(bindings.inputHoles));
    const testWires = wires.filter(w => {
      const isRailFrom = w.fromHoleId.startsWith('railTop') || w.fromHoleId.startsWith('railBottom');
      const isRailTo = w.toHoleId.startsWith('railTop') || w.toHoleId.startsWith('railBottom');
      const connectsToInputHole = inputHolesSet.has(w.fromHoleId) || inputHolesSet.has(w.toHoleId);
      return !(connectsToInputHole && (isRailFrom || isRailTo));
    });

    // Test each row of the truth table
    for (let r = 0; r < table.length; r++) {
      const row = table[r];
      const forceMap: Record<string, 0 | 1> = {};

      for (const [inName, expectedVal] of Object.entries(row.inputs)) {
        const hole = bindings.inputHoles[inName];
        if (hole) {
          forceMap[hole] = expectedVal as 0 | 1;
        }
      }

      const rowSim = sim.simulate(ics, testWires, leds, resistors, { clk1: 0, clk2: 0 }, forceMap);

      // Check outputs
      for (const [outName, expectedBit] of Object.entries(row.outputs)) {
        const ledId = bindings.outputLeds[outName];
        const ledActual = rowSim.ledStates.get(ledId) ? 1 : 0;

        if (ledActual !== expectedBit) {
          const inputDescription = Object.entries(row.inputs)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');

          return {
            passed: false,
            headline: `Truth Table Mismatch on Row ${r + 1}`,
            details: `For inputs (${inputDescription}): expected ${outName}=${expectedBit}, but your LED showed ${ledActual}.`,
            failedRowIndex: r,
            hint: `Double-check your logic wiring for the ${outName} output.`,
          };
        }
      }
    }

    return {
      passed: true,
      headline: 'Well done! Circuit works.',
      details: `All ${table.length} rows of the truth table passed verification successfully!`,
    };
  }

  // -------------------------------------------------------------
  // Sequential Experiment Checking
  // -------------------------------------------------------------
  if (experiment.checkerType === 'sequential') {
    sim.resetState();

    // Check if clock socket is wired
    const clkConnected = wires.some(w => w.fromHoleId === 'socket-clk1' || w.toHoleId === 'socket-clk1');
    if (!clkConnected) {
      return {
        passed: false,
        headline: 'Clock Not Connected',
        details: 'Connect CLOCK 1 OUT from the function generator to the clock pin of your circuit.',
        hint: 'Click CLOCK 1 OUT socket and wire it to the clock input pin.',
      };
    }

    // Expected sequence test
    const expectedSeq = experiment.expectedSequence || [
      { step: 0, clock: 0, outputs: { Q1: 0, Q0: 0 } },
      { step: 1, clock: 1, outputs: { Q1: 0, Q0: 1 } },
      { step: 2, clock: 2, outputs: { Q1: 1, Q0: 0 } },
      { step: 3, clock: 3, outputs: { Q1: 1, Q0: 1 } },
      { step: 4, clock: 4, outputs: { Q1: 0, Q0: 0 } },
    ];

    // For Mod-N counter
    if (experiment.id === 'exp9') {
      const n = experiment.sampleOptions?.[0]?.modulo || 6;
      // Initialize baseline at clk1=0
      sim.simulate(ics, wires, leds, resistors, { clk1: 0, clk2: 0 });
      let clkLevel: 0 | 1 = 0;
      for (let cycle = 0; cycle < n * 2; cycle++) {
        // Toggle clock: 1 then 0 (falling edge)
        clkLevel = 1;
        sim.simulate(ics, wires, leds, resistors, { clk1: clkLevel, clk2: 0 });
        clkLevel = 0;
        const res = sim.simulate(ics, wires, leds, resistors, { clk1: clkLevel, clk2: 0 });

        const expectedCount = (cycle + 1) % n;
        // Verify LEDs QD, QC, QB, QA
        const expQD = (expectedCount >> 3) & 1;
        const expQC = (expectedCount >> 2) & 1;
        const expQB = (expectedCount >> 1) & 1;
        const expQA = expectedCount & 1;

        const ledQD = bindings.outputLeds['QD'] ? (res.ledStates.get(bindings.outputLeds['QD']) ? 1 : 0) : null;
        const ledQC = bindings.outputLeds['QC'] ? (res.ledStates.get(bindings.outputLeds['QC']) ? 1 : 0) : null;
        const ledQB = bindings.outputLeds['QB'] ? (res.ledStates.get(bindings.outputLeds['QB']) ? 1 : 0) : null;
        const ledQA = bindings.outputLeds['QA'] ? (res.ledStates.get(bindings.outputLeds['QA']) ? 1 : 0) : null;

        if (ledQA !== null && ledQA !== expQA) {
          return {
            passed: false,
            headline: `Counter Step Mismatch at Count ${expectedCount}`,
            details: `After pulse ${cycle + 1}, expected QA=${expQA}, but LED showed ${ledQA}.`,
            hint: 'Check that QA is wired to CKB and reset pins are wired correctly.',
          };
        }
      }

      return {
        passed: true,
        headline: 'Well done! Circuit works.',
        details: `Modulo-${n} counter sequence successfully verified through ${n * 2} clock cycles!`,
      };
    }

    // Step-by-step clock pulses: initialize baseline at clk1=0
    sim.simulate(ics, wires, leds, resistors, { clk1: 0, clk2: 0 });
    let currentClock: 0 | 1 = 0;
    for (let s = 1; s < expectedSeq.length; s++) {
      const stepItem = expectedSeq[s];
      // Generate clock cycle: High then Low
      currentClock = 1;
      sim.simulate(ics, wires, leds, resistors, { clk1: currentClock, clk2: 0 });
      currentClock = 0;
      const stepSim = sim.simulate(ics, wires, leds, resistors, { clk1: currentClock, clk2: 0 });

      for (const [outName, expectedBit] of Object.entries(stepItem.outputs)) {
        const ledId = bindings.outputLeds[outName];
        if (ledId) {
          const actualBit = stepSim.ledStates.get(ledId) ? 1 : 0;
          if (actualBit !== expectedBit) {
            return {
              passed: false,
              headline: `Sequence Mismatch at Step ${s}`,
              details: `At clock pulse ${s}, expected ${outName}=${expectedBit}, but LED showed ${actualBit}.`,
              failedRowIndex: s,
              hint: `Verify that flip-flop J/K inputs and clock connections are wired according to the lab guide.`,
            };
          }
        }
      }
    }

    return {
      passed: true,
      headline: 'Well done! Circuit works.',
      details: 'All state transitions and clock pulses matched the expected sequential behavior!',
    };
  }

  return {
    passed: true,
    headline: 'Circuit ready',
    details: 'All basic checks passed.',
  };
}
