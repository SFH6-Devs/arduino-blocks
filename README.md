# Arduino-Sim

A progressive, browser-based simulator and coding environment for the Elegoo Smart Robot Car Kit. Students can program a virtual car using drag-and-drop blocks, then seamlessly graduate to Python and Arduino C++ before flashing their logic to physical hardware.

## Documentation

*   [Project Plan (PLAN.md)](PLAN.md) - The master vision and phase breakdown.
*   [Developer Guide](docs/developer-guide.md) - Technical architecture, file structure, and API contract.
*   [Student Tutorial](docs/student-tutorial.md) - A beginner-friendly walkthrough for younger users.

## Current Project Status

**Current Stage: Phase 1 (Core Simulation) — COMPLETED**

We are tracking progress against the 6 build phases outlined in `PLAN.md`.

*   [x] **Phase 0:** Scaffold repo, structure, and CDNs
*   [x] **Phase 1:** Core Simulation (Car logic, basic open arena, p5.js integration)
*   [ ] **Phase 2:** Block Coding Layer (Blockly integration, block definitions)
*   [ ] **Phase 3:** Python + C++ Editors (Monaco, Pyodide bridge)
*   [ ] **Phase 4:** Missions + XP (Progression system, unlock gates)
*   [ ] **Phase 5:** Arena Types + Sensors (Line/obstacle tracks, virtual ultrasonic/IR)
*   [ ] **Phase 6:** Serial Bridge (Web Serial API, Elegoo physical integration)

## Running Locally

Because the application is static, you only need to serve the directory over HTTP.

```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

---
*Note: This README will be updated continuously as we progress through the build phases.*
