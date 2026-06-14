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

---

## Python Reference Guide

When you switch to **Python mode**, you can write code directly to control the car. Here are all the commands you can use:

### Movement Commands

**Move Forward**
```python
car.forward(1000)
```
Drives the car forward for the specified time in milliseconds. `1000` = 1 second.

**Move Backward**
```python
car.back(500)
```
Drives the car backward for the specified time in milliseconds.

**Turn Left**
```python
car.turn_left(90)
```
Rotates the car counter-clockwise by the specified degrees. `90` = quarter turn, `180` = half turn, `360` = full circle.

**Turn Right**
```python
car.turn_right(90)
```
Rotates the car clockwise by the specified degrees.

**Stop**
```python
car.stop()
```
Immediately stops all movement. The car will not move until you give it another command.

### Speed Control

**Set Speed**
```python
car.set_speed(5)
```
Sets the car's speed from `1` (slowest) to `10` (fastest). Default speed is `5`.

### Sensor Commands

**Read Distance Sensor**
```python
distance = car.distance()
print(distance)
```
Returns the distance in centimeters detected by the ultrasonic sensor. Useful for obstacle avoidance.

**Read Left Line Sensor**
```python
if car.on_line_left():
    print("Left sensor is on the line!")
```
Returns `True` if the left IR sensor detects a line, `False` otherwise. Useful for line-following challenges.

**Read Right Line Sensor**
```python
if car.on_line_right():
    print("Right sensor is on the line!")
```
Returns `True` if the right IR sensor detects a line, `False` otherwise. Useful for line-following challenges.

**Set Motors**
```python
car.set_motors(200, 200)
```
Sets the speed of the left and right motors individually. Values range from `-255` (full reverse) to `255` (full forward). Use `0` to stop the motor.

### Example Programs

**Simple Forward and Stop**
```python
car.forward(2000)
car.stop()
```

**Drive Forward, Turn, and Return**
```python
car.forward(1500)
car.turn_right(90)
car.forward(1500)
car.turn_left(90)
car.forward(1500)
```

**Slow Speed Test**
```python
car.set_speed(2)
car.forward(3000)
car.stop()
```

**Simple Obstacle Avoidance**
```python
while car.distance() > 20:
    car.forward(500)

car.stop()
car.turn_left(90)
car.forward(1000)
car.turn_right(90)
car.forward(2000)
```

### Tips for Python Coding

- **Python Syntax** — Remember that Python uses indentation to group code blocks (instead of `{}` like C++).
- **Combine commands** — Write multiple commands one after another to create more complex programs.
- **Test incrementally** — Start with a simple command, click Run, and watch the simulator. Then add more commands and test again.
- **Use loops** — Python's `while` and `for` loops let you repeat actions without duplicating code.
- **Read sensors first** — Always check `car.distance()` or `car.on_line()` before making decisions in your program.
