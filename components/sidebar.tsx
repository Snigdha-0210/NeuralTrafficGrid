'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutGrid,
  Keyboard,
  CircleDot,
  Waves,
  Sparkles,
  Play,
  FileText,
  Settings,
  Menu,
  X,
  Hexagon,
} from 'lucide-react'

type NavLink = { href: string; label: string; icon: React.ReactNode }
type NavGroup = { section: string; items: NavLink[] }

const NAV: NavGroup[] = [
  {
    section: 'Core',
    items: [
      { href: '/', label: 'Command Center', icon: <LayoutGrid size={16} /> },
      { href: '/input', label: 'Traffic Input', icon: <Keyboard size={16} /> },
    ],
  },
  {
    section: 'AI Engine',
    items: [
      { href: '/neural', label: 'Neural Network', icon: <CircleDot size={16} /> },
      { href: '/fuzzy', label: 'Fuzzy Logic', icon: <Waves size={16} /> },
      { href: '/pso', label: 'PSO Optimization', icon: <Sparkles size={16} /> },
    ],
  },
  {
    section: 'Tools',
    items: [
      { href: '/simulation', label: 'Simulation Lab', icon: <Play size={16} /> },
      { href: '/reports', label: 'Reports', icon: <FileText size={16} /> },
      { href: '/settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        aria-label="Toggle navigation"
        onClick={() => setOpen((o) => !o)}
        className="fixed left-4 top-4 z-[120] rounded-lg p-2 md:hidden"
        style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', color: 'var(--cyan)' }}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-[100] flex w-[220px] min-w-[220px] flex-col transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bg1)',
          borderRight: '1px solid var(--bdr)',
        }}
      >
        <div
          className="px-4 py-5"
          style={{ borderBottom: '1px solid var(--bdr)' }}
        >
          <div
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[2px]"
            style={{ color: 'var(--cyan)' }}
          >
            <Hexagon size={16} /> Neural Traffic Grid
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: 'var(--t2)' }}>
            AI Traffic Intelligence Platform
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {NAV.map((group) => (
            <div key={group.section}>
              <div
                className="px-2 pb-1 pt-3 text-[10px] uppercase tracking-[1.5px]"
                style={{ color: 'var(--t2)' }}
              >
                {group.section}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="relative mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-all"
                    style={{
                      color: active ? 'var(--cyan)' : 'var(--t2)',
                      background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                      border: active
                        ? '1px solid rgba(0,229,255,0.2)'
                        : '1px solid transparent',
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-sm"
                        style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}
                      />
                    )}
                    <span className="w-[18px] text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div
          className="px-4 py-3 text-[11px]"
          style={{ borderTop: '1px solid var(--bdr)', color: 'var(--t2)' }}
        >
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--green)', boxShadow: 'var(--glow-green)' }}
          />
          All systems operational
        </div>
      </aside>
    </>
  )
}
