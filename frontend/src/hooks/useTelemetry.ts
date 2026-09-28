"use client";

import { useState, useEffect } from "react";
import { simulationService } from "@/services/simulationService";
import { TelemetryData } from "@/types/telemetry";

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    simulationService.getTelemetry().then(setTelemetry);
    const unsub = simulationService.subscribe({
      onTelemetryUpdate: setTelemetry,
    });
    return () => unsub();
  }, []);

  return telemetry;
}
