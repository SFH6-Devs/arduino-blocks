# ArduinoSim — Project Plan

> A Scratch-like browser simulator for Arduino. Kids drag blocks, write Python, or write Arduino C++ to control a virtual car — then flash the same logic to a real Elegoo Smart Robot Car.

---

## Vision

Build a progressive coding platform that takes a complete beginner from drag-and-drop blocks to real Arduino C++ running on physical hardware. Zero setup — runs in the browser, hosted on GitHub Pages. The Elegoo Smart Robot Car Kit is the hardware target.

---

## Final Scope

| Component | Details |
|---|---|
| Sim | 2D top-down car, p5.js, wall + obstacle + line arenas |
| Coding modes | Blocks → Python → Arduino C++ |
| Sensors | Virtual ultrasonic (distance) + IR line sensor |
| Progression | Levelled missions, blocks unlock per level |
| XP | Per-mission rewards, scales by coding mode |
| Hardware | Elegoo Smart Robot Car Kit via Serial USB bridge |

---

## UI Layout

3-column layout — confirmed from v2 mockup:

- **Left:** Category sidebar + block palette (one category visible at a time)
- **Centre:** Block workspace (dominant) / code editor in Python or C++ mode
- **Right:** Sim canvas (top) + sensors + console + XP bar (bottom)

**Design language:**
- Dark theme — `#1a1c2e` base, `#4af09a` neon green accent
- Block colours: Motion `#4d97ff`, Control `#ffab19`, Sensing `#5cb1d6`, Loops `#ffca1a`
- Chunky Scratch-style blocks with 3D push-down shadow
- Inline editable number inputs on blocks
- Mission strip in top bar
- Challenge complete modal on finish

---

## Coding Modes

| Mode | Audience | Language |
|---|---|---|
| Blocks | Beginners (Year 7–8) | Drag-and-drop, compiles to Python |
| Python | Intermediate | Most kids already know it from school |
| Arduino C++ | Advanced / hardware | What actually runs on the chip |

**Progression path:** Blocks → Python → C++ → flash to real Elegoo car

The C++ mode shows kids what the chip actually runs. When they see the same logic they wrote in Python expressed as a C++ sketch, it demystifies Arduino and makes the hardware step feel natural.

---

## Car API

The public interface. **Never changes across modes or phases.** Blocks, Python, and C++ all map to this.

**Python:**
```python
car.forward(dist)
car.back(dist)
car.turn_left(deg)
car.turn_right(deg)
car.set_speed(n)      # 1–10
car.stop()
car.distance()        # → int (cm)
car.on_line()         # → bool
```

**Arduino C++:**
```cpp
car.forward(dist);
car.back(dist);
car.turnLeft(deg);
car.turnRight(deg);
car.setSpeed(n);      // 1–10
car.stop();
car.distance();       // → int (cm)
car.onLine();         // → bool
```

---

## Hardware Target — Elegoo Smart Robot Car Kit

**Why Elegoo:**
- Most common Arduino car kit in schools
- ~£20–25, widely available
- Arduino Uno base — familiar, well documented
- Includes L298N motor driver, HC-SR04 ultrasonic, IR sensors out of the box
- Massive community and tutorial resources

**Kit components used:**
| Component | Role |
|---|---|
| Arduino Uno | Brain — runs the C++ sketch |
| L298N motor driver | Drives DC motors from Arduino signals |
| DC motors (x4) | Wheel drive |
| HC-SR04 | Ultrasonic distance sensor |
| IR sensors | Line following |
| 9V battery pack | Motor power (separate from Arduino) |

**Bridge method:** Browser → Serial USB → Arduino sketch (via Web Serial API)

No Pi, no WiFi, no server. USB cable from laptop to Elegoo car. The browser talks directly to the Arduino over serial.

---

## Level Progression

Blocks unlock gradually as kids level up. Prevents overwhelm on day one.

| Level | XP threshold | Blocks unlocked |
|---|---|---|
| 1 | 0 | `forward`, `stop` |
| 2 | 50 | `back`, `turn left`, `turn right` |
| 3 | 150 | `set speed`, `wait` |
| 4 | 300 | `distance`, `if obstacle` |
| 5 | 500 | `on line?`, `if on line`, `forever`, `repeat` |
| 6 | 800 | All blocks + Python mode unlocked |
| 7 | 1200 | Arduino C++ mode unlocked |

