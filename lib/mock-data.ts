// ───────────────────────────────────────────────────────────────
// Centralized mock data for the Neural Traffic Grid platform.
// All screens read realistic demo values from here.
// ───────────────────────────────────────────────────────────────

export type Trend = { dir: 'up' | 'down'; text: string }

export type HeroMetric = {
  label: string
  value: string
  accent: string
  color: string
  trend: Trend
}

export const heroMetrics: HeroMetric[] = [
  {
    label: 'Total Vehicles',
    value: '4,827',
    accent: 'var(--cyan)',
    color: 'var(--cyan)',
    trend: { dir: 'up', text: '12.3% vs last hour' },
  },
  {
    label: 'Active Junctions',
    value: '48',
    accent: 'var(--green)',
    color: 'var(--green)',
    trend: { dir: 'up', text: '3 newly activated' },
  },
  {
    label: 'Avg Wait Time',
    value: '23s',
    accent: 'var(--amber)',
    color: 'var(--amber)',
    trend: { dir: 'down', text: '4.1s improvement' },
  },
  {
    label: 'Traffic Efficiency',
    value: '87%',
    accent: 'var(--ncyan)',
    color: 'var(--ncyan)',
    trend: { dir: 'up', text: '6% from AI opt.' },
  },
  {
    label: 'Congestion Index',
    value: '0.38',
    accent: 'var(--red)',
    color: 'var(--red)',
    trend: { dir: 'down', text: '0.07 reduced' },
  },
]

// ───── Dashboard charts ─────
export const hours = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']

export const congestionTrend = hours.map((h, i) => ({
  hour: h,
  congestion: [0.2, 0.5, 0.72, 0.65, 0.4, 0.38, 0.45, 0.42, 0.38, 0.44, 0.58, 0.79, 0.82][i],
}))

export const densityWaitTrend = hours.map((h, i) => ({
  hour: h,
  vehicles: [120, 340, 480, 420, 280, 260, 310, 295, 275, 320, 410, 560, 590][i],
  wait: [8, 24, 35, 29, 16, 14, 18, 17, 15, 19, 28, 42, 45][i],
}))

// ───── Junction signal phases ─────
export type Phase = {
  ns: 'green' | 'amber' | 'red'
  ew: 'green' | 'amber' | 'red'
  dur: number
  label: string
}

export const phases: Phase[] = [
  { ns: 'green', ew: 'red', dur: 30, label: 'N-S GREEN' },
  { ns: 'amber', ew: 'red', dur: 4, label: 'N-S AMBER' },
  { ns: 'red', ew: 'green', dur: 25, label: 'E-W GREEN' },
  { ns: 'red', ew: 'amber', dur: 4, label: 'E-W AMBER' },
]

export const baseVehicleCounts = { n: 38, s: 21, e: 45, w: 17 }

// ───── Traffic Input presets ─────
export type InputState = {
  north: number
  south: number
  east: number
  west: number
  speed: number
  queue: number
}

export const defaultInputs: InputState = {
  north: 38,
  south: 21,
  east: 45,
  west: 17,
  speed: 42,
  queue: 65,
}

export const presets: Record<string, InputState & { emergency: boolean; label: string }> = {
  rush: { north: 120, south: 110, east: 130, west: 95, speed: 25, queue: 180, emergency: false, label: 'Rush Hour' },
  normal: { north: 45, south: 40, east: 55, west: 35, speed: 45, queue: 80, emergency: false, label: 'Normal Flow' },
  low: { north: 12, south: 8, east: 15, west: 10, speed: 65, queue: 20, emergency: false, label: 'Low Traffic' },
  emg: { north: 60, south: 55, east: 70, west: 45, speed: 35, queue: 120, emergency: true, label: 'Emergency' },
}

export const timeOfDayOptions = [
  'Morning Peak (07:00–09:00)',
  'Midday Normal (11:00–14:00)',
  'Evening Peak (17:00–19:00)',
  'Night Low (22:00–05:00)',
]

