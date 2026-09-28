import { RobotState, Waypoint } from "@/types/robot";

export function computeProportionalSteering(
  robot: RobotState,
  target: Waypoint
): { linear: number; angular: number } {
  const dx = target.x - robot.x;
  const dy = target.y - robot.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const targetAngle = Math.atan2(dy, dx);

  let angleDiff = targetAngle - robot.theta;
  angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

  const linear = Math.min(1.0, distance * 0.5);
  const angular = angleDiff * 1.2;

  return { linear, angular };
}
