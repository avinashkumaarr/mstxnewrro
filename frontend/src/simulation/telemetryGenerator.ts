import { TelemetryData } from "@/types/telemetry";

export function formatTelemetryForDisplay(data: TelemetryData): string {
  return `X: ${data.pose.x.toFixed(2)}m, Y: ${data.pose.y.toFixed(2)}m, θ: ${data.pose.theta.toFixed(1)}° | v: ${data.velocity.linear.toFixed(2)} m/s, ω: ${data.velocity.angular.toFixed(2)} rad/s`;
}
