'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Copy,
  GitBranch,
  Hexagon,
  Menu,
  Play,
  Radio,
  Search,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

const install = `npm install @traceora/core @traceora/react @traceora/vite-plugin`
const vite = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { traceoraPlugin } from '@traceora/vite-plugin'

export default defineConfig({
  plugins: [traceoraPlugin(), react()],
})`

function Logo() {
  return <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.03em]"><span className="grid size-7 place-items-center rounded-[8px] bg-primary text-primary-foreground"><Hexagon className="size-4 fill-current" /></span><span>traceora<span className="text-primary">.</span></span></div>
}

function CodeWindow({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return <div className="overflow-hidden rounded-xl border border-border/80 bg-[#0b1110] shadow-2xl shadow-primary/5">
    <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-2"><span className="flex gap-1.5"><i className="size-2 rounded-full bg-[#ff5f57]" /><i className="size-2 rounded-full bg-[#febc2e]" /><i className="size-2 rounded-full bg-[#28c840]" /></span><span className="ml-2 font-mono">{label}</span></div>
      <button aria-label="Copy code" onClick={copy} className="flex items-center gap-1.5 transition-colors hover:text-foreground">{copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}{copied ? 'copied' : 'copy'}</button>
    </div>
    <pre className="overflow-x-auto p-5 text-[12px] leading-6 text-[#b6c8c2]"><code>{code}</code></pre>
  </div>
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <Logo />
      <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-5 right-5 top-16 flex-col gap-5 rounded-xl border border-border bg-card p-5 text-sm md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0`}>
        <a href="#how" className="text-muted-foreground transition-colors hover:text-foreground">How it works</a><a href="/features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a><a href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">Docs</a><a href="#footer" className="text-muted-foreground transition-colors hover:text-foreground">About</a>
      </nav>
      <div className="flex items-center gap-3"><a href="https://github.com/zuhaib-dev/traceora" target="_blank" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"><GitBranch className="size-4" /></a><a href="/docs" className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary/5 sm:block">Read the docs <ArrowRight className="ml-1 inline size-3" /></a><button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
    </header>

    <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-32">
      <div className="ambient-orb" />
      <div className="max-w-4xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" />Runtime intelligence for React + Node</div><h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.94] tracking-[-0.065em] sm:text-7xl lg:text-[92px]">See the whole story<br /><span className="text-primary">behind every click.</span></h1><p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">Traceora turns scattered logs into one causally-linked timeline — from a React interaction to the exact database query that followed it.</p><div className="mt-10 flex flex-wrap items-center gap-3"><a href="#docs" className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]">Start tracing <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></a><a href="#how" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"><Play className="size-3 fill-current" /> See how it works</a></div></div>
      <div className="mt-20 grid gap-4 lg:mt-28 lg:grid-cols-[1fr_1.7fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-xl"><div><div className="mb-10 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live trace / 8f3a</span><span className="flex items-center gap-1.5 text-[10px] text-primary"><Radio className="size-3" /> recording</span></div><div className="space-y-5 font-mono text-xs"><div className="trace-line active"><span className="text-primary">01</span><span><b className="font-normal text-foreground">Button.Click</b><em className="ml-2 text-muted-foreground">Dashboard.tsx:42</em></span><span className="ml-auto text-muted-foreground">0ms</span></div><div className="trace-line"><span className="text-primary">02</span><span><b className="font-normal text-foreground">State.Change</b><em className="ml-2 text-muted-foreground">filters</em></span><span className="ml-auto text-muted-foreground">1ms</span></div><div className="trace-line"><span className="text-primary">03</span><span><b className="font-normal text-foreground">Fetch.Start</b><em className="ml-2 text-muted-foreground">/api/users</em></span><span className="ml-auto text-muted-foreground">3ms</span></div><div className="trace-line"><span className="text-primary">04</span><span><b className="font-normal text-foreground">DB.Query</b><em className="ml-2 text-muted-foreground">mysql</em></span><span className="ml-auto text-muted-foreground">24ms</span></div></div></div><div className="mt-12 border-t border-border pt-4 text-[11px] text-muted-foreground"><span className="text-foreground">TraceID</span> automatically carried across the stack <ArrowRight className="ml-1 inline size-3" /></div></div>
        <div className="relative flex min-h-77.5 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-[#0b1714] p-8"><div className="scanlines absolute inset-0 opacity-30" /><div className="relative w-full max-w-xl"><div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-primary/70"><span>causality map</span><span>4 events / 31ms</span></div><div className="relative flex items-center justify-between gap-2"><div className="node-card"><Circle className="size-3 fill-primary text-primary" /><span>React</span><small>click</small></div><div className="flow-arrow" /><div className="node-card"><Zap className="size-3 text-primary" /><span>Express</span><small>request</small></div><div className="flow-arrow" /><div className="node-card"><Sparkles className="size-3 text-primary" /><span>MySQL</span><small>query</small></div></div><div className="mt-10 flex justify-center"><div className="rounded border border-primary/25 bg-primary/8 px-4 py-2 font-mono text-[10px] text-primary">X-Traceora-Events → timeline</div></div></div></div>
      </div>
    </section>

    <section id="features" className="border-y border-border bg-card/35"><div className="mx-auto grid max-w-7xl divide-y divide-border px-5 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8"><div className="p-8 lg:p-12"><span className="font-mono text-xs text-primary">01 / zero config</span><h2 className="mt-8 text-2xl tracking-tight">Instrument nothing.<br />Understand everything.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">A Vite plugin compiles tracking directly into your components. No hooks, wrappers, or rituals.</p></div><div className="p-8 lg:p-12"><span className="font-mono text-xs text-primary">02 / causality</span><h2 className="mt-8 text-2xl tracking-tight">One click.<br />Every consequence.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Trace IDs follow the action across state, network, backend, and database boundaries.</p></div><div className="p-8 lg:p-12"><span className="font-mono text-xs text-primary">03 / in-app</span><h2 className="mt-8 text-2xl tracking-tight">Your devtools.<br />Inside your app.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">A floating, glassy timeline shows what happened without leaving the browser window.</p></div></div></section>

    <section id="how" className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"><div className="grid gap-14 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24"><div><div className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary"><span className="size-1.5 rounded-full bg-primary" /> Get started</div><h2 className="max-w-md text-4xl tracking-[-0.04em] sm:text-5xl">Three packages.<br />One clear picture.</h2><p className="mt-6 max-w-sm leading-7 text-muted-foreground">Add Traceora to the edges of your stack. It quietly connects the dots for you.</p><div className="mt-10 flex flex-col gap-2">{['React + Vite', 'Express backend', 'Explore your traces'].map((step, i) => <button key={step} onClick={() => setActiveStep(i)} className={`flex items-center gap-4 rounded-lg px-3 py-3 text-left text-sm transition-colors ${activeStep === i ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><span className={`grid size-7 place-items-center rounded-full border font-mono text-[10px] ${activeStep === i ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>0{i + 1}</span>{step}<ChevronDown className={`ml-auto size-4 transition-transform ${activeStep === i ? '-rotate-90 text-primary' : '-rotate-90'}`} /></button>)}</div></div><div id="docs" className="min-w-0">{activeStep === 0 ? <div className="flex flex-col gap-5"><CodeWindow label="terminal" code={install} /><CodeWindow label="vite.config.ts" code={vite} /></div> : activeStep === 1 ? <CodeWindow label="server.ts" code={`npm install @traceora/express

import { traceora, emitTraceEvent } from '@traceora/express'

app.use(traceora())

emitTraceEvent({
  type: 'STATE_CHANGE',
  source: 'MySQL',
  metadata: { query: 'SELECT * FROM users' }
})`} /> : <div className="rounded-xl border border-border bg-card p-8"><div className="flex items-center gap-3 text-primary"><Sparkles className="size-5" /><span className="font-mono text-xs">traceora.devtools</span></div><h3 className="mt-8 text-2xl">Your app, with context.</h3><p className="mt-3 max-w-md leading-7 text-muted-foreground">Every event is grouped by TraceID, so debugging stops being archaeology and starts being a straight line.</p><a href="/docs" className="mt-8 inline-flex items-center gap-2 text-sm text-primary">Read the full guide <ArrowRight className="size-4" /></a></div>}</div></div></section>

    <section className="mx-5 mb-24 overflow-hidden rounded-2xl border border-primary/20 bg-primary/8 lg:mx-auto lg:max-w-7xl"><div className="flex flex-col items-start justify-between gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Stop guessing</p><h2 className="mt-4 max-w-xl text-4xl tracking-[-0.04em] sm:text-5xl">Make every bug<br />explain itself.</h2></div><a href="#docs" className="group flex shrink-0 items-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]">Install Traceora <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a></div></section>

    <footer id="footer" className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><Logo /><p className="mt-3 text-xs">Zero-config full-stack runtime intelligence.</p></div><div className="flex items-center gap-5 text-xs"><span>Built by <a href="https://zuhaibrashid.com" target="_blank" className="text-foreground hover:text-primary">Zuhaib Rashid</a></span><a href="https://github.com/zuhaib-dev/traceora" target="_blank" aria-label="GitHub" className="hover:text-foreground"><GitBranch className="size-4" /></a><a href="https://x.com/xuhaib_x9" target="_blank" aria-label="X" className="hover:text-foreground"><X className="size-4" /></a><a href="https://www.linkedin.com/in/zuhaib-rashid-661345318/" target="_blank" className="hover:text-foreground">LinkedIn</a><a href="https://zuhaibrashid.com" target="_blank" className="hover:text-foreground">Portfolio</a></div></div></footer>
  </main>
}
