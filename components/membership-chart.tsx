'use client'

import { useEffect, useRef } from 'react'

// Ports drawMembership() from the approved design: three triangular fuzzy sets.
export function MembershipChart({
  labels,
  colors,
  height = 150,
}: {
  labels: string[]
  colors: string[]
  height?: number
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const cw = canvas.offsetWidth || 300
      const h = height
      canvas.width = cw
      canvas.height = h
      ctx.clearRect(0, 0, cw, h)

      const shapes = [
        [
          { x: 0, y: h - 20 },
          { x: cw * 0.3, y: 20 },
          { x: cw * 0.5, y: h - 20 },
        ],
        [
          { x: cw * 0.25, y: h - 20 },
          { x: cw * 0.5, y: 20 },
          { x: cw * 0.75, y: h - 20 },
        ],
        [
          { x: cw * 0.5, y: h - 20 },
          { x: cw * 0.7, y: 20 },
          { x: cw, y: h - 20 },
        ],
      ]

      shapes.forEach((pts, i) => {
        ctx.beginPath()
        pts.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.strokeStyle = colors[i]
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = colors[i] + '22'
        ctx.fill()
        const mx = pts[1].x
        const my = pts[1].y - 12
        ctx.fillStyle = colors[i]
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], mx, my)
      })

      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 18)
      ctx.lineTo(cw, h - 18)
      ctx.stroke()
      ctx.fillStyle = '#94A3B8'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('0', 0, h - 4)
      ctx.textAlign = 'right'
      ctx.fillText('1', cw, h - 4)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [labels, colors, height])

  return <canvas ref={ref} height={height} style={{ width: '100%' }} aria-hidden="true" />
}
