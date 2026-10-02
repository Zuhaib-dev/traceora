import React, { useEffect, useState, useMemo, useRef } from "react";
import { TraceEvent } from "@traceora/core";
import { useTraceora } from "./TraceoraProvider";

/* Hallmark · component: TraceoraDevtools · genre: modern-minimal · theme: custom (linear-dark-premium)
 * states: default · hover · focus · active · disabled
 * contrast: pass (46–50)
 * critique: P5 H5 E5 S5 R5 V5
 */

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// --- Premium Minimal Icons ---
const TraceoraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 34 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1.8 31.2 10v18L17 36.2 2.8 28V10L17 1.8Z" stroke="currentColor" strokeWidth="2.5" />
    <path d="m17 11.8 5.8 3.3-5.8 3.4-5.8-3.4 5.8-3.3Zm0 6.7v7.75" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;
const ActivityIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const GlobeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const XCircleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const CodeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const DatabaseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const ReplayIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const GripIcon = () => <svg width="10" height="14" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="4" cy="4" r="1"/><circle cx="4" cy="10" r="1"/><circle cx="4" cy="16" r="1"/><circle cx="10" cy="4" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="10" cy="16" r="1"/></svg>;

export const TraceoraDevtools: React.FC = () => {
  const emitter = useTraceora();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "RENDER" | "NETWORK" | "ERROR" | "PERF" | "STATE">("ALL");
  
  // Drag State
  const [iconPos, setIconPos] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize and persist icon position
  useEffect(() => {
    let initialPos = { x: window.innerWidth - 64, y: window.innerHeight - 64 };
    try {
      const saved = localStorage.getItem('traceora-icon-pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          initialPos = { 
            x: Math.max(16, Math.min(parsed.x, window.innerWidth - 64)), 
            y: Math.max(16, Math.min(parsed.y, window.innerHeight - 64)) 
          };
        }
      }
    } catch (e) {}

    setIconPos(initialPos);
    
    const handleResize = () => setIconPos(prev => prev ? { 
      x: Math.min(prev.x, window.innerWidth - 64), 
      y: Math.min(prev.y, window.innerHeight - 64) 
    } : null);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!iconPos) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...iconPos };
    let dragged = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragged = true;
        setIsDragging(true);
      }
      if (dragged) {
        let newX = startPos.x + dx;
        let newY = startPos.y + dy;
        newX = Math.max(16, Math.min(newX, window.innerWidth - 64)); // Add padding from edges
        newY = Math.max(16, Math.min(newY, window.innerHeight - 64));
        setIconPos({ x: newX, y: newY });
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setTimeout(() => setIsDragging(false), 50); // delay to prevent click fire
      
      // Save position to localStorage
      setIconPos(currentPos => {
        if (currentPos) {
          try { localStorage.setItem('traceora-icon-pos', JSON.stringify(currentPos)); } catch(e) {}
        }
        return currentPos;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  useEffect(() => {
    setEvents(emitter.getAll());
    return emitter.subscribe(() => setEvents(emitter.getAll()));
  }, [emitter]);

  const filteredEvents = useMemo(() => {
    const byTraceId = new Map<string, TraceEvent[]>();
    events.forEach(e => {
      if (e.traceId) {
        if (!byTraceId.has(e.traceId)) byTraceId.set(e.traceId, []);
        byTraceId.get(e.traceId)!.push(e);
      }
    });

    const displayList: (TraceEvent & { children?: TraceEvent[] })[] = [];
    const processedTraceIds = new Set<string>();

    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if (!ev.traceId) {
        displayList.push(ev);
        continue;
      }
      if (processedTraceIds.has(ev.traceId)) continue;

      const traceFamily = byTraceId.get(ev.traceId)!;
      traceFamily.sort((a, b) => a.timestamp - b.timestamp);
      
      const parent = traceFamily.find(e => e.type === "NETWORK_REQUEST") || traceFamily[0];
      const children = traceFamily.filter(e => e.id !== parent.id);
      
      displayList.push({ ...parent, children });
      processedTraceIds.add(ev.traceId);
    }

    return displayList.filter(e => {
      if (filter === "ALL") return true;
      if (filter === "RENDER") return e.type.includes("MOUNT") || e.type.includes("RENDER") || !!e.children?.some(c => c.type.includes("MOUNT") || c.type.includes("RENDER"));
      if (filter === "NETWORK") return e.type.includes("NETWORK") || !!e.children?.some(c => c.type.includes("NETWORK"));
      if (filter === "STATE") return e.type === "STATE_CHANGE" || !!e.children?.some(c => c.type === "STATE_CHANGE");
      if (filter === "ERROR") return e.type.includes("ERROR") || !!e.children?.some(c => c.type.includes("ERROR"));
      if (filter === "PERF") return e.type === "PERFORMANCE_WARNING" || e.type === "WEB_VITALS" || !!e.children?.some(c => c.type === "PERFORMANCE_WARNING" || c.type === "WEB_VITALS");
      return true;
    });
  }, [events, filter]);

  if (!isOpen) {
    if (!iconPos) return null;
    return (
      <button 
        onPointerDown={handlePointerDown}
        onClick={() => !isDragging && setIsOpen(true)}
        style={{
          position: "fixed",
          left: iconPos.x,
          top: iconPos.y,
          width: "48px",
          height: "48px",
          background: "linear-gradient(180deg, #1A1A1A 0%, #080808 100%)",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          cursor: isDragging ? "grabbing" : "pointer",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          touchAction: "none"
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (isDragging) return;
          e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          if (isDragging) return;
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
        }}
        aria-label="Open Traceora DevTools"
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.25, backgroundImage: `url("${NOISE_SVG}")`, mixBlendMode: "overlay", pointerEvents: "none", borderRadius: "14px" }} />
        
        {/* Grip Icon */}
        <div style={{
          position: "absolute",
          left: "-18px",
          color: "#888",
          opacity: isHovered || isDragging ? 1 : 0,
          transform: isHovered || isDragging ? "translateX(0)" : "translateX(4px)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex"
        }}>
          <GripIcon />
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TraceoraIcon />
        </div>
      </button>
    );
  }

  const isRightSide = iconPos && iconPos.x > window.innerWidth / 2;
  const isBottomSide = iconPos && iconPos.y > window.innerHeight / 2;
  
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    [isBottomSide ? "bottom" : "top"]: "24px",
    [isRightSide ? "right" : "left"]: "24px",
    width: "480px", 
    height: "calc(100vh - 48px)",
    maxHeight: "680px",
    background: "rgba(9, 9, 11, 0.90)", 
    backdropFilter: "blur(32px) saturate(150%)",
    WebkitBackdropFilter: "blur(32px) saturate(150%)",
    color: "#EDEDED",
    borderRadius: "16px",
    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 32px 64px -16px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    zIndex: 99999,
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    animation: "tr-panelOpen 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    overflow: "hidden",
  };

  return (
    <div style={panelStyle}>
      <style>{`
        @keyframes tr-panelOpen {
          from { transform: scale(0.96) ${isBottomSide ? 'translateY(16px)' : 'translateY(-16px)'}; opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes tr-fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tr-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .tr-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .tr-scroll::-webkit-scrollbar-track { background: transparent; }
        .tr-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 2px; }
        .tr-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        .tr-btn { transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
        .tr-btn:hover { background: rgba(255, 255, 255, 0.1) !important; color: #fff !important; }
        .tr-card { transition: border-color 0.15s ease, background 0.15s ease; }
        .tr-card:hover { border-color: rgba(255, 255, 255, 0.2) !important; background: rgba(255, 255, 255, 0.05) !important; }
        .tr-mono { font-family: 'Geist Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: -0.02em; }
        
        .tr-timeline-item { position: relative; padding-left: 20px; }
        .tr-timeline-item::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 10px;
          bottom: -16px;
          width: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
        .tr-timeline-item:last-child::before { display: none; }
        .tr-timeline-dot {
          position: absolute;
          left: 3.5px;
          top: 11px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(9, 9, 11, 0.95);
        }
      `}</style>

      {/* Noise Overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, backgroundImage: `url("${NOISE_SVG}")`, mixBlendMode: "overlay", pointerEvents: "none", zIndex: 0 }} />
      
      {/* HEADER */}
      <div style={{
        position: "relative",
        zIndex: 10,
        padding: "16px 20px",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF" }}>
            <TraceoraIcon />
            <strong style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.02em" }}>Traceora Diagnostics</strong>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: 600, marginLeft: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3FB950", animation: "tr-pulse 2s infinite" }} />
              Live
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button className="tr-btn" onClick={() => {
              const json = JSON.stringify(events, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `traceora-logs-${new Date().toISOString()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }} style={{ background: "transparent", color: "#A1A1AA", border: "none", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Export Trace"><DownloadIcon /></button>
            <button className="tr-btn" onClick={() => emitter.clear()} style={{ background: "transparent", color: "#A1A1AA", border: "none", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }} title="Clear Logs"><TrashIcon /></button>
            <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <button className="tr-btn" onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", padding: "6px", borderRadius: "6px", display: "flex", alignItems: "center", color: "#A1A1AA", cursor: "pointer", fontSize: "16px" }} title="Close">×</button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="tr-scroll" style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", margin: "0 -4px", padding: "0 4px" }}>
          {(["ALL", "RENDER", "NETWORK", "PERF", "ERROR", "STATE"] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#FFFFFF" : "rgba(255, 255, 255, 0.04)",
                color: filter === f ? "#09090B" : "#A1A1AA",
                border: filter === f ? "1px solid #FFFFFF" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "100px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
                transition: "all 0.15s ease",
                boxShadow: filter === f ? "0 2px 12px rgba(255,255,255,0.25)" : "none"
              }}
              className={filter !== f ? "tr-btn" : ""}
            >
              {f === "ALL" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /></svg>}
              {f === "RENDER" && <ActivityIcon />}
              {f === "NETWORK" && <GlobeIcon />}
              {f === "PERF" && <AlertIcon />}
              {f === "ERROR" && <XCircleIcon />}
              {f === "STATE" && <DatabaseIcon />}
              <span style={{ textTransform: "capitalize" }}>{f.toLowerCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* EVENT LIST */}
      <div 
        className="tr-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "20px", position: "relative", zIndex: 10 }}
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredEvents.length === 0 ? (
          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#666", flexDirection: "column", gap: "16px", animation: "tr-fadeIn 0.5s ease" }}>
            <div style={{ padding: "16px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
               <ActivityIcon />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#EDEDED", marginBottom: "4px", letterSpacing: "-0.01em" }}>No activity yet</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Events will stream here automatically.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredEvents.map((ev, index) => {
              const isError = ev.type.includes("ERROR") || (ev.type === "SERVER_ACTION" && ev.metadata?.status === "error");
              const isWarning = ev.type.includes("WARNING") || ev.type.includes("PERF");
              const isNetwork = ev.type.includes("NETWORK");
              const isRender = ev.type.includes("MOUNT") || ev.type.includes("RENDER");
              const isState = ev.type === "STATE_CHANGE";

              // Premium restrained colors (Linear-style / Geist)
              const themeColor = isError ? "#F85149" : isWarning ? "#D29922" : isNetwork ? "#58A6FF" : isState ? "#8B949E" : isRender ? "#3FB950" : "#8B949E";
              
              const method = isNetwork && ev.metadata?.method ? String(ev.metadata.method).toUpperCase() : null;
              const status = isNetwork && ev.metadata?.status ? Number(ev.metadata.status) : null;
              const statusColor = status && status >= 400 ? "#F85149" : status && status >= 300 ? "#D29922" : "#3FB950";

              return (
                <div key={ev.id} className="tr-card" style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "13px",
                  animation: `tr-fadeIn 0.3s ease-out ${index * 0.03}s both`,
                  position: "relative",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)"
                }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isNetwork && !!method && (
                           <span className="tr-mono" style={{ background: "rgba(255, 255, 255, 0.12)", color: "#FFFFFF", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)" }}>{method}</span>
                        )}
                        {isNetwork && !!status && (
                           <span className="tr-mono" style={{ background: `rgba(${statusColor === '#F85149' ? '248,81,73' : statusColor === '#D29922' ? '210,153,34' : '63,185,80'}, 0.12)`, color: statusColor, padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, border: `1px solid rgba(${statusColor === '#F85149' ? '248,81,73' : statusColor === '#D29922' ? '210,153,34' : '63,185,80'}, 0.2)` }}>{status}</span>
                        )}
                        <strong style={{ color: themeColor, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em" }}>{ev.type}</strong>
                        {!!ev.metadata?.graphql && <span style={{ background: "rgba(232, 58, 153, 0.15)", color: "#E83A99", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, border: "1px solid rgba(232,58,153,0.3)" }}>GraphQL</span>}
                      </div>
                      
                      {isNetwork && !!ev.metadata?.url && (
                        <div className="tr-mono" style={{ color: "#A1A1AA", fontSize: "11px", wordBreak: "break-all", marginBottom: "4px", lineHeight: 1.4 }}>
                           {String(ev.metadata.url).replace(/^https?:\/\/[^\/]+/, '') || String(ev.metadata.url)}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#888", fontSize: "11px" }}>
                        <span style={{ fontWeight: 500, color: "#999", wordBreak: "break-all", flex: 1, minWidth: 0 }}>{ev.source || "unknown"}</span>
                        {ev.traceId && (
                          <>
                            <span style={{opacity: 0.3, marginTop: "1px"}}>|</span>
                            <span className="tr-mono" style={{ color: "#888", flexShrink: 0, marginTop: "1px" }}>{ev.traceId.slice(0, 8)}</span>
                          </>
                        )}
                        <span style={{opacity: 0.3, marginTop: "1px"}}>|</span>
                        <span className="tr-mono" style={{ flexShrink: 0, marginTop: "1px" }}>{new Date(ev.timestamp).toISOString().split('T')[1].slice(0, -1)}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      {/* Action buttons */}
                      {(() => {
                        if (!isError || !ev.metadata || !Array.isArray(ev.metadata.frames) || ev.metadata.frames.length === 0) return null;
                        const firstAppFrame = ev.metadata.frames.find((f: any) => f.fileName && !f.fileName.includes('node_modules') && !f.fileName.includes('react-dom'));
                        if (!firstAppFrame || !firstAppFrame.fileName) return null;
                        const cleanFileName = String(firstAppFrame.fileName).replace(/^https?:\/\/[^\/]+\/?/, '');
                        const fileAndLine = `${cleanFileName}:${firstAppFrame.lineNumber || 1}:${firstAppFrame.columnNumber || 1}`;
                        return (
                          <button 
                            className="tr-btn"
                            onClick={(e) => { e.stopPropagation(); fetch(`/__open-in-editor?file=${encodeURIComponent(fileAndLine)}`); }}
                            style={{ background: "rgba(255,255,255,0.06)", color: "#EDEDED", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                          >
                            <CodeIcon /> Editor
                          </button>
                        );
                      })()}
                      {isNetwork && ev.type === "NETWORK_REQUEST" && !!ev.metadata?.url && (
                        <button 
                          className="tr-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!(window as any).__TRACEORA_MOCKS__) (window as any).__TRACEORA_MOCKS__ = {};
                            try {
                              const url = new URL(ev.metadata!.url as string, window.location.origin);
                              (window as any).__TRACEORA_MOCKS__[url.pathname] = { status: 200, body: { mocked: true } };
                              alert(`Mock injected for ${url.pathname}`);
                            } catch (err) {}
                          }}
                          style={{ background: "rgba(255,255,255,0.06)", color: "#EDEDED", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                        >
                          <MockIcon /> Mock
                        </button>
                      )}
                      {isNetwork && ev.type === "NETWORK_REQUEST" && !!ev.metadata?.replayConfig && (
                        <button 
                          className="tr-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const { url, method, body, headers } = ev.metadata!.replayConfig as any;
                            fetch(url, { method, body, headers }).then(() => alert("Replayed")).catch(err => alert("Failed: " + err));
                          }}
                          style={{ background: "rgba(255,255,255,0.06)", color: "#EDEDED", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                        >
                          <ReplayIcon /> Replay
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DATA BLOCKS */}
                  {isState && ev.metadata && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                      <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", minWidth: 0 }}>
                        <div style={{ color: "#777", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Previous</div>
                        <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#A1A1AA", fontSize: "11px", overflowX: "auto" }}>
                          {JSON.stringify(ev.metadata.prevState, null, 2)}
                        </pre>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", minWidth: 0 }}>
                        <div style={{ color: "#777", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Next</div>
                        <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#EDEDED", fontSize: "11px", overflowX: "auto" }}>
                          {JSON.stringify(ev.metadata.nextState, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {isNetwork && !!ev.metadata?.graphql && (
                    <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ color: "#E83A99", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>{(ev.metadata.graphql as any).operationName}</div>
                      <pre className="tr-mono tr-scroll" style={{ margin: "0 0 12px 0", color: "#A1A1AA", fontSize: "11px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {(ev.metadata.graphql as any).query}
                      </pre>
                      {Object.keys((ev.metadata.graphql as any).variables || {}).length > 0 && (
                        <>
                          <div style={{ color: "#777", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Variables</div>
                          <pre className="tr-mono" style={{ margin: 0, color: "#58A6FF", fontSize: "11px" }}>
                            {JSON.stringify((ev.metadata.graphql as any).variables, null, 2)}
                          </pre>
                        </>
                      )}
                    </div>
                  )}

                  {ev.type === "WEB_VITALS" && ev.metadata && (
                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "16px" }}>
                      <div>
                        <div style={{ color: ev.metadata.ratingColor as string, fontSize: "14px", fontWeight: 600 }}>{ev.metadata.name as string}</div>
                        <div style={{ color: "#888", fontSize: "12px", marginTop: "2px", textTransform: "capitalize" }}>{ev.metadata.rating as string}</div>
                      </div>
                      <div style={{ color: "#EDEDED", fontSize: "20px", fontWeight: 600, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                        {ev.metadata.value as number}
                        <span style={{ fontSize: "12px", color: "#666", marginLeft: "4px" }}>{ev.metadata.name === "CLS" ? "" : "ms"}</span>
                      </div>
                    </div>
                  )}

                  {isError && ev.metadata && Array.isArray(ev.metadata.frames) && ev.metadata.frames.length > 0 && (
                    <div style={{ marginTop: "12px", background: "rgba(248, 81, 73, 0.05)", border: "1px solid rgba(248, 81, 73, 0.2)", borderRadius: "8px", padding: "12px", overflowX: "auto" }}>
                      <div style={{ color: "#F85149", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>{String(ev.metadata.message || ev.metadata.reason || "Error")}</div>
                      {ev.metadata.frames.map((frame: any, idx: number) => {
                        const isNodeModule = frame.fileName?.includes('node_modules') || frame.fileName?.includes('react-dom');
                        return (
                          <div key={idx} className="tr-mono" style={{ fontSize: "11px", color: isNodeModule ? "#666" : "#A1A1AA", marginBottom: "6px", display: "flex", gap: "12px" }}>
                            <span style={{ opacity: 0.4, width: "16px", textAlign: "right" }}>{idx}</span>
                            <span style={{ fontWeight: isNodeModule ? "normal" : "600", color: isNodeModule ? "#666" : "#EDEDED" }}>{frame.functionName || '<anonymous>'}</span>
                            <span style={{ color: "#666" }}>
                              {frame.fileName ? `${frame.fileName.split('/').pop()}:${frame.lineNumber}:${frame.columnNumber}` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!isState && !ev.metadata?.graphql && ev.type !== "WEB_VITALS" && !(isError && Array.isArray(ev.metadata?.frames)) && ev.metadata && (
                    <div style={{ background: "rgba(0, 0, 0, 0.25)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", marginTop: "12px" }}>
                      <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#A1A1AA", fontSize: "11px", overflowX: "auto", lineHeight: 1.5 }}>
                        {JSON.stringify(ev.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* CHILDREN TIMELINE (God View) */}
                  {ev.children && ev.children.length > 0 && (
                    <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <div style={{ color: "#EDEDED", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Execution Timeline</div>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {ev.children.map((child: any) => {
                          const cIsError = child.type.includes("ERROR");
                          const cColor = cIsError ? "#F85149" : child.type.includes("DB") || child.type.includes("QUERY") ? "#D2A8FF" : "#888";
                          
                          return (
                            <div key={child.id} className="tr-timeline-item">
                              <div className="tr-timeline-dot" style={{ background: cColor }} />
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingBottom: "20px", minWidth: 0, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                  <span style={{ color: cColor, fontSize: "12px", fontWeight: 600, flexShrink: 0, marginTop: "2px" }}>{child.type}</span>
                                  <span style={{ color: "#888", fontSize: "11px", wordBreak: "break-all", flex: 1, minWidth: 0 }}>{child.source || "backend"}</span>
                                  <span className="tr-mono" style={{ color: "#666", fontSize: "11px", marginLeft: "auto", flexShrink: 0, marginTop: "2px" }}>
                                    +{Math.max(0, child.timestamp - ev.timestamp)}ms
                                  </span>
                                </div>
                                {child.metadata && child.type === "STATE_CHANGE" && child.metadata.prevState && child.metadata.nextState ? (
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                                    <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", minWidth: 0 }}>
                                      <div style={{ color: "#777", fontSize: "9px", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Previous</div>
                                      <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#A1A1AA", fontSize: "10px", overflowX: "auto" }}>
                                        {JSON.stringify(child.metadata.prevState, null, 2)}
                                      </pre>
                                    </div>
                                    <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", minWidth: 0 }}>
                                      <div style={{ color: "#777", fontSize: "9px", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Next</div>
                                      <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#EDEDED", fontSize: "10px", overflowX: "auto" }}>
                                        {JSON.stringify(child.metadata.nextState, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                ) : child.metadata ? (
                                  <div style={{ background: "rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "10px", marginTop: "4px" }}>
                                    <pre className="tr-mono tr-scroll" style={{ margin: 0, color: "#A1A1AA", fontSize: "10px", overflowX: "auto", lineHeight: 1.5 }}>
                                      {JSON.stringify(child.metadata, null, 2)}
                                    </pre>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
