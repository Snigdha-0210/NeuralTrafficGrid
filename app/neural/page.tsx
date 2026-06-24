'use client'

import { useState, useEffect } from 'react'
import { PageHeader, Card, StatCard, Badge, ProgressBar } from '@/components/ntg-ui'
import { ConfidenceGauge } from '@/components/gauge'
import { PredictionChart } from '@/components/charts'
import { neuralStats, featureImportance, nnPredictions, modelMetrics } from '@/lib/mock-data'
import { predictCongestion, type PredictionRequest } from '@/lib/api'

export default function NeuralPage() {
  const [inputs, setInputs] = useState<PredictionRequest>({
    north_count: 50,
    south_count: 30,
    east_count: 40,
    west_count: 20,
    avg_speed: 40,
    queue_length: 15,
    time_of_day: 14.5
  })
  
  const [predictedScore, setPredictedScore] = useState(0)

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await predictCongestion(inputs)
        setPredictedScore(res.congestion_score)
      } catch (err) {
        console.error('Failed to predict congestion:', err)
      }
    }
    const timer = setTimeout(fetchPrediction, 300) // debounce
    return () => clearTimeout(timer)
  }, [inputs])

  const set = (key: keyof PredictionRequest, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const slider = (label: string, key: keyof PredictionRequest, min: number, max: number, step=1) => (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: 'var(--t2)' }}>{label}</span>
        <span style={{ color: 'var(--cyan)' }}>{inputs[key]}</span>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step}
        value={inputs[key]}
        onChange={e => set(key, Number(e.target.value))}
        className="w-full"
      />
    </div>
  )

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Neural Network Analytics"
        title="Neural Network Analytics"
        sub="ANN prediction engine — traffic pattern recognition & classification"
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {neuralStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            accent={s.accent}
            color={s.color}
            trend={s.trend}
            trendDir={s.up ? (s.down ? 'down' : 'up') : 'neutral'}
            small={s.small}
          />
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Live Model Predictor">
          <div className="mt-2 pr-2 h-[220px] overflow-y-auto custom-scrollbar">
            {slider('North Vehicles', 'north_count', 0, 200)}
            {slider('South Vehicles', 'south_count', 0, 200)}
            {slider('East Vehicles', 'east_count', 0, 200)}
            {slider('West Vehicles', 'west_count', 0, 200)}
            {slider('Avg Speed (km/h)', 'avg_speed', 0, 100)}
            {slider('Queue Length', 'queue_length', 0, 100)}
            {slider('Time of Day', 'time_of_day', 0, 24, 0.5)}
          </div>
        </Card>

        <Card title="Predicted Congestion Score">
          <div className="flex flex-col items-center justify-center h-full pb-4">
            <ConfidenceGauge value={Math.round(predictedScore * 100)} />
            <div className="mt-4 text-[13px]" style={{ color: 'var(--t2)' }}>
              Raw Output: <span style={{ color: 'var(--cyan)' }}>{predictedScore.toFixed(4)}</span>
            </div>
          </div>
        </Card>

        <Card title="Feature Importance">
          <div className="mt-2 h-[220px] overflow-y-auto custom-scrollbar pr-2">
            {featureImportance.map((f) => (
              <div key={f.name} className="mb-3">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span style={{ color: 'var(--t2)' }}>{f.name}</span>
                  <span style={{ color: 'var(--cyan)' }}>{Math.round(f.val * 100)}%</span>
                </div>
                <ProgressBar
                  pct={f.val * 100}
                  background="linear-gradient(90deg,var(--cyan),var(--ncyan))"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Historical Predictions vs Actual">
          <div className="relative h-[180px]">
            <PredictionChart data={nnPredictions} />
          </div>
          <div className="mt-2 flex gap-4 text-[11px]" style={{ color: 'var(--t2)' }}>
            <span>
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                style={{ background: '#00E5FF' }}
              />
              Predicted
            </span>
            <span>
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                style={{ background: '#00FF88' }}
              />
              Actual
            </span>
          </div>
        </Card>

        <Card title="Model Performance Metrics">
          <table className="ntg-table mt-2">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((m) => (
                <tr key={m.metric}>
                  <td>{m.metric}</td>
                  <td style={{ color: m.color }}>{m.value}</td>
                  <td>
                    <Badge variant={m.badge as 'green' | 'amber' | 'red' | 'cyan'}>{m.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