Python and C++ modes are always accessible via the mode toggle regardless of level — levels only gate the block palette.

---

## Missions

| ID | Title | Arena | Pass condition | XP (Blocks / Python / C++) |
|---|---|---|---|---|
| m1 | Drive Forward | Open | Reach finish | 10 / 20 / 30 |
| m2 | Clean Run | Open | Finish, 0 collisions | 15 / 25 / 35 |
| m3 | Turn the Corner | Open | Finish + at least 1 turn | 15 / 25 / 35 |
| m4 | Obstacle Course | Obstacle | Finish, 0 collisions | 20 / 30 / 40 |
| m5 | Follow the Line | Line | On line for 5s continuously | 25 / 35 / 50 |
| m6 | Full Course | Obstacle + Line | Finish line + 5s on line | 40 / 60 / 80 |

---

## Build Phases

### Phase 0 — Scaffold

**Goal:** Repo and all files stubbed before any logic is written.

- Create GitHub repo (`the-cerealdev/arduinosim`) under Dev Club org
- Enable GitHub Pages (root, main branch)
- Create full folder structure, stub all files with empty exports
- Confirm CDN links: p5.js, Blockly, Monaco, Pyodide

**Commit:** `chore: initial scaffold`

---

### Phase 1 — Core Simulation

**Goal:** Car drives in the sim from the browser console.

**Files:**
- `sim/car.js` — Car class: position, heading, speed, `update()`, `draw()`
- `sim/arena.js` — Arena: walls, finish line, `draw()`, `checkWall(car)`
- `sim/sensors.js` — `distanceAhead(car, arena)`, `isOnLine(car, arena)`
- `index.html` — 3-column shell, p5 canvas in right panel
- `main.js` — p5 setup/draw loop, imports all modules

**Acceptance criteria:**
- `car.forward(200)` called from browser console moves the car
- Wall collision detected and logged
- Finish line fires a `finish` event
- Reset returns car to start

**Commit:** `feat: M1 — core sim`

---

### Phase 2 — Block Coding Layer

**Goal:** Drag blocks → car moves.

**Files:**
- `editor/blocks.js` — Blockly block definitions (JSON)
- `editor/codegen.js` — Block → Python code generator
- `editor/workspace.js` — Blockly workspace init, drag wiring
- Update `index.html` — left sidebar + centre workspace

**Blocks to define:** all blocks from Level 1–5 (locked/greyed until level reached)

**Acceptance criteria:**
- Drag "move forward" → ▶ runs → car moves
- Blocks compile to readable Python shown in Python mode
- Inline number inputs editable and reflected in generated code
- Locked blocks visually greyed, tooltip explains unlock condition

**Commit:** `feat: M2 — block editor`

---

### Phase 3 — Python + C++ Editors

**Goal:** Real code editors with syntax highlighting.

**Files:**
- `editor/python-editor.js` — Monaco Python editor + Pyodide runner
- `editor/cpp-editor.js` — Monaco C++ editor (syntax only, runs via sim bridge)
- `editor/pyodide-bridge.js` — Python `car.*` calls → sim API

**Acceptance criteria:**
- Python editor runs code against sim on ▶
- C++ editor shows valid sketch structure (`setup()` / `loop()`)
- Syntax errors surface in console with line number
- Mode toggle preserves logical program state where possible

**Commit:** `feat: M3 — Python and C++ editors`

---

### Phase 4 — Missions + XP

**Goal:** Structured progression with rewards.

**Files:**
- `challenges/missions.json` — mission definitions (see schema above)
- `challenges/runner.js` — pass condition checker, XP award logic
- `ui/missions.js` — mission strip, challenge complete modal
- `ui/xp.js` — XP bar, level tracking, localStorage persistence
- `ui/levels.js` — block unlock logic based on current level

**Acceptance criteria:**
- Mission strip shows active mission
- Completing pass condition fires modal with correct XP
- XP bar animates, persists in localStorage
- Correct blocks unlock at each level threshold

**Commit:** `feat: M4 — missions and XP`

---

### Phase 5 — Arena Types + Sensors

**Goal:** All three arenas playable, sensors working.

**Files:**
- Extend `sim/arena.js` — obstacle + line track arena types
- Extend `sim/sensors.js` — line detection against track geometry

