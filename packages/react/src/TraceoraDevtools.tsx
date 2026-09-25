import React, { useEffect, useState } from "react";
import { TraceEvent } from "@traceora/core";
import { useTraceora } from "./TraceoraProvider";

export const TraceoraDevtools: React.FC = () => {
  const emitter = useTraceora();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Polling the store just for this MVP overlay. 
    // A real implementation would use a subscription model on the EventStore.
    const interval = setInterval(() => {
      // @ts-ignore - we need to expose getAll() on the emitter or store
      const allEvents = emitter['store'] ? emitter['store'].getAll() : [];
      setEvents(allEvents);
    }, 500);
    return () => clearInterval(interval);
  }, [emitter]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#1e1e1e",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px 15px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontWeight: "bold",
        }}
      >
        🚀 Open Traceora
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "400px",
      height: "600px",
      maxHeight: "80vh",
      background: "#1e1e1e",
      color: "#e0e0e0",
      border: "1px solid #333",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      overflow: "hidden",
      fontFamily: "monospace",
    }}>
      <div style={{
        padding: "12px 16px",
        background: "#2d2d2d",
        borderBottom: "1px solid #444",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <strong style={{ fontSize: "14px" }}>Traceora Timeline ({events.length})</strong>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "16px" }}
        >
          ✖
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {events.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No events yet...</div>
        ) : (
          events.slice().reverse().map((ev) => (
            <div key={ev.id} style={{
              background: "#252525",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "8px",
              fontSize: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ 
                  color: ev.type.includes("ERROR") ? "#ff6b6b" 
                       : ev.type.includes("MOUNT") ? "#51cf66" 
                       : ev.type.includes("INTERACTION") ? "#339af0" 
                       : "#fcc419",
                  fontWeight: "bold"
                }}>{ev.type}</span>
                <span style={{ color: "#888" }}>{new Date(ev.timestamp).toISOString().split('T')[1].slice(0, -1)}</span>
              </div>
              <div style={{ color: "#aaa", marginBottom: "4px" }}>
                Source: <span style={{ color: "#fff" }}>{ev.source || "unknown"}</span>
              </div>
              {ev.traceId && (
                <div style={{ color: "#aaa", marginBottom: "4px" }}>
                  Trace: <span style={{ color: "#c0eb75" }}>{ev.traceId}</span>
                </div>
              )}
              {ev.metadata && (
                <pre style={{ margin: 0, padding: "6px", background: "#1a1a1a", borderRadius: "4px", color: "#a5d8ff", fontSize: "11px", overflowX: "auto" }}>
                  {JSON.stringify(ev.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
