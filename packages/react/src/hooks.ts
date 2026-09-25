import { useEffect, useLayoutEffect, useRef } from "react";
import { useTraceora } from "./TraceoraProvider";

/**
 * Automatically tracks the lifecycle (Mount, Render, Unmount) and render duration of a React component.
 */
export function useComponentTrace(componentName: string) {
  const emitter = useTraceora();
  const renderCount = useRef(0);
  const isFirstRender = useRef(true);

  // Capture start time during the render phase
  const renderStartTime = performance.now();

  useLayoutEffect(() => {
    // Capture end time right after React mutates the DOM
    const renderDuration = performance.now() - renderStartTime;
    const durationMs = Math.round(renderDuration * 100) / 100;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      emitter.emit({
        type: "COMPONENT_MOUNT",
        source: componentName,
        metadata: { durationMs }
      });
    } else {
      renderCount.current += 1;
      emitter.emit({
        type: "COMPONENT_RENDER",
        source: componentName,
        metadata: { renderCount: renderCount.current, durationMs },
      });
    }
  }); // No dependencies = runs synchronously after every render

  // Track Unmount
  useEffect(() => {
    return () => {
      emitter.emit({
        type: "COMPONENT_UNMOUNT",
        source: componentName,
      });
    };
  }, [componentName, emitter]);
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
