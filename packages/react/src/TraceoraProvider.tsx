import React, { createContext, useContext, useMemo, useEffect } from "react";
import { EventStore, EventEmitter, setupNetworkInstrumentation, PerformanceMonitor, setupErrorInstrumentation, setupConsoleInstrumentation, setupRouterInstrumentation, setupSessionRecording, setupWebVitals } from "@traceora/core";

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
    
    // We can't clean this up easily in useMemo, but since it's a provider that usually mounts once, it's ok for now.
    // Ideally it would be in useEffect.
    setupSessionRecording(em);
    setupWebVitals(em);
    
    // Expose globally for things like Redux/Zustand that are instantiated outside React
    if (typeof window !== "undefined") {
      (window as any).__traceora_emitter = em;
    }
    
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