**Acceptance criteria:**
- Open arena: checkerboard finish line, clean collision detection
- Obstacle arena: circular obstacles with visible collision
- Line arena: oval track, IR sensor returns true when car over line
- Sensor panel in right column updates live

**Commit:** `feat: M5 — arenas and sensors`

---

### Phase 6 — Serial Bridge (Elegoo)

**Goal:** Flash logic to real Elegoo car via USB.

**Files:**
- `bridge/serial-client.js` — Web Serial API client, sends commands to Arduino
- `bridge/elegoo-sketch/elegoo-sketch.ino` — Arduino sketch, receives serial commands, drives L298N

**Serial protocol:**
```
F200\n   → forward 200ms
B100\n   → back 100ms
L90\n    → turn left 90°
R90\n    → turn right 90°
S5\n     → set speed 5
X\n      → stop
D\n      → request distance → responds "D:42\n"
I\n      → request IR → responds "I:1\n" or "I:0\n"
```

**Acceptance criteria:**
- "Connect Car" button triggers Web Serial port picker
- C++ mode ▶ sends commands over serial to Elegoo
- Car executes program physically
- Sensor readback from Arduino updates sim UI live

**Commit:** `feat: M6 — Elegoo serial bridge`

---

## Repo Layout

```
arduinosim/
├── index.html
├── main.js
├── assets/
│   └── styles.css              # CSS variables, block colours, layout
├── sim/
│   ├── car.js                  # Car class
│   ├── arena.js                # Arena types
│   └── sensors.js              # Virtual sensors
├── editor/
│   ├── blocks.js               # Blockly block definitions
│   ├── codegen.js              # Block → Python generator
│   ├── workspace.js            # Blockly workspace
│   ├── python-editor.js        # Monaco + Pyodide
│   ├── cpp-editor.js           # Monaco C++
│   └── pyodide-bridge.js       # Python → sim API
├── bridge/
│   ├── serial-client.js        # Web Serial API client
│   └── elegoo-sketch/
│       └── elegoo-sketch.ino   # Arduino sketch for Elegoo car
├── challenges/
│   ├── missions.json           # Mission definitions
│   └── runner.js               # Pass condition checker
└── ui/
    ├── missions.js             # Mission strip + modal
    ├── xp.js                   # XP bar + localStorage
    ├── levels.js               # Block unlock logic
    └── console.js              # Console panel
```

---

## Agent Workflow Rules

1. Read the file before editing it — never overwrite blindly
2. One phase at a time — hit all acceptance criteria before moving on
3. Never change the public car API — it is the contract between all layers
4. Test in browser after every file (`python3 -m http.server` or direct open)
5. CSS variables only — no hardcoded colours anywhere
6. No external libs beyond the four CDNs: p5.js, Blockly, Monaco, Pyodide
7. Commit after each milestone: `feat: M{n} — {description}` make sure to check with me for these commits 

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- Purpose: What problem does this interface solve? Who uses it?
- Tone: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- Constraints: Technical requirements (framework, performance, accessibility).
- Differentiation: What makes this UNFORGETTABLE? What's the one thing someone will remember?

CRITICAL: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- Spatial Composition: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- Backgrounds & Visual Details: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

IMPORTANT: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## More Principles

- Layout — workspace is now the dominant element (centre column takes most of the screen), sim moved to the right panel below the sensors, much closer to Scratch's proportions
- Blocks — bigger, chunkier, with 3D push-down shadows like real Scratch blocks, loud distinct colours per category (blue motion, orange control, teal sensing, yellow loops), editable inline number inputs
- Category sidebar — Scratch-style coloured dot + label buttons that swap the palette, no visual clutter
- Reduced cognitive load — drop hint guides first-time users, palette only shows one category at a time, no borders competing everywhere
- Mission strip — top bar shows the active mission with a clear goal, click to cycle through missions
- Challenge complete modal — pops up with XP reward when you hit the finish line, not just a console log
- Sim — checkerboard finish line, more visible car, sensor stats overlaid directly on canvas
- Remember: You are capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
---

## Open Questions

- XP: persist to a Google Sheet for a teacher leaderboard view?
- Should Blocks compile to Python or run directly via a JS interpreter?
- Level gates: hard lock or just visual grey-out with tooltip?
- Web Serial API requires HTTPS — does GitHub Pages cover this? (Yes, it does.)
