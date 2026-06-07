# Arduino-Sim

A progressive, browser-based simulator and coding environment for the Elegoo Smart Robot Car Kit. Students can program a virtual car using drag-and-drop blocks, with Python and Arduino C++ planned as the next steps before flashing logic to physical hardware.

## Documentation

*   [Project Plan (PLAN.md)](PLAN.md) - The master vision and phase breakdown.
*   [Developer Guide](docs/developer-guide.md) - Technical architecture, file structure, and API contract.
*   [Student Tutorial](docs/student-tutorial.md) - A beginner-friendly walkthrough for younger users.

## Current Project Status

**Current Stage: Phase 4 (Missions + XP) — NEXT**

What exists today:

*   [x] **Phase 0:** Scaffold repo, structure, and CDNs
*   [x] **Phase 1:** Core Simulation (basic open arena, car movement, p5.js integration)
*   [x] **Phase 2:** Block Coding Layer (Blockly blocks + JS codegen + run button)
*   [x] **Phase 3:** Python + C++ Editors (Monaco, Pyodide bridge)
*   [ ] **Phase 4:** Missions + XP (progression system, unlock gates)
*   [ ] **Phase 5:** Arena Types + Sensors (line/obstacle tracks, virtual ultrasonic/IR)
*   [ ] **Phase 6:** Serial Bridge (Web Serial API, Elegoo physical integration)

The roadmap in `PLAN.md` is still the target vision; the later phases are not implemented yet.

## Running Locally

Because the application is static, you only need to serve the directory over HTTP.

```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

---
*Note: This README will be updated continuously as we progress through the build phases.*
