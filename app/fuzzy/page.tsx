'use client'

import { useState, useEffect, Fragment } from 'react'
import { PageHeader, Card, Badge } from '@/components/ntg-ui'
import { MembershipChart } from '@/components/membership-chart'
import { fuzzyFlow, fuzzyRules, membershipSets } from '@/lib/mock-data'
import { getFuzzyDecision, type FuzzyRequest } from '@/lib/api'

export default function FuzzyPage() {
  const [inputs, setInputs] = useState<FuzzyRequest>({
    congestion_score: 0.6,
    waiting_time: 40
  })

  const [greenDuration, setGreenDuration] = useState<number | null>(null)

  useEffect(() => {
    const fetchFuzzy = async () => {
      try {
        const res = await getFuzzyDecision(inputs)
        setGreenDuration(res.green_signal_duration)
      } catch (err) {
        console.error('Failed to get fuzzy decision:', err)
      }
    }
    const timer = setTimeout(fetchFuzzy, 300)
    return () => clearTimeout(timer)
  }, [inputs])

  const slider = (label: string, key: keyof FuzzyRequest, min: number, max: number, step=0.1) => (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: 'var(--t2)' }}>{label}</span>
        <span style={{ color: 'var(--cyan)' }}>{inputs[key]}</span>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step}
        value={inputs[key]}
        onChange={e => setInputs(prev => ({ ...prev, [key]: Number(e.target.value) }))}
        className="w-full"
      />
    </div>
  )

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Fuzzy Logic Decision Engine"
        title="Fuzzy Logic Decision Engine"
        sub="Linguistic rule-based inference system for signal control"
      />

      <Card title="Inference Flow" className="mb-4">
        <div className="flow-row">
          {fuzzyFlow.map((step, i) => (
            <Fragment key={step.title}>
              <div
                className="flow-box"
                style={
                  step.accent === 'cyan'
                    ? { borderColor: 'rgba(0,229,255,0.3)', color: 'var(--cyan)' }
                    : step.accent === 'green'
                      ? { borderColor: 'rgba(0,255,136,0.3)', color: 'var(--green)' }
                      : undefined
                }
              >
                {step.icon} {step.title}
                <br />
                <small style={{ color: 'var(--t2)' }}>{step.sub}</small>
              </div>
              {i < fuzzyFlow.length - 1 && <div className="flow-arrow">→</div>}
            </Fragment>
          ))}
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Live Fuzzy Inputs">
          <div className="mt-4">
            {slider('Congestion Score', 'congestion_score', 0, 1, 0.01)}
            {slider('Waiting Time (s)', 'waiting_time', 0, 120, 1)}
          </div>
        </Card>
        
        <Card title="Defuzzified Output">
          <div className="flex flex-col items-center justify-center h-full pb-4">
            <div className="text-[48px] font-bold" style={{ color: 'var(--green)' }}>
              {greenDuration !== null ? Math.round(greenDuration) : '--'}s
            </div>
            <div className="mt-2 text-[13px]" style={{ color: 'var(--t2)' }}>
              Optimal Green Signal Duration
            </div>
          </div>
        </Card>
        
        <Card title="Active Rule Evaluation">
          <div className="mt-1 h-[140px] overflow-y-auto custom-scrollbar pr-2">
            {fuzzyRules.map((r) => {
              // Simple active logic for demo purposes based on inputs
              const isHighDensity = inputs.congestion_score >= 0.6
              const isLowDensity = inputs.congestion_score < 0.3
              const isLongWait = inputs.waiting_time >= 60
              const isShortWait = inputs.waiting_time < 30
              
              let isActive = false
              if (r.text.includes('HIGH') && r.text.includes('LONG') && isHighDensity && isLongWait) isActive = true
              else if (r.text.includes('HIGH') && r.text.includes('SHORT') && isHighDensity && isShortWait) isActive = true
              else if (r.text.includes('LOW') && r.text.includes('LONG') && isLowDensity && isLongWait) isActive = true
              else if (r.text.includes('LOW') && r.text.includes('SHORT') && isLowDensity && isShortWait) isActive = true
              else if (r.text.includes('MEDIUM') && !isHighDensity && !isLowDensity && !isLongWait && !isShortWait) isActive = true
              else if (r.text.includes('HIGH') && r.text.includes('MEDIUM') && isHighDensity && !isLongWait && !isShortWait) isActive = true

              return (
                <div key={r.text} className={`rule-card ${isActive ? 'active' : ''}`}>
                  <div className="rule-dot" style={{ background: r.color }} />
                  <span style={{ color: isActive ? 'var(--t1)' : 'var(--t2)', fontSize: '11px' }}>{r.text}</span>
                  {isActive && (
                    <span className="ml-auto flex-shrink-0">
                      <Badge variant="cyan">Active</Badge>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Traffic Density Membership">
          <MembershipChart labels={membershipSets.density.labels} colors={membershipSets.density.colors} />
        </Card>
        <Card title="Waiting Time Membership">
          <MembershipChart labels={membershipSets.wait.labels} colors={membershipSets.wait.colors} />
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card title="Signal Duration Output Function">
          <MembershipChart labels={membershipSets.output.labels} colors={membershipSets.output.colors} />
        </Card>
      </div>
    </div>
  )
}
