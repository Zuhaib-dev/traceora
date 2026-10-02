import React, { createContext, useContext, useEffect, useState } from "react";
import { EventStore, EventEmitter, setupNetworkInstrumentation, PerformanceMonitor, setupErrorInstrumentation, setupConsoleInstrumentation, setupRouterInstrumentation, setupWebVitals } from "@traceora/core";

const TraceoraContext = createContext<EventEmitter | null>(null);

export interface TraceoraProviderConfig {
  enabled?: boolean;
  allowedTracingOrigins?: (string | RegExp)[];
  captureRequestBodies?: boolean;
  captureRequestHeaders?: boolean;
  maxEvents?: number;
}

export const TraceoraProvider: React.FC<{ children: React.ReactNode; config?: TraceoraProviderConfig }> = ({ children, config }) => {
  const [emitter] = useState(() => new EventEmitter(new EventStore(config?.maxEvents)));
  const enabled = config?.enabled ?? process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!enabled) return;
    const disposers = [
      setupNetworkInstrumentation(emitter, config),
      setupErrorInstrumentation(emitter),
      setupConsoleInstrumentation(emitter),
      setupRouterInstrumentation(emitter),
      setupWebVitals(emitter),
    ].filter((dispose): dispose is () => void => typeof dispose === "function");
    const monitor = new PerformanceMonitor(emitter);
    const previousEmitter = (window as any).__traceora_emitter;
    (window as any).__traceora_emitter = emitter;
    emitter.emit({
      type: "APP_START",
      metadata: { timestamp: new Date().toISOString() }
    });
    return () => {
      monitor.dispose();
      disposers.reverse().forEach(dispose => dispose());
      if ((window as any).__traceora_emitter === emitter) {
        if (previousEmitter) (window as any).__traceora_emitter = previousEmitter;
        else delete (window as any).__traceora_emitter;
      }
    };
  }, [emitter, enabled, config]);

  return (
    <TraceoraContext.Provider value={emitter}>
      {children}
    </TraceoraContext.Provider>
  );
};

export const useTraceora = () => {
  const context = useContext(TraceoraContext);
  if (!context) {
    throw new Error("useTraceora must be used within a TraceoraProvider");
  }
  return context;
};
