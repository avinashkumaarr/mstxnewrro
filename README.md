# RoboLedger

RoboLedger is a web-based 3D robot simulation and digital-twin platform. It simulates robots navigating a warehouse with obstacles, goals, LiDAR, telemetry, and task events. The project features a Next.js (React) frontend and a FastAPI (Python) backend.

## Project Structure
- `frontend/`: Next.js 14, TailwindCSS, React Three Fiber, and the custom NEWRRO 2D/3D engine.
- `backend/`: FastAPI application handling WebSockets for telemetry and Python-based simulation logic.

## Running the Application

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on [http://localhost:3000](http://localhost:3000).

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend WebSocket and REST APIs run on [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Simulation Code API (Sandbox)

The RoboLedger editor allows you to write custom Python simulation scripts to generate dynamic environments and control the robot's reactive navigation.

### World Builder API
Use these methods in the global scope to construct your scenario before the tick loop begins.

*   `spawn_robot(x, y, theta)`: Spawns the main AGV robot at coordinates (x, y) with initial heading `theta` (radians).
*   `add_static_obstacle(id_string, x, y, width, height)`: Creates a non-moving rectangular obstacle (e.g. rack or box).
*   `add_dynamic_obstacle(id_string, x, y, width, height, min_bound, max_bound, vx, vy)`: Spawns a moving hazard. It will oscillate between `min_bound` and `max_bound` on the axis defined by its velocity `vx` or `vy`.
*   `add_goal(id_string, x, y)`: Sets a waypoint or destination coordinate. Reaching the final goal successfully completes the simulation.

### Robot Controller Loop
The `on_tick(robot, lidar)` function is called continuously during the simulation loop (dt = 0.016s), allowing real-time reactive logic.

#### `robot` Interface
*   `robot.get_pose()`: Returns `(x, y, theta)` of the robot.
*   `robot.get_goal()`: Returns `(goal_x, goal_y)` for the next active waypoint.
*   `robot.set_velocity(linear, angular)`: Commands the robot's linear speed (m/s) and angular rotation (rad/s).

#### `lidar` Interface
*   `lidar.get_distance(angle)`: Returns the distance to the nearest obstacle at the given angle (e.g. 0 for front, pi/2 for left). (Also available via struct properties: `lidar.frontDistance`, `lidar.leftDistance`, etc. depending on language bindings).

### Example Script

```python
# Build your world
spawn_robot(2.0, 2.0, 0.0)
add_static_obstacle("box1", 5.0, 5.0, 2.0, 2.0)
# Dynamic obstacle oscillating between x=6 and x=10 at 0.5 m/s
add_dynamic_obstacle("dyn1", 8.0, 3.0, 1.0, 1.0, 6.0, 10.0, 0.5, 0.0)
add_goal("goal1", 18.0, 12.0)

def on_tick(robot, lidar):
    # Reactive navigation logic goes here
    front_dist = lidar.get_distance(angle=0)
    
    if front_dist < 1.0:
        # Avoid obstacle
        robot.set_velocity(linear=0.1, angular=1.2)
    else:
        # Move forward
        robot.set_velocity(linear=0.8, angular=0.0)
```
