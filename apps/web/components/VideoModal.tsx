'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Maximize,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHAPTERS = [
  { label: '0:00 Hook & Meme', time: 0 },
  { label: '0:03 Logo Reveal', time: 3.2 },
  { label: '0:07 10s Install', time: 6.8 },
  { label: '0:11 Features', time: 10.5 },
  { label: '0:15 God View', time: 14.8 },
  { label: '0:18 Zuhaib Rashid', time: 18.2 },
]

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [isMuted, setIsMuted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Reset & autoplay when modal opens, pause when closes
  useEffect(() => {
    if (isOpen) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.playbackRate = playbackRate
        videoRef.current.play().catch(() => {
          // Autoplay policy might require mute on some browsers
          if (videoRef.current) {
            videoRef.current.muted = true
            setIsMuted(true)
            videoRef.current.play().catch(() => {})
          }
        })
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [isOpen])

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play().catch(() => {})
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const copyInstallCmd = async () => {
    await navigator.clipboard?.writeText('npm i @traceora/react @traceora/core')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Traceora Showcase Video"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f12] shadow-2xl shadow-primary/10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 sm:px-6 py-3.5 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Traceora Showcase
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono text-primary border border-primary/25">
                  v0.2.0 • 22s
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed pills */}
            <div className="hidden sm:flex items-center rounded-lg border border-white/8 bg-white/5 p-0.5 text-xs text-muted-foreground">
              {[1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
                    playbackRate === rate
                      ? 'bg-primary text-black font-semibold'
                      : 'hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Download */}
            <a
              href="/traceora-showcase.mp4"
              download="traceora-showcase.mp4"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-white hover:border-white/20"
              title="Download showcase video"
            >
              <Download className="size-3.5" />
              <span className="text-[11px]">Download</span>
            </a>

            {/* Close button with ESC tag */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground">ESC</span>
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src="/traceora-showcase.mp4"
            poster="/og.jpg"
            controls
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
            }}
            className="w-full h-full object-contain"
          />

          {/* Floating Quick Action Overlay (Bottom Right of Video on hover) */}
          <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white/80 hover:text-white border border-white/10 hover:bg-black/80 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              onClick={handleFullscreen}
              className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white/80 hover:text-white border border-white/10 hover:bg-black/80 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="size-4" />
            </button>
          </div>
        </div>

        {/* Chapter Timestamps / Scrub bar */}
        <div className="border-t border-white/8 bg-black/30 px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
              Scenes:
            </span>
            {CHAPTERS.map((ch, idx) => {
              const nextTime = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1].time : 23
              const isActive = currentTime >= ch.time && currentTime < nextTime
              return (
                <button
                  key={ch.label}
                  onClick={() => seekTo(ch.time)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {ch.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer with Quick Install CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/8 bg-black/60 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white">
              <span className="text-primary font-bold">❯</span>
              <span>npm i @traceora/react @traceora/core</span>
            </div>
            <button
              onClick={copyInstallCmd}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-white"
              title="Copy install command"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
              <span className="hidden sm:inline text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground">
            <span>Built by Zuhaib Rashid</span>
            <a
              href="https://github.com/zuhaib-dev/traceora"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              GitHub <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
