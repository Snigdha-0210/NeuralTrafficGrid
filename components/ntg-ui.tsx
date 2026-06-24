import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

// ───── Page header ─────
export function PageHeader({
  crumb,
  title,
  sub,
}: {
  crumb: string
  title: string
  sub: string
}) {
  return (
    <div className="mb-6">
      <div className="breadcrumb">
        NEURAL TRAFFIC GRID <span>/ {crumb}</span>
      </div>
      <h1 className="page-title text-balance">{title}</h1>
      <p className="page-sub text-pretty">{sub}</p>
    </div>
  )
}

// ───── Card ─────
export function Card({
  title,
  children,
  className,
  style,
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`ntg-card ${className ?? ''}`} style={style}>
      {title != null && <div className="card-title">{title}</div>}
      {children}
    </div>
  )
}

// ───── Stat card ─────
export function StatCard({
  label,
  value,
  accent = 'var(--cyan)',
  color = 'var(--cyan)',
  trend,
  trendDir,
  small,
  valueSize,
}: {
  label: string
  value: ReactNode
  accent?: string
  color?: string
  trend?: ReactNode
  trendDir?: 'up' | 'down' | 'neutral'
  small?: boolean
  valueSize?: number
}) {
  return (
    <div className="stat-card" style={{ ['--accent' as string]: accent }}>
      <div className="stat-label">{label}</div>
      <div
        className="stat-val"
        style={{
          color,
          fontSize: small ? 16 : valueSize ? valueSize : undefined,
          paddingTop: small ? 6 : undefined,
        }}
      >
        {value}
      </div>
      {trend != null && (
        <div
          className="stat-trend"
          style={{
            color:
              trendDir === 'up'
                ? 'var(--green)'
                : trendDir === 'down'
                  ? 'var(--green)'
                  : 'var(--t2)',
          }}
        >
          {trendDir === 'up' && <ArrowUp size={12} />}
          {trendDir === 'down' && <ArrowDown size={12} />}
          {trend}
        </div>
      )}
    </div>
  )
}

// ───── Badge ─────
export function Badge({
  variant,
  children,
}: {
  variant: 'green' | 'amber' | 'red' | 'cyan'
  children: ReactNode
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// ───── Progress bar ─────
export function ProgressBar({
  pct,
  background,
  height = 4,
}: {
  pct: number
  background: string
  height?: number
}) {
  return (
    <div className="prog-bar" style={{ height }}>
      <div className="prog-fill" style={{ width: `${pct}%`, background }} />
    </div>
  )
}
