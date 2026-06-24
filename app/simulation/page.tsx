'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader, Card } from '@/components/ntg-ui'
import { Play, Pause, RotateCw, Loader2, Zap } from 'lucide-react'
import { optimizeSignals } from '@/lib/api'
import { useToast } from '@/components/toast'

type Dir = 'N' | 'S' | 'E' | 'W'
type Vehicle = {
  x: number
  y: number
  vx: number
  vy: number
  dir: Dir
  color: string
  waiting: boolean
  waitTicks: number
  passed: boolean
}

const SIZE = 440
const CX = 220
const CY = 220
const RW = 80

export default function SimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const vehiclesRef = useRef<Vehicle[]>([])
  const phaseTimeRef = useRef(0)
  const throughputRef = useRef(0)
  const speedRef = useRef(2)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nsGreenRef = useRef(30)
  const ewGreenRef = useRef(25)
  const toast = useToast()

  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(2)
  const [stats, setStats] = useState({ veh: 0, thru: 0, wait: 0, phase: 'NS' as 'NS' | 'EW' })
  const [bars, setBars] = useState({ ns: 0, ew: 0, nsT: 0, ewT: 0 })
  const [optimizing, setOptimizing] = useState(false)

  const spawnVehicle = useCallback(() => {
    const dirs: Dir[] = ['N', 'S', 'E', 'W']
    const d = dirs[Math.floor(Math.random() * 4)]
    const spawn: Record<Dir, Omit<Vehicle, 'color' | 'waiting' | 'waitTicks' | 'passed'>> = {
      N: { x: CX - 15, y: 10, vx: 0, vy: 1.5, dir: 'N' },
      S: { x: CX + 15, y: 430, vx: 0, vy: -1.5, dir: 'S' },
      E: { x: 430, y: CY - 15, vx: -1.5, vy: 0, dir: 'E' },
      W: { x: 10, y: CY + 15, vx: 1.5, vy: 0, dir: 'W' },
    }
    const color = ['#00E5FF', '#4CC9F0', '#00FF88', '#FFC93C'][Math.floor(Math.random() * 4)]
    vehiclesRef.current.push({ ...spawn[d], color, waiting: false, waitTicks: 0, passed: false })
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const phaseTime = phaseTimeRef.current
    const cycle = nsGreenRef.current + ewGreenRef.current
    const pos = phaseTime % cycle
    const simPhase: 'NS' | 'EW' = pos < nsGreenRef.current ? 'NS' : 'EW'

    ctx.fillStyle = '#111820'
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#1A2430'
    ctx.fillRect(0, CY - RW / 2, SIZE, RW)
    ctx.fillRect(CX - RW / 2, 0, RW, SIZE)

    ctx.setLineDash([20, 15])
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, CY)
    ctx.lineTo(CX - RW / 2, CY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CX + RW / 2, CY)
    ctx.lineTo(SIZE, CY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CX, 0)
    ctx.lineTo(CX, CY - RW / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CX, CY + RW / 2)
    ctx.lineTo(CX, SIZE)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#1F2F40'
    ctx.fillRect(CX - RW / 2, CY - RW / 2, RW, RW)
    ctx.strokeStyle = 'rgba(0,229,255,0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(CX - RW / 2, CY - RW / 2, RW, RW)

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ;[
      [CX - RW / 2, CY - RW / 2 - 5, CX - 5, CY - RW / 2 - 5],
      [CX + 5, CY - RW / 2 - 5, CX + RW / 2, CY - RW / 2 - 5],
      [CX - RW / 2, CY + RW / 2 + 5, CX - 5, CY + RW / 2 + 5],
      [CX + 5, CY + RW / 2 + 5, CX + RW / 2, CY + RW / 2 + 5],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

    const nsColor = simPhase === 'NS' ? '#00FF88' : '#FF4D6D'
    const ewColor = simPhase === 'EW' ? '#00FF88' : '#FF4D6D'
    ;(
      [
        [CX - RW / 2 - 14, CY - RW / 2 - 14, nsColor],
        [CX + RW / 2 + 2, CY + RW / 2 + 2, nsColor],
        [CX + RW / 2 + 2, CY - RW / 2 - 14, ewColor],
        [CX - RW / 2 - 14, CY + RW / 2 + 2, ewColor],
      ] as [number, number, string][]
    ).forEach(([x, y, c]) => {
      ctx.fillStyle = '#0E1621'
      ctx.fillRect(x, y, 12, 12)
      ctx.fillStyle = c
      if (c === '#00FF88') {
        ctx.shadowColor = '#00FF88'
        ctx.shadowBlur = 8
      }
      ctx.beginPath()
      ctx.arc(x + 6, y + 6, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    vehiclesRef.current.forEach((v) => {
      ctx.fillStyle = v.color
      ctx.shadowColor = v.color
      ctx.shadowBlur = 4
      if (v.dir === 'N' || v.dir === 'S') ctx.fillRect(v.x - 4, v.y - 7, 8, 14)
      else ctx.fillRect(v.x - 7, v.y - 4, 14, 8)
      ctx.shadowBlur = 0
    })

    ctx.fillStyle = 'rgba(148,163,184,0.6)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('NORTH', CX, 22)
    ctx.fillText('SOUTH', CX, 432)
    ctx.save()
    ctx.translate(15, CY)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('WEST', 0, 0)
    ctx.restore()
    ctx.save()
    ctx.translate(425, CY)
    ctx.rotate(Math.PI / 2)
    ctx.fillText('EAST', 0, 0)
    ctx.restore()

    const remain =
      simPhase === 'NS' ? nsGreenRef.current - (phaseTime % nsGreenRef.current) : ewGreenRef.current - (phaseTime % ewGreenRef.current)
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(CX - 25, CY - 12, 50, 24)
    ctx.strokeStyle = simPhase === 'NS' ? '#00FF88' : '#4CC9F0'
    ctx.lineWidth = 1
    ctx.strokeRect(CX - 25, CY - 12, 50, 24)
    ctx.fillStyle = simPhase === 'NS' ? '#00FF88' : '#4CC9F0'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(String(remain), CX, CY + 5)
  }, [])

  const tick = useCallback(() => {
    phaseTimeRef.current++
    const phaseTime = phaseTimeRef.current
    const cycle = nsGreenRef.current + ewGreenRef.current
    const pos = phaseTime % cycle
    const simPhase: 'NS' | 'EW' = pos < nsGreenRef.current ? 'NS' : 'EW'
    const sp = speedRef.current

    vehiclesRef.current = vehiclesRef.current.filter((v) => !v.passed)
    vehiclesRef.current.forEach((v) => {
      const atStop =
        (v.dir === 'N' && v.y > CY - RW / 2 - 20 && v.y < CY - RW / 2 - 5) ||
        (v.dir === 'S' && v.y < CY + RW / 2 + 20 && v.y > CY + RW / 2 + 5) ||
        (v.dir === 'E' && v.x < CX + RW / 2 + 20 && v.x > CX + RW / 2 + 5) ||
        (v.dir === 'W' && v.x > CX - RW / 2 - 20 && v.x < CX - RW / 2 - 5)
      const canGo =
        (simPhase === 'NS' && (v.dir === 'N' || v.dir === 'S')) ||
        (simPhase === 'EW' && (v.dir === 'E' || v.dir === 'W'))
      v.waiting = atStop && !canGo
      if (!v.waiting) {
        v.x += v.vx * sp
        v.y += v.vy * sp
      } else {
        v.waitTicks++
      }
      if (v.x < -20 || v.x > 460 || v.y < -20 || v.y > 460) {
        v.passed = true
        throughputRef.current++
      }
    })
    if (Math.random() < 0.06 * sp) spawnVehicle()

    const vehs = vehiclesRef.current
    const simWait = Math.round(
      vehs.filter((v) => v.waiting).reduce((s, v) => s + v.waitTicks, 0) / Math.max(1, vehs.length)
    )
    setStats({ veh: vehs.length, thru: throughputRef.current, wait: simWait, phase: simPhase })

    const nsP = ((nsGreenRef.current - (pos % nsGreenRef.current)) / nsGreenRef.current) * 100
    const ewP = ((ewGreenRef.current - (pos % ewGreenRef.current)) / ewGreenRef.current) * 100
    setBars({
      ns: simPhase === 'NS' ? nsP : 5,
      ew: simPhase === 'EW' ? ewP : 5,
      nsT: simPhase === 'NS' ? Math.round((nsP * nsGreenRef.current) / 100) : 0,
      ewT: simPhase === 'EW' ? Math.round((ewP * ewGreenRef.current) / 100) : 0,
    })
    draw()
  }, [draw, spawnVehicle])

  useEffect(() => {
    draw()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [draw])

  const toggle = () => {
    if (running) {
      if (timerRef.current) clearInterval(timerRef.current)
      setRunning(false)
    } else {
      setRunning(true)
      timerRef.current = setInterval(tick, 200 / speedRef.current)
    }
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
    vehiclesRef.current = []
    throughputRef.current = 0
    phaseTimeRef.current = 0
    setStats({ veh: 0, thru: 0, wait: 0, phase: 'NS' })
    setBars({ ns: 0, ew: 0, nsT: 0, ewT: 0 })
    draw()
  }

  const onSpeed = (v: number) => {
    setSpeed(v)
    speedRef.current = v
    if (running && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(tick, 200 / v)
    }
  }

  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      const v = vehiclesRef.current
      const nCount = v.filter((c) => c.dir === 'N').length
      const sCount = v.filter((c) => c.dir === 'S').length
      const eCount = v.filter((c) => c.dir === 'E').length
      const wCount = v.filter((c) => c.dir === 'W').length
      
      const nQueue = v.filter((c) => c.dir === 'N' && c.waiting).length
      const sQueue = v.filter((c) => c.dir === 'S' && c.waiting).length
      const eQueue = v.filter((c) => c.dir === 'E' && c.waiting).length
      const wQueue = v.filter((c) => c.dir === 'W' && c.waiting).length

      const res = await optimizeSignals({
        north: { count: nCount, queue: nQueue, wait_time: 15 },
        south: { count: sCount, queue: sQueue, wait_time: 15 },
        east: { count: eCount, queue: eQueue, wait_time: 15 },
        west: { count: wCount, queue: wQueue, wait_time: 15 },
        avg_speed: 40,
        time_of_day: 14.5
      })

      nsGreenRef.current = Math.round((res.pso_result.optimized_times.north + res.pso_result.optimized_times.south) / 2)
      ewGreenRef.current = Math.round((res.pso_result.optimized_times.east + res.pso_result.optimized_times.west) / 2)
      
      toast(`AI Applied: N-S: ${nsGreenRef.current}s, E-W: ${ewGreenRef.current}s`)
    } catch (e) {
      toast('Failed to contact AI optimizer')
    } finally {
      setOptimizing(false)
    }
  }

  const heatmap = [
    { d: 'N', level: 'Low', bg: 'rgba(0,255,136,0.15)', color: 'var(--green)' },
    { d: 'S', level: 'Med', bg: 'rgba(255,201,60,0.15)', color: 'var(--amber)' },
    { d: 'E', level: 'High', bg: 'rgba(255,77,109,0.15)', color: 'var(--red)' },
    { d: 'W', level: 'Clear', bg: 'rgba(0,229,255,0.15)', color: 'var(--cyan)' },
  ]

  const statTiles = [
    { label: 'Vehicles', value: stats.veh, accent: 'var(--cyan)', color: 'var(--cyan)' },
    { label: 'Throughput', value: `${stats.thru}/min`, accent: 'var(--green)', color: 'var(--green)' },
    { label: 'Avg Wait', value: `${stats.wait}s`, accent: 'var(--amber)', color: 'var(--amber)' },
    { label: 'Phase', value: stats.phase === 'NS' ? 'NS GREEN' : 'EW GREEN', accent: 'var(--ncyan)', color: 'var(--ncyan)', small: true },
  ]

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Simulation Lab"
        title="Traffic Simulation Lab"
        sub="Real-time city intersection simulator with AI signal control"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card style={{ padding: 12 }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded-lg"
            style={{ background: '#111820', border: '1px solid var(--bdr)' }}
            aria-label="Live traffic intersection simulation"
            role="img"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <button className="btn btn-primary inline-flex items-center gap-1.5" onClick={toggle}>
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? 'Pause' : 'Play'}
            </button>
            <button className="btn btn-secondary inline-flex items-center gap-1.5" onClick={reset}>
              <RotateCw size={14} /> Reset
            </button>
            <button className="btn btn-secondary inline-flex items-center gap-1.5" onClick={handleOptimize} disabled={optimizing} style={{color: 'var(--cyan)', borderColor: 'var(--cyan)'}}>
              {optimizing ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
              {optimizing ? 'Thinking...' : 'AI Optimize'}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                Speed:
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={speed}
                onChange={(e) => onSpeed(Number(e.target.value))}
                className="w-20"
                aria-label="Simulation speed"
              />
              <span className="w-6 text-[12px]" style={{ color: 'var(--cyan)' }}>
                {speed}x
              </span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card title="Live Statistics">
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {statTiles.map((t) => (
                <div key={t.label} className="stat-card" style={{ ['--accent' as string]: t.accent, padding: 12 }}>
                  <div className="stat-label" style={{ fontSize: 10 }}>
                    {t.label}
                  </div>
                  <div className="stat-val" style={{ fontSize: t.small ? 14 : 20, color: t.color }}>
                    {t.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Signal Phase Timer">
            <div className="mt-2">
              <div className="phase-bar-row">
                <div className="phase-bar-label">N-S</div>
                <div className="phase-bar-track">
                  <div
                    className="phase-bar-fill"
                    style={{ width: `${bars.ns}%`, background: stats.phase === 'NS' ? 'var(--green)' : 'var(--red)' }}
                  />
                </div>
                <div className="w-10 text-right text-[11px]" style={{ color: 'var(--t2)' }}>
                  {bars.nsT}s
                </div>
              </div>
              <div className="phase-bar-row">
                <div className="phase-bar-label">E-W</div>
                <div className="phase-bar-track">
                  <div
                    className="phase-bar-fill"
                    style={{ width: `${bars.ew}%`, background: stats.phase === 'EW' ? 'var(--green)' : 'var(--red)' }}
                  />
                </div>
                <div className="w-10 text-right text-[11px]" style={{ color: 'var(--t2)' }}>
                  {bars.ewT}s
                </div>
              </div>
            </div>
          </Card>

          <Card title="Congestion Heatmap">
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {heatmap.map((h) => (
                <div
                  key={h.d}
                  className="rounded-md p-2 text-center text-[11px]"
                  style={{ background: h.bg, color: h.color }}
                >
                  {h.d}
                  <br />
                  <b>{h.level}</b>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
