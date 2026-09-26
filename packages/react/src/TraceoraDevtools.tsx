import React, { useEffect, useState, useMemo } from 'react';
import { TraceEvent } from '@traceora/core';
import { useTraceora } from './TraceoraProvider';
import * as LucideIcons from 'lucide-react';

const Activity = LucideIcons.Activity as any;
const ChevronDown = LucideIcons.ChevronDown as any;
const CircleAlert = LucideIcons.CircleAlert as any;
const Clock3 = LucideIcons.Clock3 as any;
const Database = LucideIcons.Database as any;
const Globe2 = LucideIcons.Globe2 as any;
const Layers3 = LucideIcons.Layers3 as any;
const Network = LucideIcons.Network as any;
const Server = LucideIcons.Server as any;
const Trash2 = LucideIcons.Trash2 as any;
const X = LucideIcons.X as any;

const filters = ['All', 'Renders', 'Network', 'Database', 'Errors'] as const;

function LogoMark() {
  return (
    <div className="traceora-mark" aria-hidden="true">
      <svg viewBox="0 0 34 38" fill="none">
        <path d="M17 1.8 31.2 10v18L17 36.2 2.8 28V10L17 1.8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m11.2 15.1 5.8-3.35 5.8 3.35v7.8l-5.8 3.35-5.8-3.35v-7.8Z" fill="currentColor" opacity=".23" />
        <path d="m17 11.8 5.8 3.3-5.8 3.4-5.8-3.4 5.8-3.3Zm0 6.7v7.75" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function SyntaxJson({ detail }: { detail: string }) {
  const tokens = useMemo(() => detail.split(/("[^"]+"|\b\d+(?:\.\d+)?\b|\b(?:true|false|null)\b)/g), [detail]);
  return (
    <pre className="traceora-json" aria-label="Event metadata">
      {tokens.map((token, index) => {
        const isString = token.startsWith('"');
        const isNumber = /^\d/.test(token);
        const isBoolean = /^(true|false|null)$/.test(token);
        return (
          <span 
            key={`${token}-${index}`} 
            className={isString ? 'json-string' : isNumber ? 'json-number' : isBoolean ? 'json-boolean' : 'json-punctuation'}
          >
            {token}
          </span>
        );
      })}
    </pre>
  );
}

export const TraceoraDevtools: React.FC = () => {
  const emitter = useTraceora();
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      const allEvents = emitter['store'] ? emitter['store'].getAll() : [];
      setEvents([...allEvents]);
    }, 100);
    return () => clearInterval(interval);
  }, [emitter]);

  const filteredEvents = useMemo(() => {
    if (cleared) return [];
    const reversed = events.slice().reverse();
    if (filter === 'All') return reversed;
    if (filter === 'Renders') return reversed.filter(e => e.type.includes('MOUNT') || e.type.includes('RENDER') || e.type.includes('UPDATE'));
    if (filter === 'Network') return reversed.filter(e => e.type.includes('NETWORK') || e.type.includes('FETCH'));
    if (filter === 'Database') return reversed.filter(e => e.type.includes('QUERY') || e.type.includes('DB'));
    if (filter === 'Errors') return reversed.filter(e => e.type.includes('ERROR') || e.type.includes('WARN'));
    return reversed;
  }, [events, filter, cleared]);

  if (!visible) {
    return (
      <button className="traceora-reopen" onClick={() => setVisible(true)} aria-label="Open Traceora">
        <LogoMark />
        <style>{`
          .traceora-reopen {
            position: fixed;
            bottom: 24px;
            left: 24px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #1b201f, #151918);
            border: 1px solid #343c39;
            border-radius: 50%;
            cursor: pointer;
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
          }
          .traceora-reopen:hover {
            transform: scale(1.1) translateY(-2px);
            border-color: #59685e;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          }
          .traceora-reopen .traceora-mark {
            width: 28px;
            height: 28px;
          }
        `}</style>
      </button>
    );
  }

  return (
    <section className="traceora-panel-container" aria-label="Traceora React DevTools">
      <style>{`
        /* CSS Injected for Traceora DevTools */
        .traceora-panel-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999999;
          font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          color: #d7dcda;
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        .traceora-panel { 
          width: min(1110px, 95vw); 
          height: min(782px, calc(100vh - 56px)); 
          min-height: 540px; 
          display: flex; 
          flex-direction: column; 
          position: relative; 
          overflow: hidden; 
          border: 1px solid #3a413f; 
          border-radius: 8px; 
          background: rgb(10 15 18 / 0.95); 
          backdrop-filter: blur(28px) saturate(125%); 
          -webkit-backdrop-filter: blur(28px) saturate(125%);
          box-shadow: 0 24px 60px #0009, 0 1px 0 #ffffff0b inset; 
        }
        .traceora-panel * {
          box-sizing: border-box;
        }
        .traceora-header { min-height: 68px; padding: 0 20px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; border-bottom: 1px solid #303735; background: #1a1e1d; }
        .traceora-brand { display: flex; align-items: center; gap: 11px; }
        .traceora-mark { width: 23px; height: 25px; display: grid; place-items: center; position: relative; clip-path: polygon(50% 0, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%); background: #7aca91; }
        .traceora-mark:before { content: ''; position: absolute; inset: 2px; clip-path: inherit; background: #1a1e1d; }
        .traceora-mark svg { width: 14px; height: 14px; position: relative; color: #a8e4b2; }
        .traceora-name { color: #edf1ee; font-size: 14px; font-weight: 700; letter-spacing: -.02em; line-height: 1; }
        .traceora-subtitle { margin-top: 5px; color: #78827e; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .08em; display: flex; align-items: center; }
        .traceora-live-dot { display: inline-block; width: 5px; height: 5px; margin-right: 5px; border-radius: 50%; background: #83cc92; }
        
        .traceora-filters { display: flex; gap: 1px; padding: 3px; border: 1px solid #343b38; border-radius: 4px; background: #111514; }
        .traceora-filter { height: 28px; padding: 0 13px; border: 0; border-radius: 2px; color: #89918e; background: transparent; cursor: pointer; font-size: 10px; font-weight: 600; transition: background .15s, color .15s; display: flex; align-items: center; }
        .traceora-filter:hover { color: #d7ded9; background: #242a28; }
        .traceora-filter.active { color: #dff2e0; background: #365b42; box-shadow: 0 0 0 1px #5a8960 inset; }
        .traceora-count { display: inline-grid; place-items: center; min-width: 16px; height: 15px; margin-left: 5px; border-radius: 2px; color: #b8e5bc; background: #466d4d; font-family: 'IBM Plex Mono', monospace; font-size: 9px; }
        
        .traceora-actions { display: flex; justify-content: flex-end; align-items: center; gap: 6px; }
        .traceora-action { display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; color: #89928e; background: transparent; cursor: pointer; transition: .15s; width: 28px; height: 28px; border-radius: 3px; }
        .traceora-action svg { width: 14px; height: 14px; }
        .traceora-action:hover { color: #e4eae6; border-color: #46504b; background: #2a302e; }
        .traceora-action-text { gap: 6px; padding: 7px 8px; width: auto; font-size: 10px; font-weight: 600; }
        .traceora-action-text:hover { color: #e3a2a0; background: #3a2728; border-color: transparent; }
        .traceora-divider { width: 1px; height: 12px; margin: 0 3px; background: #343b38; }
        
        .traceora-toolbar { min-height: 40px; padding: 0 21px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #292f2d; color: #818b87; background: #171b1a; font: 10px 'IBM Plex Mono', monospace; }
        .traceora-stream { display: flex; align-items: center; gap: 8px; }
        .traceora-stream-dot { width: 6px; height: 6px; border-radius: 50%; background: #83cc92; box-shadow: 0 0 0 3px #83cc921c; animation: live-pulse 1.8s ease-out infinite; }
        .traceora-event-count { display: flex; align-items: center; gap: 7px; color: #7e8984; }
        .traceora-event-count svg { width: 12px; height: 12px; }
        
        .traceora-timeline { flex: 1; overflow-y: auto; padding: 17px 21px 10px; scrollbar-width: thin; scrollbar-color: #4a5b50 transparent; }
        .traceora-timeline::-webkit-scrollbar { width: 8px; }
        .traceora-timeline::-webkit-scrollbar-track { background: transparent; }
        .traceora-timeline::-webkit-scrollbar-thumb { background: #4a5b50; border-radius: 4px; }
        
        .traceora-event { display: grid; grid-template-columns: 34px minmax(0, 1fr); animation: event-in .25s ease both; animation-delay: var(--event-delay); position: relative; margin-bottom: 12px; }
        @keyframes event-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        
        .traceora-event-rail { display: flex; position: relative; flex-direction: column; align-items: center; }
        .traceora-event-icon { width: 25px; height: 25px; display: grid; place-items: center; position: relative; z-index: 1; border: 1px solid #668d69; border-radius: 4px; color: #9bd9a1; background: #203425; }
        .traceora-event-icon svg { width: 13px; height: 13px; }
        .traceora-event.network .traceora-event-icon { color: #9fc0cc; border-color: #587887; background: #1e2d33; }
        .traceora-event.database .traceora-event-icon { color: #c3b0d3; border-color: #786789; background: #2b2634; }
        .traceora-event.error .traceora-event-icon { color: #dfa19d; border-color: #895c5c; background: #342426; }
        
        .traceora-rail-line { width: 1px; flex: 1; min-height: 22px; background: linear-gradient(180deg, #20c997, #315a50 55%, transparent); box-shadow: 0 0 7px #20c99755; margin-top: 4px; }
        
        .traceora-event-body { min-width: 0; margin: 0 0 8px 10px; border: 1px solid #343c39; border-radius: 4px; background: #1b201f; transition: border-color .15s, background .15s; }
        .traceora-event-body:hover { border-color: #59685e; background: #202624; }
        .traceora-event.warning .traceora-event-body { border-color: #8a651f; box-shadow: inset 2px 0 #faad14, 0 0 22px #faad1412; }
        .traceora-event.error .traceora-event-body { border-color: #87383c; box-shadow: inset 2px 0 #ff4d4f, 0 0 22px #ff4d4f12; }
        
        .traceora-event-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 14px; width: 100%; border: none; background: transparent; cursor: pointer; text-align: left; }
        .traceora-event-title { display: flex; align-items: center; min-width: 0; gap: 8px; }
        .traceora-type { padding: 3px 5px; border-radius: 2px; color: #a8d9ac; background: #2d5035; font: 500 8px 'IBM Plex Mono', monospace; font-style: normal; text-transform: uppercase; }
        .traceora-event.network .traceora-type { color: #aed0d8; background: #29434b; }
        .traceora-event.database .traceora-type { color: #d0c0dd; background: #42374e; }
        .traceora-event.error .traceora-type { color: #e5b0ab; background: #523334; }
        
        .traceora-event-title strong { overflow: hidden; color: #e0e6e2; font: 500 11px 'IBM Plex Mono', monospace; letter-spacing: .025em; text-overflow: ellipsis; white-space: nowrap; }
        .traceora-event-time { display: flex; align-items: center; gap: 8px; color: #76817c; font: 10px 'IBM Plex Mono', monospace; }
        .traceora-event-time svg { width: 12px; height: 12px; transition: transform 0.2s ease; }
        .traceora-event-time svg.rotated { transform: rotate(180deg); }
        
        .waterfall { display: inline-flex; align-items: center; gap: 8px; min-width: 150px; justify-content: flex-end; }
        .waterfall-track { width: 86px; height: 5px; overflow: hidden; border-radius: 99px; background: #293532; box-shadow: inset 0 1px #ffffff0a; }
        .waterfall-fill { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #1b8e70, #20c997); box-shadow: 0 0 8px #20c99788; }
        .traceora-event.network .waterfall-fill { background: linear-gradient(90deg, #3d8191, #7fc9c4); box-shadow: 0 0 8px #7fc9c477; }
        .traceora-event.database .waterfall-fill { background: linear-gradient(90deg, #775a9c, #b493d1); box-shadow: 0 0 8px #b493d177; }
        .traceora-event.error .waterfall-fill { background: linear-gradient(90deg, #9f3d44, #ff4d4f); box-shadow: 0 0 8px #ff4d4f77; }
        .waterfall b { width: 38px; color: #788681; text-align: right; font: 500 9px 'IBM Plex Mono', monospace; }
        
        .traceora-json-wrap { margin: 0 14px 10px; border-top: 1px solid #29322f; padding-top: 10px; }
        .traceora-json { margin: 0; padding: 9px 11px; border: 1px solid #29322f; border-left-color: #20c99766; border-radius: 3px; color: #9ea9a4; background: #08100eaa; font: 10px/1.65 'IBM Plex Mono', monospace; overflow-x: auto; }
        .json-string { color: #e7b76b; }
        .json-number { color: #b993e8; }
        .json-boolean { color: #b993e8; }
        .json-punctuation { color: #63d6e5; }
        
        .traceora-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: #77827d; }
        .traceora-empty svg { width: 28px; height: 28px; margin-bottom: 5px; color: #83cc92; }
        .traceora-empty strong { color: #d5ddd8; font-size: 13px; }
        .traceora-empty span { font-size: 11px; }
        .traceora-empty button { margin-top: 8px; padding: 7px 11px; border: 1px solid #608866; border-radius: 3px; color: #b8ddb9; background: #233b28; cursor: pointer; font-size: 10px; }
        
        .traceora-footer { min-height: 36px; padding: 0 21px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #292f2d; color: #65716c; font: 9px 'IBM Plex Mono', monospace; }
        .traceora-footer span { display: flex; align-items: center; gap: 6px; }
        .traceora-heart { color: #20c997; font-size: 11px; }
        
        @keyframes live-pulse { 0%, 100% { box-shadow: 0 0 0 3px #20c99720; } 50% { box-shadow: 0 0 0 6px #20c99700; } }
      `}</style>

      <div className="traceora-panel">
        <header className="traceora-header">
          <div className="traceora-brand">
            <LogoMark />
            <div>
              <div className="traceora-name">Traceora</div>
              <div className="traceora-subtitle"><span className="traceora-live-dot" />DEVTOOLS</div>
            </div>
          </div>
          <nav className="traceora-filters" aria-label="Filter events">
            {filters.map((item) => (
              <button 
                key={item} 
                className={filter === item ? 'traceora-filter active' : 'traceora-filter'} 
                onClick={() => setFilter(item)}
              >
                {item}
                {item === 'All' && <span className="traceora-count">{events.length}</span>}
              </button>
            ))}
          </nav>
          <div className="traceora-actions">
            <button className="traceora-action traceora-action-text" onClick={() => {
              // @ts-ignore
              if (emitter['store']) emitter['store'].events = [];
              setCleared(true);
            }} aria-label="Clear events" title="Clear events">
              <Trash2 /> Clear
            </button>
            <span className="traceora-divider" />
            <button className="traceora-action close" onClick={() => setVisible(false)} aria-label="Close Traceora" title="Close">
              <X />
            </button>
          </div>
        </header>

        <div className="traceora-toolbar">
          <div className="traceora-stream">
            <span className="traceora-stream-dot" /> Listening for events
          </div>
          <div className="traceora-event-count">
            {cleared ? 0 : filteredEvents.length} events <Clock3 />
          </div>
        </div>

        <div className="traceora-timeline">
          {cleared || filteredEvents.length === 0 ? (
            <div className="traceora-empty">
              <Server />
              <strong>{cleared ? 'Stream cleared' : 'Awaiting signals...'}</strong>
              <span>New runtime events will appear here.</span>
              {cleared && <button onClick={() => setCleared(false)}>Listening for new events</button>}
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const isError = event.type.includes('ERROR');
              const isWarning = event.type.includes('WARN') || event.type.includes('PERF');
              const isNetwork = event.type.includes('NETWORK') || event.type.includes('FETCH');
              const isDatabase = event.type.includes('QUERY') || event.type.includes('DB') || event.type.includes('DATABASE');
              
              const accent = isError ? 'error' : isWarning ? 'warning' : isNetwork ? 'network' : isDatabase ? 'database' : 'render';
              const Icon = isError ? CircleAlert : isWarning ? CircleAlert : isNetwork ? Globe2 : isDatabase ? Database : Activity;
              
              // Calculate a fake duration for the waterfall if not present
              const durationStr = typeof event.metadata?.duration === 'number' 
                ? `${event.metadata.duration}ms` 
                : typeof event.metadata?.time === 'number'
                ? `${event.metadata.time}ms`
                : isNetwork ? '84ms' : isDatabase ? '24ms' : '4ms';
              
              const durationMs = parseInt(durationStr);
              const fillWidth = Math.min(100, Math.max(5, (durationMs / 200) * 100)); // Max out at 200ms

              return (
                <article 
                  className={`traceora-event ${accent}`} 
                  key={event.id} 
                  style={{ '--event-delay': `${Math.min(index * 25, 500)}ms` } as React.CSSProperties}
                >
                  <div className="traceora-event-rail">
                    <div className="traceora-event-icon"><Icon /></div>
                    {index !== filteredEvents.length - 1 && <div className="traceora-rail-line" />}
                  </div>
                  <div className="traceora-event-body">
                    <button 
                      className="traceora-event-head" 
                      onClick={() => setExpanded(expanded === event.id ? null : event.id)} 
                      aria-expanded={expanded === event.id}
                    >
                      <span className="traceora-event-title">
                        <span className="traceora-type">{isError ? 'ERROR' : isWarning ? 'WARN' : isNetwork ? 'NETWORK' : isDatabase ? 'DATABASE' : 'RENDER'}</span>
                        <strong>{event.type}</strong>
                      </span>
                      <span className="traceora-event-time">
                        <span className="waterfall">
                          <span className="waterfall-track">
                            <span className="waterfall-fill" style={{ width: `${fillWidth}%` }} />
                          </span>
                          <b>{durationStr}</b>
                        </span>
                        {new Date(event.timestamp).toISOString().split('T')[1].slice(0, -1)}
                        <ChevronDown className={expanded === event.id ? 'rotated' : ''} />
                      </span>
                    </button>
                    {expanded === event.id && (
                      <div className="traceora-json-wrap">
                        <SyntaxJson detail={JSON.stringify({
                          id: event.id,
                          traceId: event.traceId,
                          source: event.source,
                          ...event.metadata
                        }, null, 2)} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <footer className="traceora-footer">
          <span>LOCAL SESSION • PORT 3000</span>
          <span>Crafted with <span className="traceora-heart">♥</span> by Zuhaib Rashid</span>
        </footer>
      </div>
    </section>
  );
};
