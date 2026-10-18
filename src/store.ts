/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckResult,
  Experiment,
  PlacedIc,
  PlacedLed,
  PlacedResistor,
  Wire,
  WireColor,
} from './types';
import { EXPERIMENTS } from './data/experiments';
import { CircuitSimulator, SimulationResult, globalSimulator } from './engine/simulate';
import { checkCircuit } from './engine/checker';
import { getCircuitHint } from './data/hints';

export interface CircuitState {
  ics: PlacedIc[];
  wires: Wire[];
  leds: PlacedLed[];
  resistors: PlacedResistor[];
}

const STORAGE_PREFIX = 'deld_circuit_';

export function useCircuitStore() {
  const [currentExpId, setCurrentExpId] = useState<string>('exp1');
  const currentExperiment = EXPERIMENTS.find(e => e.id === currentExpId) || EXPERIMENTS[0];

  // Circuit elements
  const [circuit, setCircuit] = useState<CircuitState>(() => {
    // Try to load saved experiment circuit or default preset
    const exp = EXPERIMENTS.find(e => e.id === 'exp1');
    if (exp?.preset) {
      return {
        ics: exp.preset.ics.map((ic, i) => ({ id: `ic-${i}-${ic.type}`, type: ic.type, startCol: ic.startCol })),
        wires: exp.preset.wires.map((w, i) => ({
          id: `w-${i}`,
          fromHoleId: w.from,
          toHoleId: w.to,
          color: w.color,
          label: w.label,
        })),
        leds: exp.preset.leds.map((l, i) => ({
          id: `led-${i}`,
          anodeHoleId: l.anode,
          cathodeHoleId: l.cathode,
          label: l.label,
        })),
        resistors: [],
      };
    }
    return { ics: [], wires: [], leds: [], resistors: [] };
  });

  // Undo / Redo history
  const [history, setHistory] = useState<CircuitState[]>([]);
  const [redoStack, setRedoStack] = useState<CircuitState[]>([]);

  // Selected tool
  const [activeTool, setActiveTool] = useState<{
    type: 'wire' | 'ic' | 'led' | 'resistor' | 'pointer' | 'delete';
    wireColor?: WireColor;
    icType?: string;
  }>({ type: 'wire', wireColor: 'green' });

  // Wiring in progress: start hole
  const [wireStartHoleId, setWireStartHoleId] = useState<string | null>(null);

  // Hovered hole
  const [hoveredHoleId, setHoveredHoleId] = useState<string | null>(null);

  // Selection
  const [selectedElement, setSelectedElement] = useState<{
    type: 'ic' | 'wire' | 'led' | 'resistor';
    id: string;
  } | null>(null);

  // Clocks and Generator
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [clk1Freq, setClk1Freq] = useState<number>(1.0);
  const [clk2Freq, setClk2Freq] = useState<number>(2.0);
  const [clk1State, setClk1State] = useState<0 | 1>(0);
  const [clk2State, setClk2State] = useState<0 | 1>(0);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation results
  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    globalSimulator.simulate(circuit.ics, circuit.wires, circuit.leds, circuit.resistors, { clk1: 0, clk2: 0 })
  );

  // Check circuit result
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  // User input/output label bindings (for Check My Circuit customization)
  const [bindings, setBindings] = useState<{
    inputHoles: Record<string, string>;
    outputLeds: Record<string, string>;
  }>({ inputHoles: {}, outputLeds: {} });

  // Has user seen tap wire hint?
  const [hasSeenTapHint, setHasSeenTapHint] = useState<boolean>(false);

  // Save state to history before mutation
  const pushHistory = useCallback((newState: CircuitState) => {
    setHistory(prev => [...prev.slice(-30), circuit]);
    setRedoStack([]);
    setCircuit(newState);
  }, [circuit]);

  // Re-run simulation whenever circuit or clocks change
  useEffect(() => {
    const res = globalSimulator.simulate(
      circuit.ics,
      circuit.wires,
      circuit.leds,
      circuit.resistors,
      { clk1: clk1State, clk2: clk2State }
    );
    setSimResult(res);
  }, [circuit, clk1State, clk2State]);

  // Clock ticker when isRunning = true
  useEffect(() => {
    if (!isRunning) return;

    // Timer for Clock 1
    const period1 = (1000 / clk1Freq) / 2; // half-period for 50% duty cycle
    const interval1 = setInterval(() => {
      setClk1State(prev => (prev === 0 ? 1 : 0));
    }, period1);

    // Timer for Clock 2
    const period2 = (1000 / clk2Freq) / 2;
    const interval2 = setInterval(() => {
      setClk2State(prev => (prev === 0 ? 1 : 0));
    }, period2);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [isRunning, clk1Freq, clk2Freq]);

  // Manual Pulse for Clock 1
  const pulseClk1 = useCallback(() => {
    setClk1State(1);
    setTimeout(() => {
      setClk1State(0);
    }, 150);
  }, []);

  // Manual Pulse for Clock 2
  const pulseClk2 = useCallback(() => {
    setClk2State(1);
    setTimeout(() => {
      setClk2State(0);
    }, 150);
  }, []);

  // Run / Stop / Reset
  const handleRun = useCallback(() => setIsRunning(true), []);
  const handleStop = useCallback(() => setIsRunning(false), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setClk1State(0);
    setClk2State(0);
    globalSimulator.resetState();
    const res = globalSimulator.simulate(circuit.ics, circuit.wires, circuit.leds, circuit.resistors, { clk1: 0, clk2: 0 });
    setSimResult(res);
  }, [circuit]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, circuit]);
    setHistory(prev => prev.slice(0, -1));
    setCircuit(previous);
  }, [history, circuit]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, circuit]);
    setRedoStack(prev => prev.slice(0, -1));
    setCircuit(next);
  }, [redoStack, circuit]);

  // Clear All with confirmation
  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all ICs, wires, and LEDs from the breadboard?')) {
      pushHistory({ ics: [], wires: [], leds: [], resistors: [] });
      setCheckResult(null);
      setWireStartHoleId(null);
      setSelectedElement(null);
    }
  }, [pushHistory]);

  // Change Experiment
  const switchExperiment = useCallback((expId: string) => {
    // Auto-save current experiment to localStorage
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${currentExpId}`, JSON.stringify(circuit));
    } catch (e) {
      // Ignore storage errors
    }

    setCurrentExpId(expId);
    setCheckResult(null);
    setWireStartHoleId(null);
    setSelectedElement(null);
    setIsRunning(false);
    globalSimulator.resetState();

    // Check if saved state exists in localStorage
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${expId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCircuit(parsed);
        return;
      } catch (e) {
        // Fall back to preset
      }
    }

    // Load experiment preset if available, or start clean
    const nextExp = EXPERIMENTS.find(e => e.id === expId);
    if (nextExp?.preset) {
      setCircuit({
        ics: nextExp.preset.ics.map((ic, i) => ({ id: `ic-${i}-${ic.type}`, type: ic.type, startCol: ic.startCol })),
        wires: nextExp.preset.wires.map((w, i) => ({
          id: `w-${i}`,
          fromHoleId: w.from,
          toHoleId: w.to,
          color: w.color,
          label: w.label,
        })),
        leds: nextExp.preset.leds.map((l, i) => ({
          id: `led-${i}`,
          anodeHoleId: l.anode,
          cathodeHoleId: l.cathode,
          label: l.label,
        })),
        resistors: [],
      });
    } else {
      setCircuit({ ics: [], wires: [], leds: [], resistors: [] });
    }
  }, [currentExpId, circuit]);

  // Save current circuit explicitly
  const saveCircuit = useCallback(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${currentExpId}`, JSON.stringify(circuit));
      alert('Circuit saved successfully! It will be restored when you return.');
    } catch (e) {
      alert('Could not save to browser storage.');
    }
  }, [currentExpId, circuit]);

  // Export JSON file
  const exportCircuitJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      experimentId: currentExpId,
      circuit,
      savedAt: new Date().toISOString(),
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentExpId}_circuit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [currentExpId, circuit]);

  // Import JSON file
  const importCircuitJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.circuit) {
        pushHistory(parsed.circuit);
        if (parsed.experimentId) {
          setCurrentExpId(parsed.experimentId);
        }
      } else {
        alert('Invalid circuit file format.');
      }
    } catch (e) {
      alert('Failed to parse circuit JSON file.');
    }
  }, [pushHistory]);

  // Load Preset
  const loadPreset = useCallback(() => {
    if (currentExperiment.preset) {
      pushHistory({
        ics: currentExperiment.preset.ics.map((ic, i) => ({ id: `ic-${i}-${ic.type}`, type: ic.type, startCol: ic.startCol })),
        wires: currentExperiment.preset.wires.map((w, i) => ({
          id: `w-${i}`,
          fromHoleId: w.from,
          toHoleId: w.to,
          color: w.color,
          label: w.label,
        })),
        leds: currentExperiment.preset.leds.map((l, i) => ({
          id: `led-${i}`,
          anodeHoleId: l.anode,
          cathodeHoleId: l.cathode,
          label: l.label,
        })),
        resistors: [],
      });
      setCheckResult(null);
    }
  }, [currentExperiment, pushHistory]);

  // Tap wire on rail: flip between + and - rails of same side
  const flipWireRailEnd = useCallback((wireId: string, endpoint: 'from' | 'to') => {
    const wire = circuit.wires.find(w => w.id === wireId);
    if (!wire) return;

    const holeId = endpoint === 'from' ? wire.fromHoleId : wire.toHoleId;
    let newHoleId = holeId;

    if (holeId.startsWith('railTop+')) {
      newHoleId = holeId.replace('railTop+', 'railTop-');
    } else if (holeId.startsWith('railTop-')) {
      newHoleId = holeId.replace('railTop-', 'railTop+');
    } else if (holeId.startsWith('railBottom+')) {
      newHoleId = holeId.replace('railBottom+', 'railBottom-');
    } else if (holeId.startsWith('railBottom-')) {
      newHoleId = holeId.replace('railBottom-', 'railBottom+');
    }

    if (newHoleId !== holeId) {
      const updatedWires = circuit.wires.map(w => {
        if (w.id === wireId) {
          return endpoint === 'from'
            ? { ...w, fromHoleId: newHoleId }
            : { ...w, toHoleId: newHoleId };
        }
        return w;
      });
      pushHistory({ ...circuit, wires: updatedWires });
      setHasSeenTapHint(true);
    }
  }, [circuit, pushHistory]);

  // Add wire
  const addWire = useCallback((fromHoleId: string, toHoleId: string, color?: WireColor) => {
    if (fromHoleId === toHoleId) return;
    const newWire: Wire = {
      id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fromHoleId,
      toHoleId,
      color: color || activeTool.wireColor || 'green',
    };
    pushHistory({
      ...circuit,
      wires: [...circuit.wires, newWire],
    });
  }, [circuit, activeTool, pushHistory]);

  // Add or move IC
  const placeIc = useCallback((type: string, startCol: number) => {
    // Check overlap with existing ICs
    const half = (type === '7483' || type === '74151' || type === '74138' || type === '7476' || type === '74194' || type === '74175') ? 8 : 7;
    const endCol = startCol + half - 1;

    if (startCol < 1 || endCol > 30) return false;

    // Check if overlaps another IC
    for (const other of circuit.ics) {
      const otherHalf = (other.type === '7483' || other.type === '74151' || other.type === '74138' || other.type === '7476' || other.type === '74194' || other.type === '74175') ? 8 : 7;
      const otherEnd = other.startCol + otherHalf - 1;
      if (Math.max(startCol, other.startCol) <= Math.min(endCol, otherEnd)) {
        return false; // Collision
      }
    }

    const newIc: PlacedIc = {
      id: `ic-${Date.now()}-${type}`,
      type,
      startCol,
    };

    pushHistory({
      ...circuit,
      ics: [...circuit.ics, newIc],
    });
    return true;
  }, [circuit, pushHistory]);

  // Add LED
  const placeLed = useCallback((anodeHoleId: string, cathodeHoleId: string, label?: string) => {
    if (anodeHoleId === cathodeHoleId) return;
    const newLed: PlacedLed = {
      id: `led-${Date.now()}`,
      anodeHoleId,
      cathodeHoleId,
      label,
    };
    pushHistory({
      ...circuit,
      leds: [...circuit.leds, newLed],
    });
  }, [circuit, pushHistory]);

  // Delete element
  const deleteElement = useCallback((type: 'ic' | 'wire' | 'led' | 'resistor', id: string) => {
    if (type === 'ic') {
      pushHistory({ ...circuit, ics: circuit.ics.filter(i => i.id !== id) });
    } else if (type === 'wire') {
      pushHistory({ ...circuit, wires: circuit.wires.filter(w => w.id !== id) });
    } else if (type === 'led') {
      pushHistory({ ...circuit, leds: circuit.leds.filter(l => l.id !== id) });
    } else if (type === 'resistor') {
      pushHistory({ ...circuit, resistors: circuit.resistors.filter(r => r.id !== id) });
    }
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  }, [circuit, selectedElement, pushHistory]);

  // Move IC
  const moveIc = useCallback((icId: string, newStartCol: number) => {
    const ic = circuit.ics.find(i => i.id === icId);
    if (!ic) return;
    const half = (ic.type === '7483' || ic.type === '74151' || ic.type === '74138' || ic.type === '7476' || ic.type === '74194' || ic.type === '74175') ? 8 : 7;
    const endCol = newStartCol + half - 1;
    if (newStartCol < 1 || endCol > 30) return;

    // Check collision with other ICs
    for (const other of circuit.ics) {
      if (other.id === icId) continue;
      const otherHalf = (other.type === '7483' || other.type === '74151' || other.type === '74138' || other.type === '7476' || other.type === '74194' || other.type === '74175') ? 8 : 7;
      const otherEnd = other.startCol + otherHalf - 1;
      if (Math.max(newStartCol, other.startCol) <= Math.min(endCol, otherEnd)) {
        return; // Collision
      }
    }

    pushHistory({
      ...circuit,
      ics: circuit.ics.map(i => (i.id === icId ? { ...i, startCol: newStartCol } : i)),
    });
  }, [circuit, pushHistory]);

  // Perform "Check My Circuit"
  const runCheck = useCallback(() => {
    const res = checkCircuit(
      currentExperiment,
      circuit.ics,
      circuit.wires,
      circuit.leds,
      circuit.resistors
    );
    setCheckResult(res);
  }, [currentExperiment, circuit]);

  // Current circuit hint
  const circuitHint = getCircuitHint(
    currentExperiment,
    circuit.ics,
    circuit.wires,
    circuit.leds,
    simResult
  );

  return {
    currentExperiment,
    currentExpId,
    switchExperiment,
    circuit,
    activeTool,
    setActiveTool,
    wireStartHoleId,
    setWireStartHoleId,
    hoveredHoleId,
    setHoveredHoleId,
    selectedElement,
    setSelectedElement,
    isRunning,
    clk1Freq,
    setClk1Freq,
    clk2Freq,
    setClk2Freq,
    clk1State,
    clk2State,
    pulseClk1,
    pulseClk2,
    handleRun,
    handleStop,
    handleReset,
    handleUndo,
    handleRedo,
    handleClearAll,
    saveCircuit,
    exportCircuitJson,
    importCircuitJson,
    loadPreset,
    addWire,
    placeIc,
    placeLed,
    deleteElement,
    moveIc,
    flipWireRailEnd,
    zoom,
    setZoom,
    pan,
    setPan,
    simResult,
    checkResult,
    runCheck,
    circuitHint,
    hasSeenTapHint,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
  };
}
