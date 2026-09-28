export interface RobotCommand {
  type: "move_forward" | "move_backward" | "rotate" | "go_to" | "set_velocity" | "stop";
  distance?: number;
  angle?: number;
  x?: number;
  y?: number;
  linear?: number;
  angular?: number;
}

export function parseStudentCode(code: string): {
  isTickScript: boolean;
  commands: RobotCommand[];
  customVelocity?: { linear: number; angular: number };
} {
  const commands: RobotCommand[] = [];

  // Check if code defines reactive on_tick
  const hasOnTick = /def\s+on_tick/i.test(code) || /robot\.set_velocity/i.test(code);

  // Look for sequential commands
  const lines = code.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed.length === 0) continue;

    // go_to(x, y)
    const goToMatch = trimmed.match(/go_to\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i);
    if (goToMatch) {
      commands.push({
        type: "go_to",
        x: parseFloat(goToMatch[1]),
        y: parseFloat(goToMatch[2]),
      });
      continue;
    }

    // move_forward(dist)
    const fwdMatch = trimmed.match(/move_forward\s*\(\s*([-\d.]+)\s*\)/i);
    if (fwdMatch) {
      commands.push({
        type: "move_forward",
        distance: parseFloat(fwdMatch[1]),
      });
      continue;
    }

    // move_backward(dist)
    const bwdMatch = trimmed.match(/move_backward\s*\(\s*([-\d.]+)\s*\)/i);
    if (bwdMatch) {
      commands.push({
        type: "move_backward",
        distance: parseFloat(bwdMatch[1]),
      });
      continue;
    }

    // rotate(angle)
    const rotMatch = trimmed.match(/rotate\s*\(\s*([-\d.]+)\s*\)/i);
    if (rotMatch) {
      commands.push({
        type: "rotate",
        angle: (parseFloat(rotMatch[1]) * Math.PI) / 180, // convert deg to rad
      });
      continue;
    }

    // set_velocity(linear, angular)
    const velMatch = trimmed.match(/set_velocity\s*\(\s*(?:linear\s*=\s*)?([-\d.]+)\s*,\s*(?:angular\s*=\s*)?([-\d.]+)\s*\)/i);
    if (velMatch) {
      commands.push({
        type: "set_velocity",
        linear: parseFloat(velMatch[1]),
        angular: parseFloat(velMatch[2]),
      });
      continue;
    }

    // stop()
    if (/stop\s*\(\s*\)/i.test(trimmed)) {
      commands.push({ type: "stop" });
      continue;
    }
  }

  return {
    isTickScript: hasOnTick,
    commands,
  };
}
