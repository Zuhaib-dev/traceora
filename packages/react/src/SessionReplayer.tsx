import React, { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";

export const SessionReplayer: React.FC<{ events: any[] }> = ({ events }) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerRef.current && events.length > 1) {
      playerRef.current.innerHTML = "";
      
      try {
        new rrwebPlayer({
          target: playerRef.current,
          props: {
            events,
            width: 700,
            height: 400,
            autoPlay: true,
          },
        });
      } catch (err) {
        console.error("Failed to initialize rrweb player", err);
      }
    }
  }, [events]);

  if (events.length < 2) {
    return <div style={{ padding: "12px", color: "#888", fontSize: "12px" }}>Gathering enough frames for replay... ({events.length} frames captured)</div>;
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css" />
      <div 
        ref={playerRef} 
        style={{ 
          background: "#fff", 
          borderRadius: "8px", 
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)"
        }} 
      />
    </div>
  );
};
