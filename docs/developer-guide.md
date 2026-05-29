# ArduinoSim Developer Guide

This document provides a technical overview of ArduinoSim, a browser-based simulator and coding environment for the Elegoo Smart Robot Car Kit.

## Architecture Overview

ArduinoSim is a static client-side web application. It runs entirely in the browser using HTML, CSS, and JavaScript, with no backend server required. It is designed to be hosted on GitHub Pages.

The system is composed of several independent layers:
1.  **UI & Layout:** A standard 3-column flexbox/grid layout (Sidebar, Code Editor, Simulator).
2.  **Simulator (p5.js):** The 2D top-down physics and rendering engine for the virtual car and arenas.
3.  **Code Editors:** 
    -   Blockly for visual block-based programming.
    -   Monaco Editor for Python and Arduino C++ text-based programming.
    -   Pyodide for executing Python code in the browser.
4.  **Hardware Bridge:** Web Serial API implementation to communicate with an Arduino Uno over USB.

## Core API Contract

The public `Car` API is the contract that binds all modes together. Whether a student drags blocks, writes Python, or writes C++, it ultimately maps to these functions.

### Asynchronous Design
Because movement takes time, the internal `Car` methods return Promises. This allows execution layers (like Pyodide or a custom JavaScript evaluator) to await completion of an action before proceeding to the next line of code.

### Methods
-   `forward(ms)`: Drives both motors forward for the specified milliseconds.
-   `back(ms)`: Drives both motors backward for the specified milliseconds.
-   `turnLeft(degrees)`: Rotates the vehicle counter-clockwise.
-   `turnRight(degrees)`: Rotates the vehicle clockwise.
-   `setSpeed(level)`: Sets global motor speed from 1 to 10.
-   `stop()`: Immediately halts all motor activity.
-   `distance()`: Returns the distance in cm from the ultrasonic sensor.
-   `onLine()`: Returns a boolean indicating if the IR sensor detects the line.

## Project Structure

-   `assets/`: CSS styles and static assets.
-   `sim/`: p5.js logic for `Car`, `Arena`, and `Sensors`.
-   `editor/`: Blockly and Monaco editor initialization, code generation, and Pyodide bridging.
-   `challenges/`: Mission definitions and win-condition checkers.
-   `ui/`: XP system, level unlocking, and console output.
-   `bridge/`: Web Serial client and the corresponding `.ino` sketch for the physical car.

## Hardware Bridge Protocol

When connecting to the physical Elegoo car, the browser sends ASCII strings over 9600 baud serial.
-   `F200\n` : Forward 200ms
-   `B100\n` : Back 100ms
-   `L90\n` : Turn Left 90 degrees
-   `R90\n` : Turn Right 90 degrees
-   `S5\n` : Set Speed to 5
-   `X\n` : Stop
-   `D\n` : Request ultrasonic distance (Arduino responds with `D:42\n`)
-   `I\n` : Request IR state (Arduino responds with `I:1\n`)

## Extending the Simulator

To add a new arena:
1.  Extend the `Arena` class in `sim/arena.js`.
2.  Implement a specific `draw()` method.
3.  Update the collision logic in `checkWall()` to account for internal obstacles or track boundaries.
4.  Register the new arena in `main.js`.
