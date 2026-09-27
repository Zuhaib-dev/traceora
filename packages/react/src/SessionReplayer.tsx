import React, { useEffect, useRef } from "react";

export const SessionReplayer: React.FC<{ events: any[] }> = ({ events }) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerRef.current && events.length > 1) {
      const target = playerRef.current;
      target.innerHTML = "";
      
      try {
        import("rrweb-player").then(({ default: rrwebPlayer }) => {
          new rrwebPlayer({
          target,
          props: {
            events,
            width: 700,
            height: 400,
            autoPlay: true,
          },
        });
      });
      } catch (err) {
        console.error("Failed to initialize rrweb player", err);
      }
    }
  }, [events]);

  if (events.length < 2) {
    return (
      <div style={{ 
        padding: "32px", 
        color: "#a1a1aa", 
        fontSize: "13px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px dashed rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginTop: "16px"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "#3b82f6",
          animation: "traceora-spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes traceora-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 600, marginBottom: "4px" }}>Buffering Session...</span>
          <span>Gathering enough frames for replay ({events.length} frames captured)</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: "16px",
      background: "rgba(20, 20, 25, 0.95)",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css" />
      
      <div style={{ 
        padding: "12px 16px", 
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "linear-gradient(to right, rgba(255,255,255,0.02), transparent)"
      }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", letterSpacing: "0.5px" }}>LIVE REPLAY</span>
      </div>

      <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#000" }}>
        <div 
          ref={playerRef} 
          style={{ 
            borderRadius: "6px", 
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.1)"
          }} 
        />
      </div>
    </div>
  );
};
