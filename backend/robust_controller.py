import asyncio
import math
import argparse
from newrro_sim import RobotController

async def control_loop(robot: RobotController):
    # Wait for initial telemetry
    while robot.get_pose() is None or robot.get_lidar() is None:
        await asyncio.sleep(0.1)

    print("Starting robust control loop...")
    while robot._running:
        if robot.status != "RUNNING":
            await robot.set_velocity(0, 0)
            await asyncio.sleep(0.1)
            continue
            
        pose = robot.get_pose()
        lidar = robot.get_lidar()
        goal = robot.get_goal()
        
        if not goal:
            await asyncio.sleep(0.1)
            continue
            
        # Calculate heading error with normalization
        dx = goal.get("x", 0) - pose.get("x", 0)
        dy = goal.get("y", 0) - pose.get("y", 0)
        target_angle = math.atan2(dy, dx)
        
        current_theta = pose.get("thetaRad", 0)
        angle_diff = target_angle - current_theta
        # Normalize angle to [-pi, pi]
        angle_diff = math.atan2(math.sin(angle_diff), math.cos(angle_diff))
        
        dist_to_goal = math.hypot(dx, dy)
        if dist_to_goal < 0.25:
            await robot.set_velocity(0, 0)
            await asyncio.sleep(0.1)
            continue

        front = lidar.get_front()
        left = lidar.get_left()
        right = lidar.get_right()
        
        # Reactive obstacle avoidance
        if front < 1.35:
            # Urgent avoidance: turn away from closer side obstacle
            linear_vel = 0.25
            turn_dir = 1.4 if left > right else -1.4
            angular_vel = turn_dir
        elif front < 2.0:
            # Mild deceleration and steering
            linear_vel = 0.55
            steer_avoidance = 0.6 if left > right else -0.6
            angular_vel = angle_diff * 0.5 + steer_avoidance
        else:
            # Normal waypoint pursuit
            max_speed = robot.max_speed
            linear_vel = max(0.35, max_speed * max(0.2, math.cos(angle_diff)))
            # Proportional control for angle, avoid sharp oscillation
            angular_vel = max(-1.8, min(1.8, angle_diff * 1.5))
            
        await robot.set_velocity(linear_vel, angular_vel)
        await asyncio.sleep(0.05) # ~20Hz control loop

async def main():
    parser = argparse.ArgumentParser(description="Run the RoboLedger robust controller")
    parser.add_argument("--sim", type=str, default="default_sim_id", help="Simulation ID")
    parser.add_argument("--url", type=str, default="ws://127.0.0.1:8000/ws/simulation", help="Backend WebSocket URL")
    args = parser.parse_args()
    
    robot = RobotController(args.sim, backend_url=args.url)
    
    # Run the connection and the control loop concurrently
    await asyncio.gather(
        robot.connect(),
        robot._receive_loop(),
        control_loop(robot)
    )

if __name__ == "__main__":
    asyncio.run(main())
