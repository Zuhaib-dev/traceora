import React, { createContext, useContext, useMemo, useEffect } from "react";
import { EventStore, EventEmitter, setupNetworkInstrumentation, PerformanceMonitor, setupErrorInstrumentation, setupConsoleInstrumentation, setupRouterInstrumentation } from "@traceora/core";

const TraceoraContext = createContext<EventEmitter | null>(null);

export const TraceoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const emitter = useMemo(() => {
    const store = new EventStore();
    const em = new EventEmitter(store);
    setupNetworkInstrumentation(em);
    setupErrorInstrumentation(em);
    setupConsoleInstrumentation(em);
    setupRouterInstrumentation(em);
    new PerformanceMonitor(em); // Automatically starts listening
    return em;
  }, []);

  useEffect(() => {
    emitter.emit({
      type: "APP_START",
      metadata: { timestamp: new Date().toISOString() }
    });
  }, [emitter]);

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
