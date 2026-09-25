import React, { useEffect, useState, useMemo, useRef } from "react";
import { TraceEvent } from "@traceora/core";
import { useTraceora } from "./TraceoraProvider";

const TraceoraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const TraceoraDevtools: React.FC = () => {
  const emitter = useTraceora();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "RENDER" | "NETWORK" | "ERROR" | "PERF">("ALL");

  useEffect(() => {
    // Subscribe to new events instead of polling if possible, but for now we poll
    const interval = setInterval(() => {
      // @ts-ignore
      const allEvents = emitter['store'] ? emitter['store'].getAll() : [];
      setEvents([...allEvents]);
    }, 100);
    return () => clearInterval(interval);
  }, [emitter]);

  const filteredEvents = useMemo(() => {
    const reversed = events.slice().reverse();
    if (filter === "ALL") return reversed;
    if (filter === "RENDER") return reversed.filter(e => e.type.includes("MOUNT") || e.type.includes("RENDER"));
    if (filter === "NETWORK") return reversed.filter(e => e.type.includes("NETWORK"));
    if (filter === "ERROR") return reversed.filter(e => e.type.includes("ERROR"));
    if (filter === "PERF") return reversed.filter(e => e.type === "PERFORMANCE_WARNING");
    return reversed;
  }, [events, filter]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          width: "56px",
          height: "56px",
          background: "linear-gradient(135deg, #1971c2, #1864ab)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(25, 113, 194, 0.4)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <TraceoraIcon />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "450px",
      background: "#0f1115",
      color: "#e0e0e0",
      borderTop: "1px solid #2a2d35",
      display: "flex",
      flexDirection: "column",
      zIndex: 99999,
      boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .traceora-scrollbar::-webkit-scrollbar { width: 8px; }
        .traceora-scrollbar::-webkit-scrollbar-track { background: #0f1115; }
        .traceora-scrollbar::-webkit-scrollbar-thumb { background: #2a2d35; border-radius: 4px; }
        .traceora-scrollbar::-webkit-scrollbar-thumb:hover { background: #3c4049; }
      `}</style>
      
      {/* HEADER */}
      <div style={{
        padding: "12px 24px",
        background: "#16181d",
        borderBottom: "1px solid #2a2d35",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ color: "#339af0", display: "flex", alignItems: "center" }}>
            <TraceoraIcon />
          </div>
          <strong style={{ fontSize: "15px", letterSpacing: "0.5px", color: "#fff" }}>TRACEORA</strong>
          
          <div style={{ display: "flex", gap: "4px", marginLeft: "24px", background: "#0f1115", padding: "4px", borderRadius: "6px", border: "1px solid #2a2d35" }}>
            {["ALL", "RENDER", "NETWORK", "PERF", "ERROR"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  background: filter === f ? "#2a2d35" : "transparent",
                  color: filter === f ? "#fff" : "#888",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: filter === f ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => {
              // @ts-ignore
              if (emitter['store']) emitter['store'].events = [];
            }}
            style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
            title="Clear Events"
          >
            <TrashIcon /> Clear
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "20px", lineHeight: "1" }}
          >
            ×
          </button>
        </div>
      </div>

      {/* EVENT LIST */}
      <div 
        className="traceora-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "16px 24px",
          overscrollBehavior: "contain", // PREVENTS SCROLLING THE PARENT APP
        }}
        onWheel={(e) => e.stopPropagation()} // EXTRA PROTECTION AGAINST PARENT SCROLL
      >
        {filteredEvents.length === 0 ? (
          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#555", flexDirection: "column", gap: "12px" }}>
            <TraceoraIcon />
            <p>Waiting for events...</p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div key={ev.id} style={{
              background: "#16181d",
              border: "1px solid #2a2d35",
              borderRadius: "8px",
              padding: "14px",
              marginBottom: "12px",
              fontSize: "13px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: ev.type.includes("ERROR") ? "#ff6b6b" 
                               : ev.type.includes("WARNING") || ev.type.includes("PERF") ? "#fcc419"
                               : ev.type.includes("NETWORK") ? "#339af0"
                               : ev.type.includes("MOUNT") ? "#51cf66" 
                               : "#ced4da"
                  }} />
                  <strong style={{ 
                    color: ev.type.includes("ERROR") ? "#ff6b6b" : "#fff",
                  }}>{ev.type}</strong>
                </div>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  {new Date(ev.timestamp).toISOString().split('T')[1].slice(0, -1)}
                </span>
              </div>
              
              <div style={{ color: "#888", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#2a2d35", color: "#ccc", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                  {ev.source || "unknown"}
                </span>
                {ev.traceId && (
                  <span style={{ background: "rgba(51, 154, 240, 0.1)", color: "#339af0", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                    Trace: {ev.traceId}
                  </span>
                )}
              </div>
              
              {ev.metadata && (
                <div style={{ marginTop: "12px", background: "#0f1115", borderRadius: "6px", padding: "10px", border: "1px solid #2a2d35" }}>
                  <pre style={{ margin: 0, color: "#a5d8ff", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {JSON.stringify(ev.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
