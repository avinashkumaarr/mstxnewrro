import { Challenge } from "@/types/challenge";
import { LidarScan, Obstacle, RobotState, Waypoint } from "@/types/robot";
import { SimulationResult, SimulationStatus } from "@/types/simulation";
import { TelemetryData } from "@/types/telemetry";
import { checkCollisions } from "./collision";
import { simulateLidarScan } from "./lidar";
import { parseStudentCode, RobotCommand } from "./robotController";
import { evaluationService } from "@/services/evaluationService";
import { AStarPlanner } from "./pathPlanner";

export interface SimulationEngineListener {
  onTelemetryUpdate?: (telemetry: TelemetryData) => void;
  onStatusChange?: (status: SimulationStatus) => void;
  onCollision?: (obstacleId: string) => void;
  onWaypointReached?: (waypoint: Waypoint) => void;
  onComplete?: (result: SimulationResult) => void;
}

export class SimulationEngine {
  private challenge: Challenge | null = null;
  private status: SimulationStatus = "IDLE";
  private robot: RobotState = {
    x: 2.4,
    y: 1.8,
    theta: 0.785,
    linearVelocity: 0,
    angularVelocity: 0,
    width: 0.7,
    height: 0.7,
  };
  private obstacles: Obstacle[] = [];
  private waypoints: Waypoint[] = [];
  private executedPath: { x: number; y: number }[] = [];
  private plannedPath: { x: number; y: number }[] = [];
  private lidarScan: LidarScan;

  private currentWaypointIndex: number = 0;
  private commandQueue: RobotCommand[] = [];
  private isTickScript: boolean = true;
  private currentCommandProgress: number = 0;

  private executionTime: number = 0;
  private collisions: number = 0;
  private distanceTraveled: number = 0;
  private minClearanceRecorded: number = 999;
  private speedMultiplier: number = 1.0;
  private activeCollisions: Set<string> = new Set();

  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private listeners: SimulationEngineListener[] = [];
  
  // WebSocket connection to backend
  private ws: WebSocket | null = null;
  private simulationId: string = "default_sim_id"; // For now, hardcode or fetch dynamically
  
  private telemetryBatch: any[] = [];
  private lastPersistTime: number = 0;
  private readonly DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZjMwMWY4Ni0yZjkzLTRhNjItODZkYi0yNDcyODAwNDg4MzkiLCJleHAiOjE3OTA3MDgxMTB9.gI0kkdP9cbM2PkjrOq5CVI5r4yqnVLGLxiuz2F4KjkA";
  private readonly robotId = "30e61d84-c6f3-4f93-b413-b5413ed9dc7b"; // Note: Use the ID we created or fetch from API. Let's let the backend handle the missing robot ID if needed, or query it. Wait, the DB has one robot! We can just fetch it or ignore.

  constructor() {
    this.lidarScan = {
      rays: [],
      frontDistance: 4.2,
      leftDistance: 1.8,
      rightDistance: 0.9,
      rearDistance: 6.1,
      rangeMin: 0.1,
      rangeMax: 14.0,
      channelCount: 64,
      frequency: 10,
    };
  }

  public loadChallenge(challenge: Challenge) {
    this.stop();
    this.challenge = challenge;
    this.reset();
  }

