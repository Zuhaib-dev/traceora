import { useEffect, useRef } from "react";
import { useTraceora } from "./TraceoraProvider";

/**
 * Automatically tracks the lifecycle (Mount, Render, Unmount) of a React component.
 */
export function useComponentTrace(componentName: string) {
  const emitter = useTraceora();
  const renderCount = useRef(0);
  const isFirstRender = useRef(true);

  // Track Mount & Unmount
  useEffect(() => {
    emitter.emit({
      type: "COMPONENT_MOUNT",
      source: componentName,
    });

    return () => {
      emitter.emit({
        type: "COMPONENT_UNMOUNT",
        source: componentName,
      });
    };
  }, [componentName, emitter]);

  // Track Renders
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip the first render because the mount event covers it
    }
    
    renderCount.current += 1;
    emitter.emit({
      type: "COMPONENT_RENDER",
      source: componentName,
      metadata: { renderCount: renderCount.current },
    });
  }); // No dependency array = runs on every render
}

/**
 * Manually start a trace for an interaction or async flow.
 */
export function useTrace() {
  const emitter = useTraceora();
  
  return (name: string, metadata?: Record<string, unknown>) => {
    return emitter.startTrace(name, metadata);
  };
}