// ───── Neural Network ─────
export const neuralStats = [
  { label: 'Prediction Score', value: '0.912', accent: 'var(--cyan)', color: 'var(--cyan)', trend: '94.1% accuracy', up: true },
  { label: 'Confidence', value: '89%', accent: 'var(--green)', color: 'var(--green)', trend: 'F1-score: 0.887', up: false },
  { label: 'Traffic Category', value: 'HIGH PEAK', accent: 'var(--amber)', color: 'var(--amber)', trend: 'Evening rush pattern', up: false, small: true },
  { label: 'Model Loss', value: '0.043', accent: 'var(--ncyan)', color: 'var(--ncyan)', trend: '0.012 improved', up: true, down: true },
]

export const featureImportance = [
  { name: 'N-S Vehicle Count', val: 0.82 },
  { name: 'E-W Vehicle Count', val: 0.91 },
  { name: 'Queue Length', val: 0.74 },
  { name: 'Time of Day', val: 0.67 },
  { name: 'Average Speed', val: 0.55 },
  { name: 'Historical Pattern', val: 0.48 },
]

export const nnPredictions = Array.from({ length: 12 }, (_, i) => ({
  interval: i + 1,
  predicted: [0.7, 0.75, 0.82, 0.79, 0.85, 0.88, 0.84, 0.91, 0.89, 0.93, 0.9, 0.912][i],
  actual: [0.68, 0.78, 0.8, 0.81, 0.83, 0.87, 0.86, 0.9, 0.91, 0.92, 0.88, 0.91][i],
}))

export const modelMetrics = [
  { metric: 'Accuracy', value: '94.1%', color: 'var(--green)', badge: 'green', status: 'Excellent' },
  { metric: 'Precision', value: '91.8%', color: 'var(--green)', badge: 'green', status: 'Excellent' },
  { metric: 'Recall', value: '88.5%', color: 'var(--cyan)', badge: 'cyan', status: 'Good' },
  { metric: 'F1-Score', value: '0.887', color: 'var(--cyan)', badge: 'cyan', status: 'Good' },
  { metric: 'MSE', value: '0.043', color: 'var(--amber)', badge: 'amber', status: 'Moderate' },
  { metric: 'Epochs', value: '500', color: 'var(--t1)', badge: 'cyan', status: 'Trained' },
]

// ───── Fuzzy Logic ─────
export const fuzzyFlow = [
  { icon: '🔢', title: 'Crisp Inputs', sub: 'Traffic density, wait time', accent: 'cyan' },
  { icon: '🔀', title: 'Fuzzification', sub: 'Membership functions' },
  { icon: '📐', title: 'Rule Evaluation', sub: 'IF-THEN rules' },
  { icon: '⊕', title: 'Aggregation', sub: 'Combine outputs' },
  { icon: '✓', title: 'Defuzzification', sub: 'Signal duration', accent: 'green' },
]

export const fuzzyRules = [
  { text: 'IF density is HIGH AND wait is LONG → signal is LONG', active: true, color: '#00E5FF' },
  { text: 'IF density is HIGH AND wait is MEDIUM → signal is MEDIUM', active: true, color: '#00E5FF' },
  { text: 'IF density is MEDIUM AND wait is LONG → signal is MEDIUM', active: false, color: '#FFC93C' },
  { text: 'IF density is LOW AND wait is SHORT → signal is SHORT', active: false, color: '#00FF88' },
  { text: 'IF density is HIGH AND wait is SHORT → signal is MEDIUM', active: false, color: '#FFC93C' },
  { text: 'IF density is LOW AND wait is LONG → signal is MEDIUM', active: false, color: '#94A3B8' },
  { text: 'IF density is MEDIUM AND wait is MEDIUM → signal is MEDIUM', active: false, color: '#94A3B8' },
  { text: 'IF density is LOW AND wait is MEDIUM → signal is SHORT', active: false, color: '#94A3B8' },
]

