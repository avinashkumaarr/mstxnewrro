import asyncio
import websockets
import json
import math

class LaserScan:
    def __init__(self, data):
        self.front = data.get("front", 0)
        self.left = data.get("left", 0)
        self.right = data.get("right", 0)
        self.rear = data.get("rear", 0)
        
    def get_front(self):
        return self.front
        
    def get_left(self):
        return self.left
        
    def get_right(self):
        return self.right
        
    def get_rear(self):
        return self.rear

class RobotController:
    def __init__(self, simulation_id, backend_url="ws://127.0.0.1:8000/ws/simulation"):
        self.simulation_id = simulation_id
        self.backend_url = f"{backend_url}/{simulation_id}"
        self.ws = None
        self.pose = {"x": 0, "y": 0, "theta": 0, "thetaRad": 0}
        self.lidar = None
        self.goal = {"x": 0, "y": 0} # Fetch from configuration if needed
        self.max_speed = 1.0
        self.status = "IDLE"
        self._running = False
        
    async def connect(self):
        self.ws = await websockets.connect(self.backend_url)
        self._running = True
        print(f"Connected to simulation {self.simulation_id}")
        
    async def _receive_loop(self):
        while self._running:
            try:
                msg = await self.ws.recv()
                data = json.loads(msg)
                msg_type = data.get("type")
                if msg_type == "telemetry":
                    self.pose = data.get("pose", self.pose)
                    if "lidar" in data:
                        self.lidar = LaserScan(data["lidar"])
                    self.status = data.get("system", {}).get("status", self.status)
                    if "goal" in data:
                        self.goal = data["goal"]
                elif msg_type == "command":
                    if "goal" in data:
                        self.goal = data["goal"]
                    if "max_speed" in data:
                        self.max_speed = data["max_speed"]
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed")
                self._running = False
                break
            except Exception as e:
                print(f"Error receiving data: {e}")
                
    def get_pose(self):
        return self.pose
        
    def get_goal(self):
        return self.goal
        
    async def set_velocity(self, linear, angular):
        if self.ws:
            await self.ws.send(json.dumps({
                "type": "command",
                "linear": max(0, min(linear, self.max_speed)),
                "angular": angular
            }))

    def get_lidar(self):
        return self.lidar
