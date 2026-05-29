# ArduinoSim Student Tutorial

Welcome to ArduinoSim. This guide will teach you how to write code to control a robot car, starting with visual blocks and ending with real text-based code that runs on a physical machine.

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

As you complete missions, you will earn Experience Points (XP). When you earn enough XP, you will level up. Levelling up unlocks new blocks.

-   **Level 2** gives you blocks to turn the car.
-   **Level 3** gives you blocks to change the car speed and make the program wait.
-   **Level 4** gives you blocks to read the ultrasonic distance sensor.
-   **Level 5** gives you loops to repeat actions forever, and blocks to follow lines on the ground.

## Moving to Text Code

Once you master blocks, you can switch the coding mode at the top of the screen to Python. When you do this, you will see exactly how your block program looks in Python code. You can even type Python directly. 

Eventually, you will unlock C++ mode. This is the exact language that physical Arduino robots understand. You can write your code here, click Connect Car, plug in a real Elegoo Robot Car using a USB cable, and watch the physical robot execute the exact same instructions you practiced in the simulator.