export const membershipSets = {
  density: { labels: ['Low', 'Medium', 'High'], colors: ['#00FF88', '#FFC93C', '#FF4D6D'] },
  wait: { labels: ['Short', 'Medium', 'Long'], colors: ['#4CC9F0', '#FFC93C', '#FF4D6D'] },
  output: { labels: ['Short', 'Medium', 'Long'], colors: ['#00F5D4', '#FFC93C', '#00E5FF'] },
}

// ───── PSO ─────
export const psoStats = {
  fitness: '0.847',
  gain: '23.4%',
  particles: 30,
  iterationsTotal: 100,
}

export const psoTimingComparison = [
  { dir: 'North', current: 30, optimized: 32 },
  { dir: 'South', current: 25, optimized: 22 },
  { dir: 'East', current: 30, optimized: 34 },
  { dir: 'West', current: 25, optimized: 22 },
]

// ───── Reports ─────
export const dailySummary = [
  { label: 'Peak Hour Vehicles', value: '6,234', color: 'var(--cyan)' },
  { label: 'Avg Efficiency', value: '87.2%', color: 'var(--green)' },
  { label: 'AI Interventions', value: '142', color: 'var(--amber)' },
  { label: 'Incidents Avoided', value: '8', color: 'var(--ncyan)' },
]

export const weeklySummary = [
  { label: 'Total Vehicles', value: '41,820', color: 'var(--cyan)' },
  { label: 'Best Day', value: 'Tuesday', color: 'var(--green)' },
  { label: 'Wait Time Reduced', value: '31%', color: 'var(--amber)' },
  { label: 'CO2 Saved (est.)', value: '2.1 tons', color: 'var(--ncyan)' },
]

export const monthlySummary = [
  { label: 'Total Vehicles', value: '178,400', color: 'var(--cyan)' },
  { label: 'Avg Congestion Idx', value: '0.41', color: 'var(--amber)' },
  { label: 'PSO Improvements', value: '+23.4%', color: 'var(--green)' },
  { label: 'Uptime', value: '99.7%', color: 'var(--ncyan)' },
]

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const performanceTrend = months.map((m, i) => ({
  month: m,
  efficiency: [72, 74, 76, 78, 79, 82, 84, 85, 87, 86, 88, 87][i],
  wait: [38, 36, 34, 31, 30, 27, 26, 24, 23, 24, 22, 23][i],
}))

export const trafficLog = [
  { time: '18:45', junction: 'Sector 7-Alpha', vehicles: 342, wait: 21, eff: '91%', status: 'Optimal', badge: 'green' },
  { time: '18:30', junction: 'Sector 3-Beta', vehicles: 287, wait: 34, eff: '74%', status: 'Moderate', badge: 'amber' },
  { time: '18:15', junction: 'Sector 9-Delta', vehicles: 421, wait: 48, eff: '61%', status: 'Congested', badge: 'red' },
  { time: '18:00', junction: 'Sector 2-Gamma', vehicles: 198, wait: 14, eff: '96%', status: 'Optimal', badge: 'green' },
  { time: '17:45', junction: 'Sector 5-Zeta', vehicles: 315, wait: 29, eff: '82%', status: 'Good', badge: 'cyan' },
]

// ───── Settings ─────
export const systemStatus = [
  { label: 'AI Engine', status: 'Online', badge: 'green', dot: '●' },
  { label: 'Neural Network', status: 'Active', badge: 'green', dot: '●' },
  { label: 'Fuzzy Logic Module', status: 'Active', badge: 'green', dot: '●' },
  { label: 'PSO Optimizer', status: 'Standby', badge: 'cyan', dot: '●' },
  { label: 'Data Feed', status: 'Live', badge: 'green', dot: '●' },
  { label: 'Junction Network', status: '2 Offline', badge: 'amber', dot: '⚠' },
]
