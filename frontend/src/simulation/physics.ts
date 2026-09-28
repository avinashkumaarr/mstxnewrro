import { RobotState } from "@/types/robot";

/**
 * Forward Kinematics for Differential Drive Mobile Robot:
 * x_dot = v * cos(theta)
 * y_dot = v * sin(theta)
 * theta_dot = omega
 */
export function integrateDifferentialDriveKinematics(
  robot: RobotState,
  v: number,
  w: number,
  dt: number
): RobotState {
  const newTheta = robot.theta + w * dt;
  const normalizedTheta = Math.atan2(Math.sin(newTheta), Math.cos(newTheta));
  const newX = robot.x + v * Math.cos(robot.theta) * dt;
  const newY = robot.y + v * Math.sin(robot.theta) * dt;

  return {
    ...robot,
    x: newX,
    y: newY,
    theta: normalizedTheta,
    linearVelocity: v,
    angularVelocity: w,
  };
}
