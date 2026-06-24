export type DirectionData = {
  count: number
  queue: number
  wait_time: number
}

export type OptimizationRequest = {
  north: DirectionData
  south: DirectionData
  east: DirectionData
  west: DirectionData
  avg_speed: number
  time_of_day: number
}

export type PSOOptimizationResult = {
  overall_congestion: number
  fuzzy_targets: {
    north: number
    south: number
    east: number
    west: number
  }
  pso_result: {
    best_cost: number
    optimized_times: {
      north: number
      south: number
      east: number
      west: number
    }
  }
}

const API_BASE = 'http://localhost:8000/api'

export type PredictionRequest = {
  north_count: number
  south_count: number
  east_count: number
  west_count: number
  avg_speed: number
  queue_length: number
  time_of_day: number
}

export type FuzzyRequest = {
  congestion_score: number
  waiting_time: number
}

export async function optimizeSignals(req: OptimizationRequest): Promise<PSOOptimizationResult> {
  const response = await fetch(`${API_BASE}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  
  if (!response.ok) {
    throw new Error('Failed to optimize signals')
  }
  
  return response.json()
}

export async function getSimulationState(): Promise<{ status: string, data: PSOOptimizationResult }> {
  const response = await fetch(`${API_BASE}/simulation`)
  if (!response.ok) throw new Error('Failed to fetch simulation state')
  return response.json()
}

export async function predictCongestion(req: PredictionRequest): Promise<{ congestion_score: number }> {
  const response = await fetch(`${API_BASE}/predict-congestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!response.ok) throw new Error('Failed to predict congestion')
  return response.json()
}

export async function getFuzzyDecision(req: FuzzyRequest): Promise<{ green_signal_duration: number }> {
  const response = await fetch(`${API_BASE}/fuzzy-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!response.ok) throw new Error('Failed to get fuzzy decision')
  return response.json()
}
