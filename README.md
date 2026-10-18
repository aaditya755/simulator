# Digital Electronics Lab Simulator (TTL 74xx)

> **🌐 Live Hosted Simulator:** [https://simulator-jgl1.onrender.com/](https://simulator-jgl1.onrender.com/)

An interactive, high-fidelity browser-based digital logic laboratory and breadboard simulator designed for engineering students and instructors (Course 2301207 Digital Electronics Lab, K.K. Wagh Institute of Engineering Education & Research).

---

## 🚀 Key Features

- **Realistic Breadboard Canvas**:
  - Full 30-column standard breadboard with upper and lower terminal strips (rows `j`-`f` and `e`-`a`) and horizontal dual power rails (`+` and `-`).
  - **Exact IC Pin Seating**: IC legs and metallic terminal leads seat squarely inside the breadboard hole boxes without protruding outside.
  - Multi-colored jumper wires (Red, Black, Blue, Yellow, Green, White) with realistic curved Bézier trajectories and endpoint highlights.
  - Interactive **Tap-Wire Quick-Flip**: Click any wire endpoint seated on a power rail to instantly flip between +5V (`1`) and GND (`0`) without rewiring.
- **Dynamic LED Indicators**:
  - Realistic epoxy lens with internal anvil/cathode cup and luminous glow.
  - **Dynamic Blinking**: LEDs blink in real time synchronized to clock pulses in sequential circuits (counters, shift registers, flip-flops) and custom circuits.
  - Supports both **Active-High Sourcing** (Anode to logic output, Cathode to GND) and **Active-Low Sinking** (Anode to +5V, Cathode to active-low logic output).
- **Instruments & Power Supply**:
  - **Function Generator**: Two independent adjustable frequency clocks (`Clock 1` and `Clock 2`) with live 50% duty cycle square wave oscillation, status LEDs, and manual single-step pulse buttons.
  - **+5V DC Regulated Power Supply**: Virtual VCC and GND binding post sockets with real-time connection status LEDs.
- **Truth Table & Automated Checker**:
  - Live truth table showing active input/output states during operation.
  - **Check My Circuit**: Automated diagnostic grading that sweeps all input combinations, verifies sequential state transitions, and detects short circuits or floating pins.
- **Complete Presets & Solutions**:
  - Verified working presets available for **all 14 lab experiments and assignments**.
  - **Free Build Mode**: Unconstrained prototyping sandbox for custom circuits.
- **Productivity Controls**:
  - Smooth canvas Zoom (0.6x to 2.5x) and Pan navigation.
  - Unlimited Undo / Redo history (`Ctrl+Z`, `Ctrl+Y`).
  - Export and Import circuits as JSON files.

---

## 🔬 Lab Experiments & Assignments Catalog

All experiments include comprehensive theoretical objectives, truth tables, IC pin guides, and sample wiring presets:

| Experiment | Title | Integrated Circuits Used |
| :--- | :--- | :--- |
| **Exp 1** | Full Adder using Logic Gates | 7486 (XOR), 7408 (AND), 7432 (OR) |
| **Exp 2** | Code Converter: Binary to Gray Code | 7486 (Quad 2-Input XOR) |
| **Exp 3** | BCD Adder using IC 7483 | 7483 (4-bit Binary Full Adder) |
| **Exp 4** | Boolean Expression using Multiplexer | 74151 (8-to-1 Data Selector/Multiplexer) |
| **Exp 5** | 2-bit Magnitude Comparator | 7485 (4-bit Magnitude Comparator) |
| **Exp 6** | Parity Generator and Checker | 7486 (Quad 2-Input XOR) |
| **Exp 7** | 2-bit Ripple Counter | 7476 (Dual Master-Slave JK Flip-Flop) |
| **Exp 8** | Synchronous 2-bit Up/Down Counter | 7476 (JK FF), 7486 (XOR) |
| **Exp 9** | Modulo-N Counter using Decade Counter | 7490 (Decade / BCD Counter) |
| **Exp 10** | Sequence Generator using JK Flip-Flop | 7476 (Dual JK Flip-Flop) |
| **Exp A1** | Full Subtractor using Basic / Universal Gates | 7486 (XOR), 7400 (Quad 2-Input NAND) |
| **Exp A2** | Code Converter: BCD to Excess-3 | 7483 (4-bit Binary Full Adder) |
| **Exp A3** | Full Adder using 3-to-8 Decoder | 74138 (3:8 Decoder), 7420 (Dual 4-Input NAND) |
| **Exp A4** | 4-bit Serial-In Serial-Out (SISO) Shift Register | 7474 (Dual D-Type Positive-Edge-Triggered Flip-Flop) |
| **Free Build** | Free Prototyping Sandbox | All ICs, clocks, and breadboard features |

---

## 🧩 Supported TTL 74xx IC Library

The simulation engine accurately models TTL voltage levels (VCC = 5V, GND = 0V), propagation, and edge-triggered behavior:

- **7400**: Quad 2-Input NAND Gate (14-pin)
- **7402**: Quad 2-Input NOR Gate (14-pin)
- **7404**: Hex Inverter / NOT Gate (14-pin)
- **7408**: Quad 2-Input AND Gate (14-pin)
- **7410**: Triple 3-Input NAND Gate (14-pin)
- **7420**: Dual 4-Input NAND Gate (14-pin)
- **7432**: Quad 2-Input OR Gate (14-pin)
- **7486**: Quad 2-Input XOR Gate (14-pin)
- **7483**: 4-Bit Binary Full Adder with Fast Carry (16-pin)
- **7485**: 4-Bit Magnitude Comparator (16-pin)
- **7474**: Dual D-Type Positive-Edge-Triggered Flip-Flop with Preset & Clear (14-pin)
- **7476**: Dual J-K Flip-Flop with Preset & Clear (16-pin)
- **7490**: Decade and Binary Counter (14-pin)
- **74138**: 3-to-8 Line Decoder / Demultiplexer (16-pin)
- **74151**: 8-to-1 Line Data Selector / Multiplexer (16-pin)

---

## 🛠️ Building Custom Circuits & LED Wiring Guide

### Breadboard Hole Connectivity
1. **Vertical Terminal Strips**:
   - Rows **`j`, `i`, `h`, `g`, `f`** in the same column form a single connected 5-hole tie point node.
   - Rows **`e`, `d`, `c`, `b`, `a`** in the same column form a separate connected 5-hole tie point node.
   - The center horizontal trough (channel) isolates the upper strip from the lower strip.
2. **Horizontal Power Rails**:
   - The top positive (`+`) rail and negative (`-`) rail connect all 30 columns horizontally.
   - The bottom positive (`+`) rail and negative (`-`) rail connect all 30 columns horizontally.

### How to Make LEDs Work & Blink Properly
- **Never plug both LED legs into the same column**: Because all 5 holes in rows `e-a` (or `j-f`) are connected, placing both the anode and cathode in the same column creates a short circuit across the diode.
- **Active-High Configuration (Standard)**:
  - Plug the **Anode** (longer bent lead) into the IC output column (e.g., Row `d` in the output column).
  - Plug the **Cathode** (shorter straight lead) into an adjacent column (e.g., Column + 1) or the negative ground rail (`railBottom-`).
  - Wire that cathode node to `socket-gnd` or the negative rail.
  - When the gate/counter output goes HIGH (`1`), the LED lights up!
- **Active-Low Configuration (Sink Current)**:
  - Plug the **Anode** into +5V (VCC).
  - Plug the **Cathode** into the active-low output pin (e.g. 74138 decoder output `Y0`).
  - When the output goes LOW (`0`), current sinks and the LED turns ON!
- **Sequential Circuits & Blinking**:
  - In sequential circuits (counters and flip-flops), click **Run** in the bottom control bar to start the clock generator.
  - Adjust the frequency slider (0.1 Hz to 10 Hz) to speed up or slow down the blinking rate.
  - Or click the **Pulse** button on the Function Generator to advance the circuit step by step!

---

## 🧪 Testing and Verification

To run the automated suite verifying all 14 presets, sequential clock transitions, and custom circuits:

```bash
# Run unit and integration tests with Vitest
npx vitest run

# Run end-to-end circuit audit and custom circuit validation
npx tsx verify_all.ts

# Type-check TypeScript codebase
npm run lint

# Build production bundle
npm run build
```

---

## 📬 Help & Support Section

If you need any help, have questions about circuit wiring, encountered a simulation issue, or require assistance with any lab assignment:

### Contact & Resources:
- **Hosted Live Simulator:** [https://simulator-jgl1.onrender.com/](https://simulator-jgl1.onrender.com/)
- **Email:** `filessheet@gmail.com`
- **Resolution:** Contact on this email and query will be resolved.

You can also access the interactive **Help & Support** center directly inside the simulator by clicking the **Help** button on the top navigation bar.
