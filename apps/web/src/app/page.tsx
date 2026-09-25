import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-emerald-500/30">
      
      {/* GLOWING BACKGROUND ORB */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M160 100h-30l-20 60L70 40 50 100H40" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide">TRACEORA</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/zuhaib-dev/traceora" target="_blank" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
          <a href="#setup" className="text-muted-foreground hover:text-white transition-colors">Documentation</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-8 shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          v0.1.3 is now live on NPM
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Zero-Config <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Full-Stack Intelligence
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Watch a single button click in React trace perfectly to a database query in Express. 
          A beautifully unified timeline of your entire application's runtime.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_40px_rgba(5,150,105,0.4)]">
            <a href="#setup">Get Started in 2 Mins</a>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5">
            <a href="https://github.com/zuhaib-dev/traceora" target="_blank">View on GitHub</a>
          </Button>
        </div>
      </main>

      {/* DEMO / VALUE PROP */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-zinc-950 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">Traceora Floating DevTools</span>
            </div>
            <div className="p-8 text-sm font-mono text-zinc-300">
              <div className="flex items-center gap-4 mb-4 text-emerald-400 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/50">
                <span>[REACT]</span>
                <span className="text-white">onClick: Checkout Button</span>
              </div>
              <div className="flex items-center gap-4 mb-4 text-blue-400 bg-blue-950/30 p-3 rounded-lg border border-blue-900/50 ml-6">
                <span>[NETWORK]</span>
                <span className="text-white">POST /api/checkout</span>
                <span className="text-zinc-500 ml-auto">TraceID: xyz987</span>
              </div>
              <div className="flex items-center gap-4 mb-4 text-purple-400 bg-purple-950/30 p-3 rounded-lg border border-purple-900/50 ml-12">
                <span>[EXPRESS]</span>
                <span className="text-white">Stripe API Hit</span>
              </div>
              <div className="flex items-center gap-4 mb-4 text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50 ml-12">
                <span>[EXPRESS ERROR]</span>
                <span className="text-white">Insufficient Funds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SETUP GUIDE */}
      <section id="setup" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl font-bold mb-12 text-center">Install the Ecosystem</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* FRONTEND SETUP */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">1. Frontend (React + Vite)</h3>
            <p className="text-muted-foreground mb-6 text-sm">Automatically track renders, clicks, and fetch requests.</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto mb-6">
              <code className="text-sm text-zinc-300">npm install @traceora/react @traceora/vite-plugin @traceora/core</code>
            </div>
            
            <p className="text-xs font-semibold text-zinc-400 mb-2">vite.config.ts</p>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto mb-6">
              <pre className="text-xs text-zinc-300">
{`import { traceoraPlugin } from '@traceora/vite-plugin'

export default defineConfig({
  plugins: [traceoraPlugin(), react()],
})`}
              </pre>
            </div>
            
            <p className="text-xs font-semibold text-zinc-400 mb-2">main.tsx</p>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto">
              <pre className="text-xs text-zinc-300">
{`<TraceoraProvider>
  <App />
  <TraceoraDevtools />
</TraceoraProvider>`}
              </pre>
            </div>
          </div>

          {/* BACKEND SETUP */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">2. Backend (Express)</h3>
            <p className="text-muted-foreground mb-6 text-sm">Inject backend logs directly into your frontend timeline via headers.</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto mb-6">
              <code className="text-sm text-zinc-300">npm install @traceora/express</code>
            </div>
            
            <p className="text-xs font-semibold text-zinc-400 mb-2">server.ts</p>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto">
              <pre className="text-xs text-zinc-300">
{`import { traceora, emitTraceEvent } from '@traceora/express';
import cors from 'cors';

// MUST expose custom headers
app.use(cors({ 
  exposedHeaders: ["X-Traceora-Events"] 
}));

app.use(traceora());

app.get('/api', (req, res) => {
  emitTraceEvent({
    type: "STATE_CHANGE",
    source: "MySQL",
    metadata: { query: "SELECT * FROM users" }
  });
  res.json({ ok: true });
});`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 mt-12 text-center">
        <p className="text-zinc-500 text-sm">
          Built with 💚 by <a href="https://zuhaibrashid.com" className="text-emerald-500 hover:underline">Zuhaib Rashid</a>
        </p>
      </footer>
    </div>
  );
}
