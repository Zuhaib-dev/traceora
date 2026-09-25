import React, { Component, ErrorInfo, ReactNode } from "react";
import { EventEmitter } from "@traceora/core";
import { useTraceora } from "./TraceoraProvider";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  emitter: EventEmitter;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryCore extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.emitter.emit({
      type: "ERROR",
      source: "React.ErrorBoundary",
      metadata: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: "20px", background: "#ffe3e3", color: "#c92a2a", borderRadius: "8px", border: "1px solid #ffa8a8", margin: "10px 0" }}>
          <h2>💥 Component Crashed</h2>
          <p><strong>{this.state.error?.message}</strong></p>
          <p style={{ fontSize: "0.9em" }}>Traceora caught this error. Check the timeline to see what happened right before this!</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wraps children in a React Error Boundary that automatically logs crashes to Traceora.
 */
export const TraceoraErrorBoundary: React.FC<Omit<Props, "emitter">> = (props) => {
  const emitter = useTraceora();
  return <ErrorBoundaryCore {...props} emitter={emitter} />;
};
