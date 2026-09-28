import { Challenge } from "@/types/challenge";
import { LidarScan, Obstacle, RobotState, Waypoint } from "@/types/robot";
import { SimulationResult, SimulationStatus } from "@/types/simulation";
import { TelemetryData } from "@/types/telemetry";
import { checkCollisions } from "./collision";
import { simulateLidarScan } from "./lidar";
import { parseStudentCode, RobotCommand } from "./robotController";
import { evaluationService } from "@/services/evaluationService";

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

  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private listeners: SimulationEngineListener[] = [];

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

    // Reset robot
    this.robot = {
      x: this.challenge.initialRobotPose.x,
      y: this.challenge.initialRobotPose.y,
      theta: this.challenge.initialRobotPose.theta,
      linearVelocity: 0,
      angularVelocity: 0,
      width: 0.7,
      height: 0.7,
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

    // Reset run telemetry if completed or idle
    if (this.status === "COMPLETED" || this.status === "FAILED") {
      this.reset();
    }

    const parsed = parseStudentCode(studentCode);
    this.isTickScript = parsed.isTickScript;
    this.commandQueue = [...parsed.commands];
    this.currentCommandProgress = 0;

    this.status = "RUNNING";
    this.notifyStatus();

    this.lastTimestamp = performance.now();
    this.loop();
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
    if (this.isTickScript) {
      this.stepReactiveNavigation(dt);
    } else {
      this.stepScriptedCommands(dt);
    }

    // 3. Integrate robot kinematics
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

    // 5. Collision checks
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

    if (colResult.hasCollision) {
      this.collisions += 1;
      this.listeners.forEach((l) => l.onCollision?.(colResult.collidedObstacleIds[0]));
    }

    // 6. Waypoint tracking
    this.checkWaypoints();

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
  }

  private updateDynamicObstacles(dt: number) {
    for (const obs of this.obstacles) {
      if (obs.isDynamic && obs.velocity) {
        if (obs.velocity.vx !== 0 && obs.minBound !== undefined && obs.maxBound !== undefined) {
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

  private stepReactiveNavigation(dt: number) {
    // Find next unreached waypoint
    const activeWp = this.waypoints.find((w) => !w.reached);
    if (!activeWp) {
      this.robot.linearVelocity = 0;
      this.robot.angularVelocity = 0;
      return;
    }

    const dx = activeWp.x - this.robot.x;
    const dy = activeWp.y - this.robot.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = targetAngle - this.robot.theta;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    // Obstacle avoidance based on front and side lidar
    const front = this.lidarScan.frontDistance;
    const left = this.lidarScan.leftDistance;
    const right = this.lidarScan.rightDistance;

    if (front < 1.35) {
      // Urgent avoidance: turn away from closer side obstacle
      this.robot.linearVelocity = 0.25;
      const turnDir = left > right ? 1.4 : -1.4;
      this.robot.angularVelocity = turnDir;
    } else if (front < 2.0) {
      // Mild deceleration and steering
      this.robot.linearVelocity = 0.55;
      const steerAvoidance = left > right ? 0.6 : -0.6;
      this.robot.angularVelocity = angleDiff * 0.5 + steerAvoidance;
    } else {
      // Normal waypoint pursuit
      const maxSpeed = this.challenge?.arenaConfig.maxLinearSpeed || 1.1;
      this.robot.linearVelocity = Math.max(0.35, maxSpeed * Math.max(0.2, Math.cos(angleDiff)));
      this.robot.angularVelocity = Math.max(-1.8, Math.min(1.8, angleDiff * 1.5));
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
}

// Singleton engine instance for UI synchronization
export const simulationEngine = new SimulationEngine();
