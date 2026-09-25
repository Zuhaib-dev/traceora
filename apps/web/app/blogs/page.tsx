'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Hexagon,
  Menu,
  Search,
  X,
} from 'lucide-react'

const posts = [
  {
    category: 'Engineering',
    title: 'The hidden cost of logs without a storyline',
    excerpt: 'Why teams still lose hours to debugging even when their observability stack is full of data — and how causal traces change the workflow.',
    date: 'Sep 18, 2026',
    read: '8 min read',
    accent: 'from-emerald-500/20 via-teal-400/5 to-transparent',
    number: '01',
  },
  {
    category: 'Product',
    title: 'Introducing Traceora: runtime intelligence for modern stacks',
    excerpt: 'A closer look at the ideas behind a developer tool that connects the click in your UI to the query in your database.',
    date: 'Sep 04, 2026',
    read: '6 min read',
    accent: 'from-cyan-500/20 via-blue-400/5 to-transparent',
    number: '02',
  },
  {
    category: 'React',
    title: 'Tracing the state transition nobody thought to instrument',
    excerpt: 'A practical guide to understanding the small interactions that create big downstream effects in React applications.',
    date: 'Aug 27, 2026',
    read: '10 min read',
    accent: 'from-lime-400/20 via-emerald-400/5 to-transparent',
    number: '03',
  },
  {
    category: 'Systems',
    title: 'From request ID to a full-stack trace context',
    excerpt: 'How context propagation works across browser, API, queue, and persistence boundaries without turning your codebase into a science project.',
    date: 'Aug 11, 2026',
    read: '9 min read',
    accent: 'from-violet-500/20 via-fuchsia-400/5 to-transparent',
    number: '04',
  },
  {
    category: 'Field notes',
    title: 'What we learned watching a team debug in real time',
    excerpt: 'The patterns, false starts, and tiny moments of clarity that shaped the Traceora timeline.',
    date: 'Jul 29, 2026',
    read: '5 min read',
    accent: 'from-orange-400/20 via-amber-300/5 to-transparent',
    number: '05',
  },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.03em]">
      <span className="grid size-7 place-items-center rounded-[8px] bg-primary text-primary-foreground">
        <Hexagon className="size-4 fill-current" />
      </span>
      <span>traceora<span className="text-primary">.</span></span>
    </Link>
  )
}

export default function BlogsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All stories')

  const categories = ['All stories', 'Engineering', 'Product', 'React', 'Systems']
  const filteredPosts = useMemo(() => posts.filter((post) => {
    const matchesCategory = activeCategory === 'All stories' || post.category === activeCategory
    const matchesQuery = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [activeCategory, query])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-5 right-5 top-16 flex-col gap-5 rounded-xl border border-border bg-card p-5 text-sm md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0`}>
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="/#docs" className="text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
          <Link href="/blogs" className="text-foreground">Blogs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/#docs" className="hidden rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:block">Start tracing <ArrowUpRight className="ml-1 inline size-3" /></Link>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="absolute -right-40 top-0 size-[460px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <div className="mb-7 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary"><BookOpen className="size-3.5" /> The Traceora journal</div>
            <h1 className="max-w-3xl text-balance text-6xl font-medium leading-[0.92] tracking-[-0.07em] sm:text-8xl">Thoughts on <span className="text-primary">seeing clearly.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">Technical notes, field reports, and sharp opinions on building software that explains itself.</p>
          </div>
          <div className="border-l border-primary/30 pl-6 lg:mb-2"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Now publishing</p><p className="mt-3 text-2xl leading-tight tracking-tight">The tools behind calmer<br />engineering teams.</p><Link href="#stories" className="mt-6 inline-flex items-center gap-2 text-sm text-primary">Explore the archive <ChevronRight className="size-4" /></Link></div>
        </div>
      </section>

      <section id="stories" className="relative mx-auto max-w-7xl border-t border-border px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full border px-3.5 py-2 text-xs transition-colors ${activeCategory === category ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{category}</button>)}</div>
          <label className="flex items-center gap-2 border-b border-border py-2 text-sm text-muted-foreground focus-within:border-primary"><Search className="size-4" /><span className="sr-only">Search stories</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" className="w-40 bg-transparent outline-none placeholder:text-muted-foreground/60" /></label>
        </div>

        <div className="grid gap-5 pt-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => <article key={post.title} className={`group relative flex min-h-[370px] flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${post.accent} opacity-70`} />
            <div className="relative flex flex-1 flex-col justify-between p-6 sm:p-8">
              <div className="flex items-start justify-between"><span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{post.category}</span><span className="font-mono text-xs text-muted-foreground/60">{post.number}</span></div>
              <div><h2 className={`${index === 0 ? 'max-w-2xl text-3xl sm:text-4xl' : 'text-2xl'} text-balance leading-tight tracking-[-0.045em] transition-colors group-hover:text-primary`}>{post.title}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{post.excerpt}</p><div className="mt-7 flex items-center justify-between border-t border-border/80 pt-4 text-[11px] text-muted-foreground"><span>{post.date}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3" /> {post.read}</span></div></div>
            </div>
            <div className="absolute bottom-6 right-6 grid size-9 translate-y-2 place-items-center rounded-full border border-primary/30 bg-background/30 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4 text-primary" /></div>
          </article>)}
        </div>
        {filteredPosts.length === 0 && <div className="py-24 text-center"><p className="text-lg">No stories found.</p><button onClick={() => { setQuery(''); setActiveCategory('All stories') }} className="mt-3 text-sm text-primary">Clear filters</button></div>}
      </section>

      <section className="mx-5 my-16 overflow-hidden rounded-2xl border border-primary/20 bg-primary/8 lg:mx-auto lg:max-w-7xl"><div className="flex flex-col items-start justify-between gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Keep your signal</p><h2 className="mt-4 max-w-xl text-4xl tracking-[-0.05em] sm:text-5xl">Build with more<br />context. Less noise.</h2></div><Link href="/#docs" className="group flex shrink-0 items-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]">Read the docs <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link></div></section>

      <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><Logo /><p className="mt-3 text-xs">Zero-config full-stack runtime intelligence.</p></div><p className="text-xs">© 2026 Traceora. Built for curious engineers.</p></div></footer>
    </main>
  )
}
