import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const SYSTEM_INSTRUCTION = `You are RoboLedger Copilot, a senior robotics simulation engineer and expert AI Tutor built into the RoboLedger platform.
RoboLedger is an advanced robotics simulation and blockchain verification platform powered by NEWRRO kinematics, ROS2 Foxy models, and MST Testnet consensus.

YOUR CAPABILITIES & DOMAIN KNOWLEDGE:
1. Differential Drive Kinematics:
   - Pose: (x, y, theta in radians)
   - Goal tracking: Target angle = math.atan2(goal_y - y, goal_x - x)
   - Heading error normalization: math.atan2(math.sin(target - theta), math.cos(target - theta))
   - Angular velocity command: angular = max(-1.0, min(1.0, heading_error * 1.5))
   - Linear speed regulation: reduce linear speed when heading error is large (|error| > 0.8 rad).

2. LiDAR & Obstacle Avoidance:
   - 2D LiDAR readings: lidar.get_distance(angle) where angle is in degrees (-180 to +180) or radians (-pi to +pi).
   - Cardinal distances: front (0°), left (+45° or +90°), right (-45° or -90°), rear (180°).
   - Dynamic Obstacles: Oscillating hazards moving along X or Y with defined bounds and velocities.
   - Algorithms: Artificial Potential Fields (APF), Reciprocal Velocity Obstacles (RVO), and A* local tangent steering.
   - Zero-Collision Rule: Strict tolerance. The robot must maintain at least 0.35m clearance to pass attestation.

3. Simulation Python API:
   - spawn_robot(x, y, theta)
   - add_static_obstacle(id, x, y, width, height)
   - add_dynamic_obstacle(id, x, y, width, height, min_bound, max_bound, vx, vy)
   - add_goal(id, x, y)
   - on_tick(robot, lidar) called at ~60 Hz (dt = 0.016s).

FORMATTING GUIDELINES:
- Be clear, practical, and mathematically sound.
- When writing Python code, provide runnable code compatible with the on_tick(robot, lidar) API.
- Use markdown formatting with clear headings and code blocks.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], mode = "tutor", code = "", prompt = "" } = body;

    let userQuery = prompt;
    if (!userQuery && messages.length > 0) {
      userQuery = messages[messages.length - 1].content;
    }

    let contentsPayload: any[] = [];

    if (mode === "explain_code") {
      contentsPayload = [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this RoboLedger robot controller code in detail. Explain its kinematic formulation, how it handles heading error, whether obstacle avoidance will prevent collisions with dynamic obstacles, and what potential issues could cause collisions:\n\n\`\`\`python\n${code}\n\`\`\``,
            },
          ],
        },
      ];
    } else if (mode === "optimize_code") {
      contentsPayload = [
        {
          role: "user",
          parts: [
            {
              text: `Optimize this RoboLedger robot controller code to ensure ZERO collisions with both static and dynamic moving obstacles while maintaining smooth trajectory to the goal. Provide the improved runnable Python code and explain key improvements:\n\n\`\`\`python\n${code}\n\`\`\``,
            },
          ],
        },
      ];
    } else {
      // Tutor conversation mode
      // Format chat history for Gemini API
      contentsPayload = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Ensure last message is from user
      if (contentsPayload.length === 0 || contentsPayload[contentsPayload.length - 1].role !== "user") {
        contentsPayload.push({
          role: "user",
          parts: [{ text: userQuery || "Hello RoboLedger Copilot!" }],
        });
      }
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "GEMINI_API_KEY is not configured in .env.local. Please configure your Gemini API key to use the Copilot.",
        },
        { status: 500 }
      );
    }

    // Call Gemini API (gemini-2.5-flash)
    const model = "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: contentsPayload,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);

      // Fallback response if API fails
      return NextResponse.json(
        {
          reply:
            "I'm currently unable to reach the neural inference cluster. Please check your network connection or API quota.",
          error: errText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const replyText =
      candidate?.content?.parts?.[0]?.text ||
      "Received empty response from the AI model.";

    return NextResponse.json({
      reply: replyText,
      model,
    });
  } catch (error: any) {
    console.error("Copilot route error:", error);
    return NextResponse.json(
      {
        reply: "An internal error occurred while processing your request.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
