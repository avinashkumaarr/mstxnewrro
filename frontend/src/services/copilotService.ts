export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotResponse {
  reply: string;
  model?: string;
  error?: string;
}

export const copilotService = {
  /**
   * Send a conversation history to the AI Robotics Tutor
   */
  async askTutor(messages: ChatMessage[]): Promise<CopilotResponse> {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, mode: "tutor" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      console.error("Copilot Tutor Error:", e);
      return {
        reply: "Failed to connect to the AI Copilot. Please check your network and API credentials.",
        error: e.message,
      };
    }
  },

  /**
   * Analyze and explain the kinematic & obstacle avoidance properties of a Python controller
   */
  async explainCode(code: string): Promise<CopilotResponse> {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode: "explain_code" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      console.error("Copilot Explain Error:", e);
      return {
        reply: "Unable to analyze code kinematics at this time.",
        error: e.message,
      };
    }
  },

  /**
   * Optimize Python controller code for zero collisions
   */
  async optimizeCode(code: string): Promise<CopilotResponse> {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode: "optimize_code" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      console.error("Copilot Optimize Error:", e);
      return {
        reply: "Unable to optimize code at this time.",
        error: e.message,
      };
    }
  },
};
