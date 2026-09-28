"use client";

import { useState, useEffect } from "react";
import { simulationService } from "@/services/simulationService";
import { SimulationStatus } from "@/types/simulation";
import { TelemetryData } from "@/types/telemetry";

export function useSimulation() {
  const [status, setStatus] = useState<SimulationStatus>("IDLE");
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    simulationService.getStatus().then(setStatus);
    simulationService.getTelemetry().then(setTelemetry);

    const unsub = simulationService.subscribe({
      onStatusChange: setStatus,
      onTelemetryUpdate: setTelemetry,
    });

    return () => unsub();
  }, []);

  return {
    status,
    telemetry,
    run: simulationService.runSimulation,
    stop: simulationService.stopSimulation,
    reset: simulationService.resetSimulation,
    setSpeed: simulationService.setSpeed,
  };
}
