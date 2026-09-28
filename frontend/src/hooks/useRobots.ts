"use client";

import { useState } from "react";

export function useRobots() {
  const [robots] = useState([
    { id: "agv-01", name: "NEWRRO AGV-01", type: "Differential Drive", status: "Active" },
    { id: "agv-02", name: "NEWRRO OMNI-02", type: "Mecanum Holonomic", status: "Standby" },
  ]);

  return { robots };
}
