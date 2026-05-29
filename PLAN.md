# ArduinoSim — Updated Project Plan

**Vision**
Build a Scratch-like environment for Arduino. Kids drag blocks (or write text code) to control a virtual car in a 2D simulation, then flip a toggle and run the exact same code on a real Raspberry Pi-powered car. The interface mimics the layout and cognitive load of Scratch, wrapped in a modern, dark-themed developer aesthetic to make it feel like a "real" tool. Zero setup, runs in the browser, hosted on GitHub Pages.

---

## UI/UX Design Specifications (The "Scratch DNA")

The interface is structured in a definitive 3-column layout to lower cognitive load and keep all tools visible without feeling cluttered:

* **Left Column (The Palette):** Scratch-style category sidebar. Loud, distinct colors for categories (**Blue** = Motion, **Orange** = Control, **Teal** = Sensing, **Yellow** = Loops). Clicking a category swaps the visible block palette to prevent visual overload.
* **Center Column (The Workspace):** A massive, infinite dotted-grid canvas for dragging blocks. Includes "Hat" blocks (e.g., *When ▶ clicked*) and chunky, 3D-shadowed blocks with inline editable number inputs. A top toggle switches this space seamlessly between **Blocks**, **JS**, and **Python** editors.
* **Right Column (Sim & Data):** The live p5.js 2D simulation sits at the top. Below it, a tabbed lower panel separates live **Sensors** (Ultrasonic distance, Line sensor, Motor L/R PWM bars) from the **Console** (system logs, collisions).
* **Top Bar (The Mission Strip):** A sticky header detailing the current objective, mode toggles, and the "Connect Pi" hardware bridge button.

---

##  Tech Stack

| Layer | Tool | Reason |
| --- | --- | --- |
| **2D Simulation** | p5.js | Simple canvas API, physics, car rendering, trail drawing. |
| **Block Coding** | Blockly (Google) | Output real JS. Custom SVG rendering for Scratch-style blocks. |
| **Python Mode** | Pyodide (WASM) | Real CPython in the browser, no server required. |
| **Code Editor** | Monaco / CodeMirror | Syntax highlighting for JS and Python modes. |
| **GPIO Bridge** | WebSocket → Pi pigpio | Same API, routes browser commands to physical hardware. |
| **Hosting** | GitHub Pages | Free, instantly accessible for the Dev Club. |

---

##  Hardware Explainer

* **Raspberry Pi:** The brain. Runs Python, processes logic, and sends signals to motors via GPIO pins.
* **PCA9685 PWM Driver (I2C):** Sits between the Pi and servos/motors to provide clean, jitter-free PWM signals.
* **L298N Motor Driver:** Takes the low-power signals and drives the DC motors with sufficient current.
* **DC Motors:** Convert electrical signals into wheel rotation. Left/right speed differential controls turning.
* **Ultrasonic Sensor (HC-SR04):** Sends a sound pulse and measures the echo return time to calculate distance to the obstacle ahead.
* **IR Line Sensor:** Detects black tape on a white floor by measuring reflected infrared light.

---

##  Build Phases

### Phase 1 — Core Simulation & UI Shell (Weeks 1–2)

**Goal:** The 3-column dark-mode interface and a working browser sim where code drives a car.

* Build the core HTML/CSS grid (Top bar, Left palette, Center workspace, Right sim/sensors).
* p5.js top-down car with basic physics (speed, heading, wall collision, checkerboard finish line).
* Core car API (`forward`, `turnLeft`, `turnRight`, `setSpeed`, `stop`).
* JavaScript code editor integration.

### Phase 2 — The Scratch-Like Block Layer (Weeks 3–4)

**Goal:** Intuitive, colorful block interface that compiles to the car API.

* Integrate Blockly into the center column.
* Style blocks with 3D push-down shadows, cap blocks, and hat bumps.
* Define custom blocks categorized by color (Motion, Control, Sensing, Loops).
* Mode toggle implementation: Blocks ↔ JavaScript ↔ Python.

### Phase 3 — Sensors, Arenas & Gamification (Weeks 5–6)

**Goal:** Add virtual sensors, dynamic arenas, and the XP/Mission system.

* **Virtual Arenas:** Open (Checkerboard finish), Line Follow (Oval track), Obstacle (Red collision circles).
* **Live Sensor Panel:** Animated progress bars for Motor L/R PWM, dynamic distance readout for Ultrasonic, ON/OFF states for Line Sensor.
* **Mission System:** "Challenge Complete" modal overlays with XP rewards.

### Phase 4 — The Hardware Bridge (Weeks 7–8)

**Goal:** Same code, real physical car.

* WebSocket server running on the Pi.
* UI "Connect Pi" toggle with visual connection indicator (glowing green dot).
* Sim API calls route to real GPIO/PCA9685 when hardware mode is active.
* Real L298N + DC motor car wired to the Pi.

---

##  Missions & XP System

**Missions**

1. **Drive Forward:** Make the car reach the finish line.
2. **Turn the Corner:** Drive forward then turn 90°.
3. **Avoid the Wall:** Navigate without any collision.
4. **Follow the Line:** Stay on the track for 5 seconds.

**XP Multipliers (To encourage text-coding transition)**

| Action | XP Reward |
| --- | --- |
| Complete in **Blocks** | +10 XP |
| Complete in **JavaScript** | +20 XP |
| Complete in **Python** | +30 XP |
| Run on **Real Hardware** | +50 XP |

---

##  Project Structure

```text
arduinosim/
├── index.html          # Main 3-column app shell (dark theme)
├── css/
│   └── style.css       # Scratch-style UI, color variables, block shadows
├── sim/
│   ├── car.js          # Car physics, rendering, trail logic (p5.js)
│   ├── arena.js        # Track/arena definitions (Open, Line, Obstacle)
│   └── sensors.js      # Virtual sensor math and UI bar updating
├── editor/
│   ├── blocks.js       # Blockly custom definitions & color mapping
│   ├── codegen.js      # Block → JS/Python compiler
│   └── text.js         # Monaco/CodeMirror setup for JS/Py tabs
├── bridge/
│   ├── client.js       # WebSocket client (Connect Pi button logic)
│   └── server.py       # WebSocket server (Pi side hardware control)
└── game/
    ├── missions.json   # Mission text, clear conditions
    └── xp.js           # Leveling math, XP bar animation, modal triggers

```
