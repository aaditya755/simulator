/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useCircuitStore } from './store';
import { TitleBar } from './components/TitleBar';
import { Palette } from './components/Palette';
import { FunctionGenerator } from './components/FunctionGenerator';
import { SupplyPanel } from './components/SupplyPanel';
import { Breadboard } from './components/Breadboard';
import { BottomBar } from './components/BottomBar';
import { ExperimentPanel } from './components/ExperimentPanel';
import { HelpModal } from './components/HelpModal';
import { autoDetectBindings } from './engine/checker';
import { toTtlBit } from './engine/ics';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const {
    currentExperiment,
    currentExpId,
    switchExperiment,
    circuit,
    activeTool,
    setActiveTool,
    wireStartHoleId,
    setWireStartHoleId,
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
    flipWireRailEnd,
    zoom,
    setZoom,
    pan,
    setPan,
    simResult,
    checkResult,
    runCheck,
    circuitHint,
    saveStatus,
    canUndo,
    canRedo,
  } = useCircuitStore();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape cancels current action
      if (e.key === 'Escape') {
        setWireStartHoleId(null);
        setActiveTool({ type: 'wire', wireColor: 'green' });
        setSelectedElement(null);
        return;
      }

      // Delete or Backspace removes selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        deleteElement(selectedElement.type, selectedElement.id);
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, handleUndo, handleRedo, setWireStartHoleId, setActiveTool, setSelectedElement]);

  // Handle clicking panel sockets (VCC, GND, CLK1, CLK2)
  const handleSocketClick = (socketId: string) => {
    if (!wireStartHoleId) {
      // Pick matching wire color automatically: Red for VCC, Black for GND, Green/Yellow for Clocks
      let color = activeTool.wireColor || 'green';
      if (socketId === 'socket-vcc') color = 'red';
      else if (socketId === 'socket-gnd') color = 'black';
      else if (socketId === 'socket-clk1') color = 'green';
      else if (socketId === 'socket-clk2') color = 'yellow';

      setActiveTool({ type: 'wire', wireColor: color });
      setWireStartHoleId(socketId);
    } else {
      if (wireStartHoleId !== socketId) {
        addWire(wireStartHoleId, socketId, activeTool.wireColor);
      }
      setWireStartHoleId(null);
    }
  };

  // Determine which rows are live in the current truth table
  const { currentLiveInputs, currentLiveOutputs } = useMemo(() => {
    const bindings = autoDetectBindings(currentExperiment, circuit.wires, circuit.leds);
    const inMap: Record<string, number> = {};
    const outMap: Record<string, number> = {};

    for (const [name, hole] of Object.entries(bindings.inputHoles)) {
      const val = simResult.holeValues.get(hole);
      inMap[name] = toTtlBit(val);
    }

    for (const [name, ledId] of Object.entries(bindings.outputLeds)) {
      const isOn = simResult.ledStates.get(ledId);
      outMap[name] = isOn ? 1 : 0;
    }

    return { currentLiveInputs: inMap, currentLiveOutputs: outMap };
  }, [currentExperiment, circuit.wires, circuit.leds, simResult]);

  // Check if supply sockets are wired to any holes
  const vccConnected = useMemo(
    () => circuit.wires.some(w => w.fromHoleId === 'socket-vcc' || w.toHoleId === 'socket-vcc'),
    [circuit.wires]
  );
  const gndConnected = useMemo(
    () => circuit.wires.some(w => w.fromHoleId === 'socket-gnd' || w.toHoleId === 'socket-gnd'),
    [circuit.wires]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#eef1f6] overflow-hidden text-slate-800">
      {/* 1. Title Bar */}
      <TitleBar
        currentExpId={currentExpId}
        onSelectExperiment={switchExperiment}
        onSave={saveCircuit}
        onExport={exportCircuitJson}
        onImport={importCircuitJson}
        onLoadPreset={loadPreset}
        hasPreset={!!currentExperiment.preset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main 3-Column Working Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Components Palette */}
        <Palette
          currentExperiment={currentExperiment}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
        />

        {/* Center: Instruments + Breadboard + Controls */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#eef1f6]">
          {/* Top Instruments: Function Generator (left) & 5V Supply (right) */}
          <div className="p-2.5 pb-1 flex gap-3 shrink-0">
            <FunctionGenerator
              clk1Freq={clk1Freq}
              setClk1Freq={setClk1Freq}
              clk2Freq={clk2Freq}
              setClk2Freq={setClk2Freq}
              clk1State={clk1State}
              clk2State={clk2State}
              onPulseClk1={pulseClk1}
              onPulseClk2={pulseClk2}
              onSocketClick={handleSocketClick}
              wireStartHoleId={wireStartHoleId}
            />
            <SupplyPanel
              onSocketClick={handleSocketClick}
              wireStartHoleId={wireStartHoleId}
              vccConnected={vccConnected}
              gndConnected={gndConnected}
            />
          </div>

          {/* Center Canvas: Breadboard SVG */}
          <div className="flex-1 p-2.5 pt-1 overflow-hidden relative">
            <div className="w-full h-full rounded-xl border border-[#c9d0dc] overflow-hidden bg-[#eef1f6] shadow-inner relative">
              <Breadboard
                ics={circuit.ics}
                wires={circuit.wires}
                leds={circuit.leds}
                resistors={circuit.resistors}
                activeTool={activeTool}
                wireStartHoleId={wireStartHoleId}
                onSetWireStartHoleId={setWireStartHoleId}
                onAddWire={addWire}
                onPlaceIc={placeIc}
                onPlaceLed={placeLed}
                onDeleteElement={deleteElement}
                onFlipWireRailEnd={flipWireRailEnd}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                simResult={simResult}
                zoom={zoom}
                pan={pan}
                onPanChange={setPan}
              />
            </div>
          </div>

          {/* Bottom Execution Bar */}
          <BottomBar
            isRunning={isRunning}
            onRun={handleRun}
            onStop={handleStop}
            onReset={handleReset}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClearAll={handleClearAll}
            zoom={zoom}
            onZoomIn={() => setZoom(prev => Math.min(prev + 0.15, 2.5))}
            onZoomOut={() => setZoom(prev => Math.max(prev - 0.15, 0.6))}
            onResetZoom={() => {
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
            }}
            selectedElement={selectedElement}
            onDeleteSelected={() => {
              if (selectedElement) deleteElement(selectedElement.type, selectedElement.id);
            }}
          />
        </main>

        {/* Right: This Experiment Panel */}
        <ExperimentPanel
          experiment={currentExperiment}
          ics={circuit.ics}
          wires={circuit.wires}
          leds={circuit.leds}
          checkResult={checkResult}
          onRunCheck={runCheck}
          hint={circuitHint}
          currentInputs={currentLiveInputs}
          currentOutputs={currentLiveOutputs}
          onLoadPreset={loadPreset}
        />
      </div>

      {/* 3. Help & Support Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* 4. Notification Toast */}
      {saveStatus && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}
    </div>
  );
}
