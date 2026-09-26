import React, { useEffect, useState, useMemo } from "react";
import { TraceEvent } from "@traceora/core";
import { useTraceora } from "./TraceoraProvider";

// --- Premium Icons ---
const TraceoraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 34 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1.8 31.2 10v18L17 36.2 2.8 28V10L17 1.8Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="m11.2 15.1 5.8-3.35 5.8 3.35v7.8l-5.8 3.35-5.8-3.35v-7.8Z" fill="currentColor" opacity=".23" />
    <path d="m17 11.8 5.8 3.3-5.8 3.4-5.8-3.4 5.8-3.3Zm0 6.7v7.75" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ActivityIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const GlobeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const XCircleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const CodeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;

function parseFileFromStackTrace(errorString?: string): string | null {
  if (!errorString) return null;
  const lines = errorString.split('\n');
  for (const line of lines) {
    if (line.includes('node_modules') || line.includes('react-dom') || line.includes('installHook.js')) continue;
    const match = line.match(/(https?:\/\/[^\/]+\/)([^?)]+)(?:\?[^:]*)?:(\d+):(\d+)/);
    if (match) {
      return `${match[2]}:${match[3]}:${match[4]}`;
    }
  }
  return null;
}

export const TraceoraDevtools: React.FC = () => {
  const emitter = useTraceora();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "RENDER" | "NETWORK" | "ERROR" | "PERF">("ALL");

  useEffect(() => {
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
          background: "linear-gradient(135deg, #2b8a3e, #099268)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 8px 32px rgba(9, 146, 104, 0.4)",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(9, 146, 104, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(9, 146, 104, 0.4)";
        }}
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
      height: "500px",
      background: "rgba(15, 17, 21, 0.85)", // Glassmorphism base
      backdropFilter: "blur(16px)",          // Premium blur
      WebkitBackdropFilter: "blur(16px)",
      color: "#e0e0e0",
      borderTop: "1px solid rgba(32, 201, 151, 0.3)",
      boxShadow: "0 -10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      zIndex: 99999,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.98) translateY(5px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .traceora-scrollbar::-webkit-scrollbar { width: 8px; }
        .traceora-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .traceora-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .traceora-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(32, 201, 151, 0.3); }
        .traceora-card {
          transition: all 0.2s ease;
        }
        .traceora-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.15) !important;
        }
        .traceora-json-block {
          transition: all 0.2s ease;
        }
        .traceora-card:hover .traceora-json-block {
          border-color: rgba(32, 201, 151, 0.2) !important;
          background: rgba(15, 17, 21, 0.95) !important;
        }
      `}</style>
      
      {/* HEADER */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(22, 24, 29, 0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ color: "#20c997", display: "flex", alignItems: "center", filter: "drop-shadow(0 0 8px rgba(32, 201, 151, 0.4))" }}>
            <TraceoraIcon />
          </div>
          <strong style={{ fontSize: "16px", letterSpacing: "1px", color: "#fff", textShadow: "0 2px 10px rgba(255,255,255,0.2)" }}>TRACEORA</strong>
          
          <div style={{ display: "flex", gap: "6px", marginLeft: "24px", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            {["ALL", "RENDER", "NETWORK", "PERF", "ERROR"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  background: filter === f ? "rgba(32, 201, 151, 0.15)" : "transparent",
                  color: filter === f ? "#20c997" : "#888",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: filter === f ? "bold" : "normal",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: filter === f ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)" : "none"
                }}
              >
                {f === "ALL" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
                {f === "RENDER" && <ActivityIcon />}
                {f === "NETWORK" && <GlobeIcon />}
                {f === "PERF" && <AlertIcon />}
                {f === "ERROR" && <XCircleIcon />}
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button 
            onClick={() => {
              // @ts-ignore
              if (emitter['store']) emitter['store'].events = [];
            }}
            style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", transition: "color 0.2s ease" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ff6b6b"}
            onMouseLeave={e => e.currentTarget.style.color = "#888"}
            title="Clear Events"
          >
            <TrashIcon /> Clear
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center", color: "#aaa", cursor: "pointer", fontSize: "18px", transition: "all 0.2s ease" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#aaa";
            }}
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
          padding: "20px 24px",
          overscrollBehavior: "contain",
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredEvents.length === 0 ? (
          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#555", flexDirection: "column", gap: "16px" }}>
            <div style={{ opacity: 0.3, transform: "scale(1.5)" }}><TraceoraIcon /></div>
            <p style={{ letterSpacing: "1px", fontSize: "14px" }}>Awaiting signals...</p>
          </div>
        ) : (
          filteredEvents.map((ev, index) => {
            const isError = ev.type.includes("ERROR");
            const isWarning = ev.type.includes("WARNING") || ev.type.includes("PERF");
            const isNetwork = ev.type.includes("NETWORK");
            const isRender = ev.type.includes("MOUNT") || ev.type.includes("RENDER");

            const color = isError ? "#ff6b6b" : isWarning ? "#fcc419" : isNetwork ? "#339af0" : isRender ? "#51cf66" : "#ced4da";
            const bgGradient = isError ? "linear-gradient(90deg, rgba(255, 107, 107, 0.05) 0%, transparent 100%)" 
                             : isWarning ? "linear-gradient(90deg, rgba(252, 196, 25, 0.05) 0%, transparent 100%)"
                             : "rgba(255,255,255,0.02)";

            return (
              <div key={ev.id} className="traceora-card" style={{
                background: bgGradient,
                backgroundColor: "rgba(20, 22, 27, 0.7)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
                fontSize: "13px",
                animation: `popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.03}s both`,
                backdropFilter: "blur(4px)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      color: color,
                      background: `rgba(${color === '#ff6b6b' ? '255,107,107' : color === '#fcc419' ? '252,196,25' : color === '#339af0' ? '51,154,240' : color === '#51cf66' ? '81,207,102' : '206,212,218'}, 0.15)`,
                      padding: "6px",
                      borderRadius: "6px",
                      display: "flex"
                    }}>
                      {isError ? <XCircleIcon /> : isWarning ? <AlertIcon /> : isNetwork ? <GlobeIcon /> : <ActivityIcon />}
                    </div>
                    <strong style={{ color, fontSize: "14px", letterSpacing: "0.5px" }}>{ev.type}</strong>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "monospace" }}>
                    {new Date(ev.timestamp).toISOString().split('T')[1].slice(0, -1)}
                  </span>
                </div>
                
                <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,255,255,0.08)", color: "#eee", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500 }}>
                    {ev.source || "unknown"}
                  </span>
                  {ev.traceId && (
                    <span style={{ background: "rgba(32, 201, 151, 0.1)", color: "#20c997", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(32, 201, 151, 0.2)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                      {ev.traceId}
                    </span>
                  )}
                  {(() => {
                    if (!isError || !ev.metadata || !ev.metadata.error) return null;
                    const errorStr = typeof ev.metadata.error === 'string' ? ev.metadata.error : JSON.stringify(ev.metadata.error);
                    const fileAndLine = parseFileFromStackTrace(errorStr);
                    if (!fileAndLine) return null;
                    return (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetch(`/__open-in-editor?file=${encodeURIComponent(fileAndLine)}`);
                        }}
                        style={{
                          background: "rgba(32, 201, 151, 0.1)", color: "#20c997", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(32, 201, 151, 0.2)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(32, 201, 151, 0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(32, 201, 151, 0.1)";
                        }}
                      >
                        <CodeIcon /> Open in Editor
                      </button>
                    );
                  })()}
                </div>
                
                {ev.metadata && (
                  <div className="traceora-json-block" style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <pre style={{ margin: 0, color: "#a5d8ff", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "1.5" }}>
                      {JSON.stringify(ev.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* SIGNATURE */}
        {filteredEvents.length > 0 && (
          <div style={{ textAlign: "center", padding: "24px 0 8px 0", color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "1px" }}>
            CRAFTED WITH <span style={{ color: "#20c997" }}>💚</span> BY ZUHAIB RASHID
          </div>
        )}
      </div>
    </div>
  );
};
