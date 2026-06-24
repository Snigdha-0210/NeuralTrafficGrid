'use client'

import { useEffect, useState } from 'react'
import { phases, baseVehicleCounts } from '@/lib/mock-data'

type Color = 'red' | 'amber' | 'green'

function Lamp({ color, on }: { color: Color; on: boolean }) {
  const map: Record<Color, { bg: string; glow: string }> = {
    red: { bg: 'var(--red)', glow: 'var(--glow-red)' },
    amber: { bg: 'var(--amber)', glow: 'var(--glow-amber)' },
    green: { bg: 'var(--green)', glow: 'var(--glow-green)' },
  }
  return (
    <div
      className="h-3.5 w-3.5 rounded-full transition-all duration-300"
      style={{
        background: on ? map[color].bg : 'rgba(255,255,255,0.1)',
        boxShadow: on ? map[color].glow : 'none',
      }}
    />
  )
}

function SignalBox({ active }: { active: Color }) {
  return (
    <div
      className="flex flex-col gap-[3px] rounded-md px-1.5 py-1"
      style={{ background: 'var(--bg1)', border: '1px solid var(--bdr)' }}
    >
      <Lamp color="red" on={active === 'red'} />
      <Lamp color="amber" on={active === 'amber'} />
      <Lamp color="green" on={active === 'green'} />
    </div>
  )
}

export function Junction({
  liveCounts,
  nsGreen,
  ewGreen
}: {
  liveCounts?: { n: number; s: number; e: number; w: number }
  nsGreen?: number
  ewGreen?: number
}) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [countdown, setCountdown] = useState(nsGreen || phases[0].dur)
  const [counts, setCounts] = useState(baseVehicleCounts)

  useEffect(() => {
    if (liveCounts) {
      setCounts(liveCounts)
    }
  }, [liveCounts])

  useEffect(() => {
    const id = setInterval(() => {
      if (liveCounts) return // If using live data, we don't jitter
      setCounts(() => {
        const jitter = (base: number) => base + Math.round((Math.random() - 0.5) * 6)
        return {
          n: jitter(baseVehicleCounts.n),
          s: jitter(baseVehicleCounts.s),
          e: jitter(baseVehicleCounts.e),
          w: jitter(baseVehicleCounts.w),
        }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [liveCounts])

  useEffect(() => {
    const activePhases = [
      { ...phases[0], dur: nsGreen || phases[0].dur },
      phases[1],
      { ...phases[2], dur: ewGreen || phases[2].dur },
      phases[3],
    ]
    
    const id = setInterval(() => {
      setCountdown((cd) => {
        if (cd <= 1) {
          setPhaseIdx((idx) => {
            const next = (idx + 1) % activePhases.length
            return next
          })
          return 0 // Handled in the next tick via effect or right here
        }
        return cd - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [nsGreen, ewGreen])

  useEffect(() => {
    const activePhases = [
      { ...phases[0], dur: nsGreen || phases[0].dur },
      phases[1],
      { ...phases[2], dur: ewGreen || phases[2].dur },
      phases[3],
    ]
    setCountdown(activePhases[phaseIdx].dur)
  }, [phaseIdx, nsGreen, ewGreen])

  const p = phases[phaseIdx]
  const nsWidth = p.ns === 'green' ? 75 : p.ns === 'amber' ? 95 : 10
  const ewWidth = p.ew === 'green' ? 75 : p.ew === 'amber' ? 95 : 10

  return (
    <div>
      <div className="relative mx-auto h-[360px] w-[360px] max-w-full">
        {/* roads */}
        <div
          className="absolute left-0 right-0 top-1/2 h-[100px] -translate-y-1/2"
          style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)' }}
        />
        <div
          className="absolute bottom-0 top-0 left-1/2 w-[100px] -translate-x-1/2"
          style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)' }}
        />

        {/* road labels */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] uppercase tracking-[1px]" style={{ color: 'var(--t2)' }}>
          North Rd
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[1px]" style={{ color: 'var(--t2)' }}>
          South Rd
        </div>

        {/* vehicle counts */}
        <div className="absolute left-1/2 top-[80px] -translate-x-1/2 text-[11px] font-semibold" style={{ color: 'var(--amber)' }}>
          {counts.n} veh
        </div>
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 text-[11px] font-semibold" style={{ color: 'var(--amber)' }}>
          {counts.s} veh
        </div>
        <div className="absolute right-[80px] top-1/2 -translate-y-1/2 text-[11px] font-semibold" style={{ color: 'var(--amber)' }}>
          {counts.e} veh
        </div>
        <div className="absolute left-[80px] top-1/2 -translate-y-1/2 text-[11px] font-semibold" style={{ color: 'var(--amber)' }}>
          {counts.w} veh
        </div>

        {/* signals */}
        <div className="absolute left-1/2 top-[105px] z-[3] -translate-x-1/2">
          <SignalBox active={p.ns} />
        </div>
        <div className="absolute bottom-[105px] left-1/2 z-[3] -translate-x-1/2">
          <SignalBox active={p.ns} />
        </div>
        <div className="absolute right-[105px] top-1/2 z-[3] -translate-y-1/2">
          <SignalBox active={p.ew} />
        </div>
        <div className="absolute left-[105px] top-1/2 z-[3] -translate-y-1/2">
          <SignalBox active={p.ew} />
        </div>

        {/* center */}
        <div
          className="absolute left-1/2 top-1/2 z-[2] flex h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded"
          style={{ background: 'var(--bg3)' }}
        >
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--t1)' }}>
              {countdown}
            </div>
            <div className="text-[9px] uppercase tracking-[1px]" style={{ color: 'var(--t2)' }}>
              {p.label}
            </div>
          </div>
        </div>
      </div>

      {/* phase bars */}
      <div className="mt-4">
        <div className="phase-bar-row">
          <div className="phase-bar-label">N-S Phase</div>
          <div className="phase-bar-track">
            <div className="phase-bar-fill" style={{ background: 'var(--green)', width: `${nsWidth}%` }} />
          </div>
          <div className="w-8 text-right text-[11px]" style={{ color: 'var(--t2)' }}>
            {nsGreen || 30}s
          </div>
        </div>
        <div className="phase-bar-row">
          <div className="phase-bar-label">E-W Phase</div>
          <div className="phase-bar-track">
            <div className="phase-bar-fill" style={{ background: 'var(--red)', width: `${ewWidth}%` }} />
          </div>
          <div className="w-8 text-right text-[11px]" style={{ color: 'var(--t2)' }}>
            {ewGreen || 25}s
          </div>
        </div>
      </div>
    </div>
  )
}
