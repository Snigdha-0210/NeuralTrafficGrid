'use client'

import { useState } from 'react'
import { PageHeader, Card, Badge } from '@/components/ntg-ui'
import { systemStatus } from '@/lib/mock-data'

function SettingToggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button"
      aria-label="Toggle setting"
      aria-pressed={on}
      className={`toggle ${on ? 'on' : ''}`}
      onClick={() => setOn((o) => !o)}
    />
  )
}

function SelectRow({
  label,
  options,
  defaultValue,
}: {
  label: string
  options: string[]
  defaultValue: string
}) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <select className="inp" style={{ width: 120, padding: '4px 8px' }} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="page-fade p-6">
      <PageHeader
        crumb="Settings"
        title="Settings"
        sub="Platform configuration, preferences, and system status"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3.5">
          <Card title="Simulation Settings">
            <SelectRow label="Auto-optimize every" options={['30 seconds', '60 seconds', '5 minutes']} defaultValue="60 seconds" />
            <SelectRow label="PSO Particle Count" options={['10', '30', '50', '100']} defaultValue="30" />
            <SelectRow label="Max Iterations" options={['50', '100', '200']} defaultValue="100" />
            <div className="settings-row">
              <span className="settings-label">Emergency Override</span>
              <SettingToggle defaultOn />
            </div>
          </Card>

          <Card title="Notification Preferences">
            <div className="settings-row">
              <span className="settings-label">Congestion Alerts</span>
              <SettingToggle defaultOn />
            </div>
            <div className="settings-row">
              <span className="settings-label">Optimization Complete</span>
              <SettingToggle defaultOn />
            </div>
            <div className="settings-row">
              <span className="settings-label">Emergency Detected</span>
              <SettingToggle defaultOn />
            </div>
            <div className="settings-row">
              <span className="settings-label">System Health Alerts</span>
              <SettingToggle defaultOn={false} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <Card title="System Status">
            {systemStatus.map((s) => (
              <div key={s.label} className="settings-row">
                <span className="settings-label">{s.label}</span>
                <Badge variant={s.badge as 'green' | 'amber' | 'red' | 'cyan'}>
                  {s.dot} {s.status}
                </Badge>
              </div>
            ))}
          </Card>

          <Card title="About Project">
            <div className="text-[12px] leading-[1.8]" style={{ color: 'var(--t2)' }}>
              <div>
                <b style={{ color: 'var(--t1)' }}>Project:</b> AI-Based Intelligent Traffic Signal Optimization
              </div>
              <div>
                <b style={{ color: 'var(--t1)' }}>Methods:</b> ANN, Fuzzy Logic, Particle Swarm Optimization
              </div>
              <div>
                <b style={{ color: 'var(--t1)' }}>Domain:</b> Soft Computing / Smart Cities
              </div>
              <div>
                <b style={{ color: 'var(--t1)' }}>Version:</b> 1.0.0-alpha
              </div>
              <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--bdr)' }}>
                <Badge variant="cyan">Frontend Demo</Badge>
                <span className="ml-2 text-[11px]">Ready for backend integration</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
