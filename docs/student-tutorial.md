# ArduinoSim Student Tutorial

Welcome to ArduinoSim. This guide describes the intended learning path: visual blocks first, then Python, then Arduino C++. In the current build, the blocks-and-simulator experience is the part that is actually available.

## Getting to Know the Workspace

When you open ArduinoSim, you will see three main areas on your screen:
1.  **The Sidebar (Left):** This is where you find your coding blocks. They are sorted into categories like Motion, Control, and Sensing.
2.  **The Workspace (Center):** This is your desk. You drag blocks from the sidebar into this area and snap them together to build a program.
3.  **The Simulator (Right):** This is where you test your code. It features a virtual car, a starting zone, and a finish line. Below the simulator, you will see live readouts from the car sensors and a console that logs important messages.

## Mission 1: Your First Drive

Your first goal is to drive the car out of the starting zone and across the finish line.

### Step 1: Add a Motion Block
Click on the Motion category in the sidebar. Find the block that says "move forward". Click and drag it into the center workspace.

### Step 2: Set the Duration
The block has a number input. This number tells the car how long to move in milliseconds. One thousand milliseconds equals one second. Change the number to 1000.

### Step 3: Run the Code
Look at the top bar and click the Run button. Watch the simulator on the right. Your virtual car will drive forward for one second.

### Step 4: Cross the Finish Line
If the car did not reach the finish line, change the number to something larger and click Run again. If the car hit a wall, you went too far. Click Reset to return the car to the start, and try again.

## Levelling Up

XP, missions, and unlocks are part of the planned progression system. They are not fully implemented yet.

-   **Level 2** will give you blocks to turn the car.
-   **Level 3** will give you blocks to change the car speed and make the program wait.
-   **Level 4** will give you blocks to read the ultrasonic distance sensor.
-   **Level 5** will give you loops to repeat actions forever, and blocks to follow lines on the ground.

## Moving to Text Code

Once you master blocks, you can switch the coding mode at the top of the screen to Python. When you do this, you will see exactly how your block program looks in Python code. You can even type Python directly. 

Eventually, you will unlock C++ mode. This is the exact language that physical Arduino robots understand. In the planned final version, you will be able to connect a real Elegoo Robot Car using a USB cable and run the same instructions on the physical robot.
