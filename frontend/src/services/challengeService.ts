import { Challenge } from "@/types/challenge";

export const CHALLENGES_CATALOG: Challenge[] = [
  {
    id: "challenge-00",
    number: "00",
    title: "Sandbox Environment",
    subtitle: "Write code to spawn your robot, add obstacles, and define logic.",
    objective: "Use code commands to build the world and control the robot.",
    track: "Obstacle Avoidance",
    difficulty: "Advanced",
    estimatedTime: "Open",
    xp: 0,
    rewardBadge: "Builder",
    environment: "Empty Grid",
    robotType: "Custom",
    minClearance: 0.35,
    timeLimit: 3600,
    evaluationRules: [],
    arenaConfig: {
      arenaWidth: 22,
      arenaHeight: 15,
      timeLimit: 3600,
      minClearance: 0.35,
      maxLinearSpeed: 2.0,
      presetName: "Sandbox",
      obstacleDensity: "LOW",
      noiseModel: "None",
    },
    initialRobotPose: { x: 0, y: 0, theta: 0 },
    waypoints: [],
    obstacles: [],
    target: { x: 0, y: 0 },
    starterCode: `# RoboLedger: Complete mixed-obstacle test
import math

# 1. Create robot
spawn_robot(2.0, 2.0, 0.0)

# 2. Create static obstacles
add_static_obstacle("box1", 5.0, 4.0, 2.0, 2.0)
add_static_obstacle("box2", 9.0, 7.0, 2.0, 1.5)
add_static_obstacle("box3", 13.0, 3.0, 1.5, 3.0)
add_static_obstacle("box4", 6.0, 11.0, 2.0, 1.5)
add_static_obstacle("box5", 16.0, 9.0, 2.0, 2.0)

# 3. Create moving obstacles
add_dynamic_obstacle(
    "dyn1", 7.0, 2.0, 1.0, 1.0,
    6.0, 10.0, 0.5, 0.0
)

add_dynamic_obstacle(
    "dyn2", 11.0, 8.0, 1.0, 1.0,
    9.0, 14.0, 0.0, 0.5
)

add_dynamic_obstacle(
    "dyn3", 15.0, 5.0, 1.0, 1.0,
    13.0, 18.0, 0.0, 0.4
)

# 4. Create goal
add_goal("goal1", 20.0, 12.0)

# 5. Robot navigation controller
def on_tick(robot, lidar):
    pass
`,
  },
  {
    id: "challenge-07",
    number: "07",
    title: "Dynamic Obstacle Avoidance & Waypoint Navigation",
    subtitle: "Navigate the differential-drive robot through the environment while avoiding obstacles and reaching all required waypoints.",
    objective: "Navigate the differential drive robot from Start Point A to Goal Zone B while avoiding 3 static obstacles and 2 dynamic patrolling hazards. Must maintain a minimum obstacle clearance of 0.35m.",
    track: "Obstacle Avoidance",
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    xp: 500,
    rewardBadge: "MST Dynamic Nav Badge",
    environment: "Warehouse Grid Alpha v2.1",
    robotType: "Differential Drive AGV-01",
    minClearance: 0.35,
    timeLimit: 60,
    evaluationRules: [
      { id: "rule-1", description: "Python 3.11 ROS2 rclpy environment", checked: true },
      { id: "rule-2", description: "Max linear speed <= 1.2 m/s", checked: true },
      { id: "rule-3", description: "Zero collision tolerance (d_min > 0.35m)", checked: true },
      { id: "rule-4", description: "Goal reached within 45.00s", checked: false },
    ],
    arenaConfig: {
      arenaWidth: 22,
      arenaHeight: 15,
      timeLimit: 60,
      minClearance: 0.35,
      maxLinearSpeed: 1.2,
      presetName: "Warehouse Grid Alpha v2.1",
      obstacleDensity: "HIGH",
      noiseModel: "Gauss 2.0%",
    },
    initialRobotPose: {
      x: 2.4,
      y: 1.8,
      theta: 0.785, // 45 degrees
    },
    waypoints: [
      { id: "wp-1", name: "WP1", x: 6.8, y: 3.5, radius: 0.85, cost: 4.2, reached: false },
      { id: "wp-2", name: "WP2", x: 13.5, y: 5.5, radius: 0.85, cost: 8.9, reached: false },
      { id: "wp-3", name: "WP3", x: 16.8, y: 10.8, radius: 0.85, cost: 13.1, reached: false },
      { id: "wp-goal", name: "GOAL", x: 18.4, y: 12.2, radius: 0.9, cost: 16.5, reached: false, isGoal: true },
    ],
    obstacles: [
      { id: "obs-1", name: "OBSTACLE #01", x: 5.0, y: 6.2, width: 2.4, height: 1.8 },
      { id: "obs-2", name: "OBSTACLE #02", x: 11.5, y: 10.2, width: 2.8, height: 2.2 },
      { id: "obs-3", name: "OBSTACLE #03", x: 16.2, y: 4.2, width: 2.0, height: 2.6 },
      {
        id: "dyn-1",
        name: "AGV-01 [V: 0.4m/s]",
        x: 8.2,
        y: 2.5,
        width: 1.4,
        height: 1.0,
        isDynamic: true,
        velocity: { vx: 0.4, vy: 0 },
        minBound: 7.0,
        maxBound: 11.0,
      },
      {
        id: "dyn-2",
        name: "AGV-02 [V: 0.3m/s]",
        x: 17.5,
        y: 7.8,
        width: 1.0,
        height: 1.5,
        isDynamic: true,
        velocity: { vx: 0, vy: 0.3 },
        minBound: 6.5,
        maxBound: 9.5,
      },
    ],
    target: {
      x: 18.4,
      y: 12.2,
    },
    starterCode: `import math
from newrro_sim import RobotController, LaserScan

def on_tick(robot: RobotController, lidar: LaserScan):
    # Extract frontal obstacle distance
    front_dist = lidar.get_distance(angle=0)
    goal_x, goal_y = robot.get_goal()
    curr_x, curr_y, heading = robot.get_pose()

    # Calculate heading error to target
    angle_to_goal = math.atan2(goal_y - curr_y, goal_x - curr_x)
    heading_error = angle_to_goal - heading

    # Normalize angular differential (-pi to pi)
    heading_error = math.atan2(math.sin(heading_error), math.cos(heading_error))

    # Reactive obstacle avoidance priority
    if front_dist < 1.0:
        # Safety corridor breach: execute evasive turn
        robot.set_velocity(linear=0.10, angular=1.20)
    else:
        # Waypoint tracking proportional controller
        v_cmd = 0.80
        w_cmd = heading_error * 0.50
        robot.set_velocity(linear=v_cmd, angular=w_cmd)
`,
  },
  {
    id: "challenge-08",
    number: "08",
    title: "Autonomous Path Planning: Dynamic A* & Costmaps",
    subtitle: "Formulate non-linear motion vectors to avoid dynamic collisions in ROS2 Foxy nodes with real-time laser scan topics.",
    objective: "Implement a hybrid A* pathfinder and local costmap inflation layer to guide the robot through tight warehouse aisles without crossing the safety buffer.",
    track: "Path Planning",
    difficulty: "Advanced",
    estimatedTime: "45 min",
    xp: 650,
    rewardBadge: "MST Master Planner",
    environment: "Warehouse Grid Beta v1.8",
    robotType: "Omnidirectional Holonomic AGV",
    minClearance: 0.30,
    timeLimit: 50,
    evaluationRules: [
      { id: "rule-1", description: "Path optimality >= 88%", checked: true },
      { id: "rule-2", description: "Zero footprint collisions", checked: true },
      { id: "rule-3", description: "Max angular acceleration < 2.5 rad/s²", checked: true },
    ],
    arenaConfig: {
      arenaWidth: 22,
      arenaHeight: 15,
      timeLimit: 50,
      minClearance: 0.30,
      maxLinearSpeed: 1.5,
      presetName: "Warehouse Grid Beta v1.8",
      obstacleDensity: "HIGH",
      noiseModel: "Gauss 1.5%",
    },
    initialRobotPose: { x: 2.0, y: 2.0, theta: 0 },
    waypoints: [
      { id: "wp-1", name: "WP1", x: 7.0, y: 4.0, radius: 0.8, cost: 5.0, reached: false },
      { id: "wp-2", name: "WP2", x: 12.0, y: 8.0, radius: 0.8, cost: 10.0, reached: false },
      { id: "wp-goal", name: "GOAL", x: 19.0, y: 13.0, radius: 0.9, cost: 18.0, reached: false, isGoal: true },
    ],
    obstacles: [
      { id: "obs-1", name: "RACK AISLE A", x: 6.0, y: 7.0, width: 2.0, height: 4.0 },
      { id: "obs-2", name: "RACK AISLE B", x: 13.0, y: 3.0, width: 2.0, height: 5.0 },
    ],
    target: { x: 19.0, y: 13.0 },
    starterCode: `# Dynamic A* Path Planner
def on_tick(robot, lidar):
    target = robot.get_goal()
    pose = robot.get_pose()
    robot.set_velocity(linear=0.9, angular=0.3)
`,
  },
  {
    id: "challenge-01",
    number: "01",
    title: "Differential Drive Kinematics & PID Heading Control",
    subtitle: "Master the fundamentals of wheel velocity decomposition and closed-loop heading correction.",
    objective: "Drive in a straight line for 10 meters and execute a precise 90-degree pivot turn within +/- 0.5 degrees tolerance.",
    track: "Navigation & Odometry",
    difficulty: "Beginner",
    estimatedTime: "20 min",
    xp: 250,
    rewardBadge: "Kinematic Pioneer",
    environment: "Calibration Arena v1.0",
    robotType: "TurtleBot3 Burger Clone",
    minClearance: 0.5,
    timeLimit: 35,
    evaluationRules: [
      { id: "rule-1", description: "Final heading within 0.5 deg", checked: true },
      { id: "rule-2", description: "Smooth acceleration ramp", checked: true },
    ],
    arenaConfig: {
      arenaWidth: 20,
      arenaHeight: 14,
      timeLimit: 35,
      minClearance: 0.5,
      maxLinearSpeed: 1.0,
      presetName: "Calibration Arena v1.0",
      obstacleDensity: "LOW",
      noiseModel: "None",
    },
    initialRobotPose: { x: 3.0, y: 3.0, theta: 0 },
    waypoints: [
      { id: "wp-1", name: "WP1", x: 10.0, y: 3.0, radius: 0.8, cost: 3.0, reached: false },
      { id: "wp-goal", name: "GOAL", x: 10.0, y: 10.0, radius: 0.9, cost: 7.0, reached: false, isGoal: true },
    ],
    obstacles: [
      { id: "obs-1", name: "BOUNDARY WALL", x: 14.0, y: 6.0, width: 1.5, height: 4.0 },
    ],
    target: { x: 10.0, y: 10.0 },
    starterCode: `def on_tick(robot, lidar):
    # Differential drive basic controller
    robot.set_velocity(linear=0.7, angular=0.0)
`,
  },
];

export const challengeService = {
  getChallenges: async (): Promise<Challenge[]> => {
    return Promise.resolve([...CHALLENGES_CATALOG]);
  },

  getChallenge: async (id: string): Promise<Challenge | null> => {
    const found = CHALLENGES_CATALOG.find((c) => c.id === id || c.number === id);
    return Promise.resolve(found ? { ...found } : null);
  },

  getDefaultChallenge: async (): Promise<Challenge> => {
    return Promise.resolve({ ...CHALLENGES_CATALOG[0] });
  },
};