  public reset() {
    if (!this.challenge) return;

    this.status = "IDLE";
    this.executionTime = 0;
    this.collisions = 0;
    this.distanceTraveled = 0;
    this.minClearanceRecorded = 999;
    this.currentWaypointIndex = 0;
    this.currentCommandProgress = 0;
    this.commandQueue = [];
    this.activeCollisions.clear();

    // Reset robot
    this.robot = {
      x: this.challenge.initialRobotPose.x,
      y: this.challenge.initialRobotPose.y,
      theta: this.challenge.initialRobotPose.theta,
      linearVelocity: 0,
      angularVelocity: 0,
      width: 0.7,
      height: 0.7,
      isActive: this.challenge.id !== "challenge-00",
    };

    // Deep clone waypoints
    this.waypoints = this.challenge.waypoints.map((wp) => ({
      ...wp,
      reached: false,
    }));

    // Deep clone obstacles
    this.obstacles = this.challenge.obstacles.map((obs) => ({
      ...obs,
      colliding: false,
    }));

    // Reset path
    this.executedPath = [{ x: this.robot.x, y: this.robot.y }];

    // Generate smooth planned trajectory curve through waypoints
    this.computePlannedPath();

    // Initial LiDAR scan
    this.updateLidar();

    this.notifyStatus();
    this.notifyTelemetry();
    
    // Attempt to disconnect if connected
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }
  }

  private computePlannedPath() {
    if (!this.challenge) return;
    const pts = [
      { x: this.robot.x, y: this.robot.y },
      ...this.waypoints.map((w) => ({ x: w.x, y: w.y })),
    ];
    this.plannedPath = pts;
  }

  public run(studentCode: string) {
    if (!this.challenge) return;

    // Reset run telemetry if completed or idle, or ALWAYS reset to clear old code-generated objects
    this.reset();
    
    // Determine whether to use backend websocket OR local execution
    // (We will use backend websocket exclusively if possible, but keep fallback)
    const parsed = parseStudentCode(studentCode);
    this.isTickScript = parsed.isTickScript;
    this.commandQueue = [...parsed.commands];
    this.currentCommandProgress = 0;

    // Process world building commands
    for (const cmd of parsed.worldCommands) {
      if (cmd.type === "spawn_robot") {
        this.robot.x = cmd.x || 0;
        this.robot.y = cmd.y || 0;
        this.robot.theta = cmd.theta || 0;
        this.robot.isActive = true;
      } else if (cmd.type === "add_static_obstacle") {
        this.obstacles.push({
          id: cmd.id || `obs-${this.obstacles.length}`,
          name: cmd.id || "Obstacle",
          x: cmd.x || 0,
          y: cmd.y || 0,
          width: cmd.width || 1,
          height: cmd.height || 1,
          colliding: false
        });
      } else if (cmd.type === "add_dynamic_obstacle") {
        this.obstacles.push({
          id: cmd.id || `dyn-${this.obstacles.length}`,
          name: cmd.id || "Dynamic",
          x: cmd.x || 0,
          y: cmd.y || 0,
          width: cmd.width || 1,
          height: cmd.height || 1,
          isDynamic: true,
          velocity: { vx: cmd.vx || 0, vy: cmd.vy || 0 },
          minBound: cmd.minBound || 0,
          maxBound: cmd.maxBound || 0,
          colliding: false
        });
      } else if (cmd.type === "add_goal") {
        this.waypoints.push({
          id: cmd.id || `wp-${this.waypoints.length}`,
          name: "GOAL",
          x: cmd.x || 0,
          y: cmd.y || 0,
          radius: 0.9,
          cost: 0,
          reached: false,
          isGoal: true
        });
      }
    }
    this.computePlannedPath();
    this.updateLidar();

    // Connect to websocket
    this.connectWebSocket();

    this.status = "RUNNING";
    this.notifyStatus();
    this.persistEvent("task_started", { code: studentCode.substring(0, 50) });

    this.lastTimestamp = performance.now();
    this.loop();
  }
  
  private connectWebSocket() {
    if (this.ws) return;
    try {
      this.ws = new WebSocket(`ws://127.0.0.1:8000/ws/simulation/${this.simulationId}`);
      
      this.ws.onopen = () => {
        console.log("Connected to backend simulation WebSocket");
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "command") {
            // Backend controller is sending velocity commands!
            this.robot.linearVelocity = typeof data.linear === 'number' ? data.linear : this.robot.linearVelocity;
            this.robot.angularVelocity = typeof data.angular === 'number' ? data.angular : this.robot.angularVelocity;
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };
      
      this.ws.onclose = () => {
        console.log("Disconnected from backend simulation WebSocket");
        this.ws = null;
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.robot.linearVelocity = 0;
    this.robot.angularVelocity = 0;
    if (this.status === "RUNNING") {
      this.status = "PAUSED";
      this.notifyStatus();
      this.notifyTelemetry();
    }
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }
  }

  public setSpeed(speed: number) {
    this.speedMultiplier = Math.max(0.25, Math.min(4.0, speed));
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  public addListener(listener: SimulationEngineListener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private loop = () => {
    if (this.status !== "RUNNING") return;

    const now = performance.now();
    const rawDt = Math.min((now - this.lastTimestamp) / 1000, 0.1); // cap dt to avoid giant leaps
    this.lastTimestamp = now;

    const dt = rawDt * this.speedMultiplier;

    this.step(dt);

    if (this.status === "RUNNING") {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private step(dt: number) {
    if (!this.challenge) return;

    this.executionTime += dt;

    // 1. Move dynamic obstacles
    this.updateDynamicObstacles(dt);

    // 2. Control logic
    // If backend WS is active, it handles logic and we skip local reactive nav
    // However, we still need to process scripted commands if it's not a tick script
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        if (this.isTickScript) {
          this.stepReactiveNavigation(dt);
        } else {
          this.stepScriptedCommands(dt);
        }
    }

    // 3. Integrate robot kinematics
    if (this.robot.isActive !== false) {
      this.robot.theta += this.robot.angularVelocity * dt;
      // Normalize theta [-PI, PI]
      this.robot.theta = Math.atan2(Math.sin(this.robot.theta), Math.cos(this.robot.theta));

      const dx = this.robot.linearVelocity * Math.cos(this.robot.theta) * dt;
      const dy = this.robot.linearVelocity * Math.sin(this.robot.theta) * dt;
      this.robot.x += dx;
      this.robot.y += dy;

      const stepDist = Math.sqrt(dx * dx + dy * dy);
      this.distanceTraveled += stepDist;

      if (stepDist > 0.05 || this.executedPath.length === 0) {
        this.executedPath.push({ x: this.robot.x, y: this.robot.y });
      }

      // 4. Update LiDAR
      this.updateLidar();
    }

    // 5. Collision checks
    if (this.robot.isActive !== false) {
      const colResult = checkCollisions(
        this.robot,
        this.obstacles,
        this.challenge.arenaConfig.arenaWidth,
        this.challenge.arenaConfig.arenaHeight
      );

      if (colResult.minClearance < this.minClearanceRecorded) {
        this.minClearanceRecorded = colResult.minClearance;
      }

      // Reset obstacle collision highlights
      for (const obs of this.obstacles) {
        obs.colliding = colResult.collidedObstacleIds.includes(obs.id);
      }

      const newActiveCollisions = new Set<string>();
      for (const id of colResult.collidedObstacleIds) {
        newActiveCollisions.add(id);
        if (!this.activeCollisions.has(id)) {
          this.collisions += 1;
          this.persistEvent("collision", { obstacle_id: id });
          this.listeners.forEach((l) => l.onCollision?.(id));
        }
      }
      this.activeCollisions = newActiveCollisions;

      // 6. Waypoint tracking
      this.checkWaypoints();
    }

    // 7. Check termination (Goal reached or timeout)
    const goalWp = this.waypoints.find((w) => w.isGoal);
    const goalReached = goalWp?.reached ?? false;

    if (goalReached) {
      this.finishSimulation(true);
      return;
    }

    if (this.executionTime >= this.challenge.timeLimit) {
      this.finishSimulation(false, "Time limit exceeded.");
      return;
    }

    this.notifyTelemetry();
    
        // Broadcast telemetry to backend if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ~10Hz, using modulo on executionTime to roughly throttle
        const tick = Math.floor(this.executionTime * 10);
        if (tick % 1 === 0) { // Can be throttled if needed
             const goal = goalWp ? { x: goalWp.x, y: goalWp.y } : null;
             if (this.robot.isActive !== false) {
                 this.ws.send(JSON.stringify({
                     type: "telemetry",
                     pose: {
                         x: this.robot.x,
                         y: this.robot.y,
                         thetaRad: this.robot.theta,
                     },
                     lidar: {
                         front: this.lidarScan.frontDistance,
                         left: this.lidarScan.leftDistance,
                         right: this.lidarScan.rightDistance,
                         rear: this.lidarScan.rearDistance
                     },
                     system: { status: this.status },
                     goal: goal
                 }));
             }
             
             // Add to persistence batch
             this.telemetryBatch.push({
                 robot_id: this.robotId,
                 simulation_id: this.simulationId === "default_sim_id" ? null : this.simulationId,
                 timestamp: new Date().toISOString(),
                 position_x: this.robot.x,
                 position_y: this.robot.y,
                 position_z: 0.0,
                 orientation: this.robot.theta,
                 battery_percentage: 100.0,
                 sensors_data: { lidar: this.lidarScan }
             });
             
             // Persist batch every 2 seconds
             const now = Date.now();
             if (now - this.lastPersistTime > 2000) {
                 this.persistTelemetryBatch();
                 this.lastPersistTime = now;
             }
        }
    }
  }

  private updateDynamicObstacles(dt: number) {
    for (const obs of this.obstacles) {
      if (obs.isDynamic && obs.velocity) {
        if (obs.velocity.vx !== 0 && obs.minBound !== undefined && obs.maxBound !== undefined) {
          console.log(`[DEBUG] id=${obs.id} dt=${dt} x=${obs.x} vx=${obs.velocity.vx} min=${obs.minBound} max=${obs.maxBound}`);
          obs.x += obs.velocity.vx * dt;
          if (obs.x <= obs.minBound) {
            obs.x = obs.minBound;
            obs.velocity.vx = Math.abs(obs.velocity.vx);
          } else if (obs.x >= obs.maxBound) {
            obs.x = obs.maxBound;
            obs.velocity.vx = -Math.abs(obs.velocity.vx);
          }
        }
        if (obs.velocity.vy !== 0 && obs.minBound !== undefined && obs.maxBound !== undefined) {
          obs.y += obs.velocity.vy * dt;
          if (obs.y <= obs.minBound) {
            obs.y = obs.minBound;
            obs.velocity.vy = Math.abs(obs.velocity.vy);
          } else if (obs.y >= obs.maxBound) {
            obs.y = obs.maxBound;
            obs.velocity.vy = -Math.abs(obs.velocity.vy);
          }
        }
      }
    }
  }

  private aStarPlanner = new AStarPlanner(22, 15, 0.25);
  private pathRecalculationTimer = 0;
  private currentPath: {x: number, y: number}[] = [];

  private stepReactiveNavigation(dt: number) {
    const activeWp = this.waypoints.find((w) => !w.reached);
    if (!activeWp) {
      this.robot.linearVelocity = 0;
      this.robot.angularVelocity = 0;
      return;
    }

    const robotRadius = Math.max(this.robot.width, this.robot.height) / 2;

    // Recalculate path periodically (e.g., 5 Hz) for moving obstacles
    this.pathRecalculationTimer -= dt;
    if (this.pathRecalculationTimer <= 0 || this.currentPath.length === 0) {
      this.aStarPlanner.updateObstacles(this.obstacles, robotRadius);
      this.currentPath = this.aStarPlanner.findPath(
        { x: this.robot.x, y: this.robot.y },
        { x: activeWp.x, y: activeWp.y }
      );
      this.pathRecalculationTimer = 0.2; // replan every 0.2s
    }

    if (this.currentPath.length === 0) {
      // No path found, safe stop
      this.robot.linearVelocity = 0;
      this.robot.angularVelocity = 0;
      return;
    }

    // Find a lookahead point on the path
    let targetIdx = 0;
    for (let i = 0; i < this.currentPath.length; i++) {
      const p = this.currentPath[i];
      const dist = Math.hypot(p.x - this.robot.x, p.y - this.robot.y);
      if (dist > 0.4) {
        targetIdx = i;
        break;
      }
    }
    const target = this.currentPath[targetIdx];

    const dx = target.x - this.robot.x;
    const dy = target.y - this.robot.y;
    const targetAngle = Math.atan2(dy, dx);
    let angleDiff = targetAngle - this.robot.theta;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    const maxSpeed = this.challenge?.arenaConfig.maxLinearSpeed || 1.1;
    let desiredLinear = Math.max(0, maxSpeed * Math.max(0.1, Math.cos(angleDiff)));
    let desiredAngular = Math.max(-2.5, Math.min(2.5, angleDiff * 2.5));

    // Dynamic obstacle imminent collision override (Safety check)
    const nextX = this.robot.x + desiredLinear * Math.cos(this.robot.theta) * dt;
    const nextY = this.robot.y + desiredLinear * Math.sin(this.robot.theta) * dt;
    
    // Simulate checkCollisions
    let imminentCollision = false;
    for (const obs of this.obstacles) {
      const closestX = Math.max(obs.x, Math.min(nextX, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(nextY, obs.y + obs.height));
      const dist = Math.hypot(nextX - closestX, nextY - closestY);
      if (dist <= robotRadius + 0.1) {
        imminentCollision = true;
        break;
      }
    }

    if (imminentCollision) {
      this.robot.linearVelocity = 0; // Emergency brake
      // Try to rotate away if possible
      this.robot.angularVelocity = desiredAngular > 0 ? -1.0 : 1.0;
    } else {
      this.robot.linearVelocity = desiredLinear;
      this.robot.angularVelocity = desiredAngular;
    }
  }

  private stepScriptedCommands(dt: number) {
    if (this.commandQueue.length === 0) {
      this.robot.linearVelocity = 0;
      this.robot.angularVelocity = 0;
      return;
    }

    const cmd = this.commandQueue[0];
    switch (cmd.type) {
      case "set_velocity":
        this.robot.linearVelocity = cmd.linear || 0;
        this.robot.angularVelocity = cmd.angular || 0;
        this.commandQueue.shift();
        break;

      case "stop":
        this.robot.linearVelocity = 0;
        this.robot.angularVelocity = 0;
        this.commandQueue.shift();
        break;

      case "move_forward": {
        const targetDist = cmd.distance || 1.0;
        const speed = 0.8;
        this.robot.linearVelocity = speed;
        this.robot.angularVelocity = 0;
        this.currentCommandProgress += speed * dt;
        if (this.currentCommandProgress >= targetDist) {
          this.currentCommandProgress = 0;
          this.commandQueue.shift();
        }
        break;
      }

      case "move_backward": {
        const targetDist = cmd.distance || 1.0;
        const speed = -0.6;
        this.robot.linearVelocity = speed;
        this.robot.angularVelocity = 0;
        this.currentCommandProgress += Math.abs(speed) * dt;
        if (this.currentCommandProgress >= targetDist) {
          this.currentCommandProgress = 0;
          this.commandQueue.shift();
        }
        break;
      }

      case "rotate": {
        const targetAngle = cmd.angle || Math.PI / 2;
        const rotSpeed = 1.0; // rad/s
        this.robot.linearVelocity = 0;
        this.robot.angularVelocity = targetAngle > 0 ? rotSpeed : -rotSpeed;
        this.currentCommandProgress += rotSpeed * dt;
        if (this.currentCommandProgress >= Math.abs(targetAngle)) {
          this.currentCommandProgress = 0;
          this.commandQueue.shift();
        }
        break;
      }

      case "go_to": {
        const targetX = cmd.x || 0;
        const targetY = cmd.y || 0;
        const dx = targetX - this.robot.x;
        const dy = targetY - this.robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.25) {
          this.commandQueue.shift();
        } else {
          const targetHeading = Math.atan2(dy, dx);
          let headDiff = targetHeading - this.robot.theta;
          headDiff = Math.atan2(Math.sin(headDiff), Math.cos(headDiff));
          this.robot.linearVelocity = Math.min(0.9, dist);
          this.robot.angularVelocity = headDiff * 1.5;
        }
        break;
      }
    }
  }

  private checkWaypoints() {
    for (const wp of this.waypoints) {
      if (!wp.reached) {
        const dx = wp.x - this.robot.x;
        const dy = wp.y - this.robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= wp.radius) {
          wp.reached = true;
          this.listeners.forEach((l) => l.onWaypointReached?.(wp));
        }
      }
    }
  }

  private updateLidar() {
    if (!this.challenge) return;
    if (this.robot.isActive === false) return;
    this.lidarScan = simulateLidarScan(
      this.robot,
      this.obstacles,
      this.challenge.arenaConfig.arenaWidth,
      this.challenge.arenaConfig.arenaHeight,
      64,
      14.0
    );
  }

  private async finishSimulation(success: boolean, reason?: string) {
    this.stop();
    this.status = success ? "COMPLETED" : "FAILED";
    this.notifyStatus();

    // Evaluate result
    const reachedCount = this.waypoints.filter((w) => w.reached).length;
    const goalWp = this.waypoints.find((w) => w.isGoal);
    const goalReached = goalWp?.reached ?? false;

    // Ideal path length estimation
    const idealPathLength = 16.5;

    const evaluation = await evaluationService.evaluateSimulation({
      waypointsReached: reachedCount,
      totalWaypoints: this.waypoints.length,
      collisions: this.collisions,
      goalReached,
      executionTime: this.executionTime,
      timeLimit: this.challenge?.timeLimit || 60,
      pathLength: this.distanceTraveled,
      idealPathLength,
      minClearanceRecorded: this.minClearanceRecorded === 999 ? 0.8 : this.minClearanceRecorded,
      minClearanceThreshold: this.challenge?.minClearance || 0.35,
    });

    if (reason && !evaluation.failureReason) {
      evaluation.failureReason = reason;
      evaluation.status = "FAILED";
      evaluation.success = false;
    }

    this.notifyTelemetry();
    if (success) {
        this.persistEvent("task_completed", { evaluation: evaluation });
    }
    this.persistTelemetryBatch();
    this.listeners.forEach((l) => l.onComplete?.(evaluation));
  }

  private notifyStatus() {
    this.listeners.forEach((l) => l.onStatusChange?.(this.status));
  }

  private notifyTelemetry() {
    const tele = this.getTelemetry();
    this.listeners.forEach((l) => l.onTelemetryUpdate?.(tele));
  }

  public getTelemetry(): TelemetryData {
    const goalWp = this.waypoints.find((w) => w.isGoal);
    let goalDist = 0;
    if (goalWp) {
      const dx = goalWp.x - this.robot.x;
      const dy = goalWp.y - this.robot.y;
      goalDist = Number(Math.sqrt(dx * dx + dy * dy).toFixed(2));
    }

    const deg = ((this.robot.theta * 180) / Math.PI) % 360;
    const normalizedDeg = deg < 0 ? deg + 360 : deg;

    return {
      pose: {
        x: Number(this.robot.x.toFixed(2)),
        y: Number(this.robot.y.toFixed(2)),
        theta: Number(normalizedDeg.toFixed(1)),
        thetaRad: this.robot.theta,
      },
      velocity: {
        linear: Number(this.robot.linearVelocity.toFixed(2)),
        angular: Number(this.robot.angularVelocity.toFixed(2)),
      },
      motion: {
        distanceTraveled: Number(this.distanceTraveled.toFixed(1)),
        goalDistance: goalDist,
        executionTime: Number(this.executionTime.toFixed(2)),
        collisions: this.collisions,
        waypointsCompleted: this.waypoints.filter((w) => w.reached).length,
        totalWaypoints: this.waypoints.length,
      },
      lidar: {
        front: this.lidarScan.frontDistance,
        left: this.lidarScan.leftDistance,
        right: this.lidarScan.rightDistance,
        rear: this.lidarScan.rearDistance,
        channelCount: this.lidarScan.channelCount,
        frequency: this.lidarScan.frequency,
      },
      system: {
        fps: 60.0,
        latency: 12,
        tickMs: 10,
        status: this.status,
      },
    };
  }

  public getRobot(): RobotState {
    return { ...this.robot };
  }

  public getObstacles(): Obstacle[] {
    return [...this.obstacles];
  }

  public getWaypoints(): Waypoint[] {
    return [...this.waypoints];
  }

  public getLidarScan(): LidarScan {
    return { ...this.lidarScan };
  }

  public getExecutedPath(): { x: number; y: number }[] {
    return [...this.executedPath];
  }

  public getPlannedPath(): { x: number; y: number }[] {
    return [...this.plannedPath];
  }

  public getStatus(): SimulationStatus {
    return this.status;
  }
  
  // Persist telemetry to backend
  private async persistTelemetryBatch() {
      if (this.telemetryBatch.length === 0) return;
      const batch = [...this.telemetryBatch];
      this.telemetryBatch = [];
      
      try {
          await fetch(`http://localhost:8000/api/v1/telemetry/batch`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${this.DEV_TOKEN}`
              },
              body: JSON.stringify({ items: batch })
          });
      } catch (e) {
          console.error("Failed to persist telemetry", e);
      }
  }

  // Persist event to backend
  private async persistEvent(eventType: string, payload: any = {}) {
      try {
          await fetch(`http://localhost:8000/api/v1/events/`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${this.DEV_TOKEN}`
              },
              body: JSON.stringify({
                  robot_id: this.robotId,
                  simulation_id: this.simulationId === "default_sim_id" ? null : this.simulationId,
                  event_type: eventType,
                  event_timestamp: new Date().toISOString(),
                  payload: payload
              })
          });
      } catch (e) {
          console.error("Failed to persist event", e);
      }
  }
}

// Singleton engine instance for UI synchronization
export const simulationEngine = new SimulationEngine();
