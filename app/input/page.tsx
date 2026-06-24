'use client'

import { useState } from 'react'
import { PageHeader, Card, Badge } from '@/components/ntg-ui'
import { useToast } from '@/components/toast'
import { defaultInputs, presets, timeOfDayOptions, type InputState } from '@/lib/mock-data'
import { optimizeSignals } from '@/lib/api'
import { RotateCw, Play, X, Loader2 } from 'lucide-react'

type Result = { ns: number; ew: number; wait: number; eff: number; rec: string }

export default function InputPage() {
  const toast = useToast()
  const [inputs, setInputs] = useState<InputState>(defaultInputs)
  const [emergency, setEmergency] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState(timeOfDayOptions[2])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof InputState, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }))

  const randomize = () => {
    setInputs({
      north: Math.floor(Math.random() * 120 + 10),
      south: Math.floor(Math.random() * 120 + 10),
      east: Math.floor(Math.random() * 120 + 10),
      west: Math.floor(Math.random() * 120 + 10),
      speed: Math.floor(Math.random() * 80 + 20),
      queue: Math.floor(Math.random() * 200 + 10),
    })
  }

  const runSim = async () => {
    setLoading(true)
    const { north: n, south: s, east: e, west: w } = inputs
    const total = n + s + e + w || 1
    const wait = Math.round(8 + total / 40)
    
    let timeFloat = 12.0
    if (timeOfDay.includes('Morning')) timeFloat = 8.0
    if (timeOfDay.includes('Midday')) timeFloat = 12.0
    if (timeOfDay.includes('Evening')) timeFloat = 18.0
    if (timeOfDay.includes('Night')) timeFloat = 2.0

    try {
      const res = await optimizeSignals({
        north: { count: n, queue: inputs.queue, wait_time: wait },
        south: { count: s, queue: inputs.queue, wait_time: wait },
        east: { count: e, queue: inputs.queue, wait_time: wait },
        west: { count: w, queue: inputs.queue, wait_time: wait },
        avg_speed: inputs.speed,
        time_of_day: timeFloat
      })

      const nsGreen = Math.round((res.pso_result.optimized_times.north + res.pso_result.optimized_times.south) / 2)
      const ewGreen = Math.round((res.pso_result.optimized_times.east + res.pso_result.optimized_times.west) / 2)
      const eff = Math.min(99, Math.round(100 - res.overall_congestion * 100))
      
      setResult({
        ns: nsGreen,
        ew: ewGreen,
        wait: Math.round(res.pso_result.best_cost),
        eff,
        rec: `Overall Congestion: ${res.overall_congestion.toFixed(2)}. Fuzzy targets: N/S (~${Math.round(res.fuzzy_targets.north)}s), E/W (~${Math.round(res.fuzzy_targets.east)}s). PSO optimized to ${nsGreen}s N-S / ${ewGreen}s E-W.`,
      })
      toast('AI Simulation complete ✓')
    } catch (err) {
      toast('Failed to reach backend API. Is the server running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setInputs(defaultInputs)
    setEmergency(false)
    setResult(null)
  }

  const applyPreset = (type: keyof typeof presets) => {
    const p = presets[type]
    setInputs({ north: p.north, south: p.south, east: p.east, west: p.west, speed: p.speed, queue: p.queue })
    setEmergency(p.emergency)
    toast('Preset applied: ' + type.toUpperCase())
  }

  const field = (label: string, key: keyof InputState, min: number, max: number) => (
    <div>
      <label className="input-label" htmlFor={`in-${key}`}>
        {label}
      </label>
      <input
        id={`in-${key}`}
        className="inp"
        type="number"
        min={min}
        max={max}
        value={inputs[key]}
        onChange={(ev) => set(key, Number(ev.target.value))}
      />
    </div>
  )

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Traffic Input Center"
        title="Traffic Input Center"
        sub="Configure junction parameters and run simulations"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Junction Vehicle Counts">
          <div className="grid grid-cols-2 gap-3">
            {field('North Vehicle Count', 'north', 0, 200)}
            {field('South Vehicle Count', 'south', 0, 200)}
            {field('East Vehicle Count', 'east', 0, 200)}
            {field('West Vehicle Count', 'west', 0, 200)}
            {field('Average Speed (km/h)', 'speed', 5, 120)}
            {field('Queue Length (m)', 'queue', 0, 500)}
          </div>

          <div className="mt-3.5">
            <label className="input-label" htmlFor="in-time">
              Time of Day
            </label>
            <select
              id="in-time"
              className="inp"
              value={timeOfDay}
              onChange={(ev) => setTimeOfDay(ev.target.value)}
            >
              {timeOfDayOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="mt-3.5">
            <span className="input-label">Emergency Vehicle</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Toggle emergency vehicle"
                className={`toggle ${emergency ? 'on' : ''}`}
                onClick={() => setEmergency((e) => !e)}
              />
              <span className="text-[13px]" style={{ color: 'var(--t2)' }}>
                Emergency Vehicle Present
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button className="btn btn-secondary inline-flex items-center gap-1.5" onClick={randomize}>
              <RotateCw size={14} /> Randomize
            </button>
            <button className="btn btn-primary inline-flex items-center gap-1.5" onClick={runSim} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />} 
              {loading ? 'Optimizing...' : 'Run Simulation'}
            </button>
            <button className="btn btn-danger inline-flex items-center gap-1.5" onClick={reset}>
              <X size={14} /> Reset
            </button>
          </div>
        </Card>

        <div className="flex flex-col gap-3.5">
          {result && (
            <Card title="Simulation Results">
              <div className="mb-3 flex items-center gap-2.5">
                <Badge variant="green">✓ Simulation Complete</Badge>
                <span className="text-[11px]" style={{ color: 'var(--t2)' }}>
                  AI optimization applied
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { v: `${result.ns}s`, l: 'N-S Green' },
                  { v: `${result.ew}s`, l: 'E-W Green' },
                  { v: `${result.wait}s`, l: 'Avg Wait' },
                  { v: `${result.eff}%`, l: 'Efficiency' },
                ].map((r) => (
                  <div key={r.l} className="text-center">
                    <div className="text-[22px] font-bold" style={{ color: 'var(--cyan)' }}>
                      {r.v}
                    </div>
                    <div className="mt-0.5 text-[10px] tracking-[0.5px]" style={{ color: 'var(--t2)' }}>
                      {r.l}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--bdr)' }}>
                <div className="mb-1.5 text-[11px]" style={{ color: 'var(--t2)' }}>
                  AI Recommendation
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: 'var(--t1)' }}>
                  {result.rec}
                </div>
              </div>
            </Card>
          )}

          <Card title="Traffic Presets">
            <div className="mt-1 flex flex-col gap-1.5">
              {[
                { key: 'rush', label: '🔴 Rush Hour — High density all directions' },
                { key: 'normal', label: '🟡 Normal Flow — Balanced medium traffic' },
                { key: 'low', label: '🟢 Low Traffic — Minimal vehicle count' },
                { key: 'emg', label: '🚨 Emergency — Emergency vehicle active' },
              ].map((p) => (
                <button
                  key={p.key}
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '10px 14px' }}
                  onClick={() => applyPreset(p.key as keyof typeof presets)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
