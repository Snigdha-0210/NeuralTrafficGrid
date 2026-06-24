// Semicircular confidence gauge — pure SVG, matches the approved design.
export function ConfidenceGauge({
  value,
  caption = 'CONFIDENCE LEVEL',
}: {
  value: number // 0-100
  caption?: string
}) {
  // Arc from 40,130 to 260,130 (radius 110). Full arc length ~345.
  const arcLen = 345
  const offset = arcLen - (arcLen * value) / 100
  // Needle angle: 180deg (left) to 0deg (right) mapped to value.
  const angle = Math.PI - (Math.PI * value) / 100
  const cx = 150
  const cy = 130
  const r = 78
  const nx = cx + r * Math.cos(angle)
  const ny = cy - r * Math.sin(angle)

  return (
    <svg viewBox="0 0 300 160" width="100%" className="mt-2" role="img" aria-label={`${caption} ${value}%`}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4D6D" />
          <stop offset="40%" stopColor="#FFC93C" />
          <stop offset="70%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
      <path
        d="M 40 130 A 110 110 0 0 1 260 130"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M 40 130 A 110 110 0 0 1 260 130"
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={arcLen}
        strokeDashoffset={offset}
      />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill="#131F2D" stroke="#00E5FF" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="#00E5FF" />
      <text x="150" y="100" textAnchor="middle" fill="#F8FAFC" fontSize="28" fontWeight="700">
        {value}%
      </text>
      <text x="150" y="118" textAnchor="middle" fill="#94A3B8" fontSize="11">
        {caption}
      </text>
      <text x="40" y="150" fill="#FF4D6D" fontSize="10">
        LOW
      </text>
      <text x="130" y="30" fill="#FFC93C" fontSize="10">
        MED
      </text>
      <text x="240" y="150" fill="#00E5FF" fontSize="10">
        HIGH
      </text>
    </svg>
  )
}
