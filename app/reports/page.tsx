'use client'

import { PageHeader, Card, Badge } from '@/components/ntg-ui'
import { PerformanceChart } from '@/components/charts'
import { useToast } from '@/components/toast'
import {
  dailySummary,
  weeklySummary,
  monthlySummary,
  performanceTrend,
  trafficLog,
} from '@/lib/mock-data'
import { Download } from 'lucide-react'

function SummaryCard({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string; color: string }[]
}) {
  return (
    <Card title={title}>
      <div className="mt-1.5">
        {rows.map((r) => (
          <div key={r.label} className="settings-row">
            <span className="settings-label">{r.label}</span>
            <span style={{ color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function ReportsPage() {
  const toast = useToast()
  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Reports & Analytics"
        title="Reports & Analytics"
        sub="Performance summaries, optimization impact, and data exports"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Daily Summary" rows={dailySummary} />
        <SummaryCard title="Weekly Summary" rows={weeklySummary} />
        <SummaryCard title="Monthly Summary" rows={monthlySummary} />
      </div>

      <Card title="Traffic Performance Trend" className="mb-4">
        <div className="relative h-[200px]">
          <PerformanceChart data={performanceTrend} />
        </div>
        <div className="mt-2 flex gap-4 text-[11px]" style={{ color: 'var(--t2)' }}>
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'rgba(0,229,255,0.8)' }} />
            Efficiency %
          </span>
          <span>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'rgba(255,201,60,0.8)' }} />
            Avg Wait (s)
          </span>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="card-title" style={{ margin: 0 }}>
            Detailed Traffic Log
          </div>
          <div className="flex gap-2">
            {['PDF', 'CSV', 'Excel'].map((fmt) => (
              <button
                key={fmt}
                className="btn btn-secondary inline-flex items-center gap-1.5"
                onClick={() => toast(`Exporting ${fmt}...`)}
              >
                <Download size={14} /> {fmt}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="ntg-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Junction</th>
                <th>Vehicles</th>
                <th>Wait (s)</th>
                <th>Efficiency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trafficLog.map((row) => (
                <tr key={row.time}>
                  <td>{row.time}</td>
                  <td>{row.junction}</td>
                  <td>{row.vehicles}</td>
                  <td>{row.wait}</td>
                  <td>{row.eff}</td>
                  <td>
                    <Badge variant={row.badge as 'green' | 'amber' | 'red' | 'cyan'}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
