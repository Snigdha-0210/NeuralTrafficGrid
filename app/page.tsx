'use client'

import { useEffect, useState } from 'react'
import { PageHeader, StatCard, Card } from '@/components/ntg-ui'
import { Junction } from '@/components/junction'
import { CongestionChart, DensityWaitChart } from '@/components/charts'
import { heroMetrics, congestionTrend, densityWaitTrend } from '@/lib/mock-data'
import { getSimulationState } from '@/lib/api'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(heroMetrics)
  const [liveCounts, setLiveCounts] = useState<{ n: number; s: number; e: number; w: number } | undefined>()
  const [nsGreen, setNsGreen] = useState<number | undefined>()
  const [ewGreen, setEwGreen] = useState<number | undefined>()

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const res = await getSimulationState()
        if (!mounted) return
        
        const data = res.data
        // Calculate average optimal wait
        const optNs = Math.round((data.pso_result.optimized_times.north + data.pso_result.optimized_times.south) / 2)
        const optEw = Math.round((data.pso_result.optimized_times.east + data.pso_result.optimized_times.west) / 2)
        
        setNsGreen(optNs)
        setEwGreen(optEw)
        
        // Jitter live counts for visual effect
        const jitter = (base: number) => Math.max(0, base + Math.round((Math.random() - 0.5) * 10))
        setLiveCounts({
          n: jitter(40),
          s: jitter(20),
          e: jitter(60),
          w: jitter(10)
        })

        // Update some metrics
        setMetrics((prev) => {
          const newMetrics = [...prev]
          newMetrics[3] = { // Efficiency
            ...newMetrics[3],
            value: `${Math.round(100 - data.overall_congestion * 100)}%`
          }
          newMetrics[4] = { // Congestion Index
            ...newMetrics[4],
            value: data.overall_congestion.toFixed(2)
          }
          return newMetrics
        })
      } catch (err) {
        console.error('Failed to fetch live simulation state:', err)
      }
    }

    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Command Center"
        title="Command Center Dashboard"
        sub="Real-time AI-driven traffic intelligence across all junctions"
      />

      {/* Hero metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            accent={m.accent}
            color={m.color}
            trend={m.trend.text}
            trendDir={m.trend.dir}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="⬡ Smart Junction — Sector 7-Alpha">
          <Junction liveCounts={liveCounts} nsGreen={nsGreen} ewGreen={ewGreen} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Congestion Trend">
            <div className="relative h-[140px]">
              <CongestionChart data={congestionTrend} />
            </div>
          </Card>
          <Card title="Vehicle Density + Waiting Time">
            <div className="relative h-[140px]">
              <DensityWaitChart data={densityWaitTrend} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
