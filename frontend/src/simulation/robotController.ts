export interface RobotCommand {
  type: "move_forward" | "move_backward" | "rotate" | "go_to" | "set_velocity" | "stop" | "spawn_robot" | "add_static_obstacle" | "add_dynamic_obstacle" | "add_goal";
  id?: string;
  distance?: number;
  angle?: number;
  x?: number;
  y?: number;
  theta?: number;
  width?: number;
  height?: number;
  linear?: number;
  angular?: number;
  minBound?: number;
  maxBound?: number;
  vx?: number;
  vy?: number;
}

export function parseStudentCode(code: string): {
  isTickScript: boolean;
  commands: RobotCommand[];
  worldCommands: RobotCommand[];
  customVelocity?: { linear: number; angular: number };
} {
  const commands: RobotCommand[] = [];
  const worldCommands: RobotCommand[] = [];

  // Strip python comments
  const cleanCode = code.replace(/#.*$/gm, "");

  // Check if code defines reactive on_tick
  const hasOnTick = /def\s+on_tick/i.test(cleanCode) || /robot\.set_velocity/i.test(cleanCode);

  // Parse World Commands globally (handles multi-line formatting because \s* matches newlines)
  for (const m of cleanCode.matchAll(/spawn_robot\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
    worldCommands.push({ type: "spawn_robot", x: parseFloat(m[1]), y: parseFloat(m[2]), theta: parseFloat(m[3]) });
  }

  for (const m of cleanCode.matchAll(/add_static_obstacle\s*\(\s*["']([^"']+)["']\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
    worldCommands.push({ type: "add_static_obstacle", id: m[1], x: parseFloat(m[2]), y: parseFloat(m[3]), width: parseFloat(m[4]), height: parseFloat(m[5]) });
  }

  for (const m of cleanCode.matchAll(/add_dynamic_obstacle\s*\(\s*["']([^"']+)["']\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
    worldCommands.push({
      type: "add_dynamic_obstacle",
      id: m[1],
      x: parseFloat(m[2]),
      y: parseFloat(m[3]),
      width: parseFloat(m[4]),
      height: parseFloat(m[5]),
      minBound: parseFloat(m[6]),
      maxBound: parseFloat(m[7]),
      vx: parseFloat(m[8]),
      vy: parseFloat(m[9]),
    });
  }

  for (const m of cleanCode.matchAll(/add_goal\s*\(\s*["']([^"']+)["']\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
    worldCommands.push({ type: "add_goal", id: m[1], x: parseFloat(m[2]), y: parseFloat(m[3]) });
  }

  // Parse sequential commands globally, preserving order
  const seqCommands: { index: number; cmd: RobotCommand }[] = [];

  for (const m of cleanCode.matchAll(/go_to\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "go_to", x: parseFloat(m[1]), y: parseFloat(m[2]) } });
  }
  for (const m of cleanCode.matchAll(/move_forward\s*\(\s*([-\d.]+)\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "move_forward", distance: parseFloat(m[1]) } });
  }
  for (const m of cleanCode.matchAll(/move_backward\s*\(\s*([-\d.]+)\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "move_backward", distance: parseFloat(m[1]) } });
  }
  for (const m of cleanCode.matchAll(/rotate\s*\(\s*([-\d.]+)\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "rotate", angle: (parseFloat(m[1]) * Math.PI) / 180 } });
  }
  for (const m of cleanCode.matchAll(/set_velocity\s*\(\s*(?:linear\s*=\s*)?([-\d.]+)\s*,\s*(?:angular\s*=\s*)?([-\d.]+)\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "set_velocity", linear: parseFloat(m[1]), angular: parseFloat(m[2]) } });
  }
  for (const m of cleanCode.matchAll(/stop\s*\(\s*\)/gi)) {
    seqCommands.push({ index: m.index!, cmd: { type: "stop" } });
  }

  seqCommands.sort((a, b) => a.index - b.index);
  commands.push(...seqCommands.map(sc => sc.cmd));

  return {
    isTickScript: hasOnTick,
    commands,
    worldCommands,
  };
}
