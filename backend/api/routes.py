from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.traffic_service import TrafficService

router = APIRouter()
traffic_service = TrafficService()

class PredictionRequest(BaseModel):
    north_count: float
    south_count: float
    east_count: float
    west_count: float
    avg_speed: float
    queue_length: float
    time_of_day: float

class FuzzyRequest(BaseModel):
    congestion_score: float
    waiting_time: float

class DirectionData(BaseModel):
    count: float
    queue: float
    wait_time: float

class OptimizationRequest(BaseModel):
    north: DirectionData
    south: DirectionData
    east: DirectionData
    west: DirectionData
    avg_speed: float
    time_of_day: float

@router.post("/predict-congestion")
async def predict_congestion(req: PredictionRequest):
    try:
        score = traffic_service.predict_congestion(req.model_dump())
        return {"congestion_score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fuzzy-decision")
async def fuzzy_decision(req: FuzzyRequest):
    try:
        duration = traffic_service.get_fuzzy_decision(req.congestion_score, req.waiting_time)
        return {"green_signal_duration": duration}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize")
async def optimize_signals(req: OptimizationRequest):
    try:
        result = traffic_service.optimize_signals(req.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/simulation")
async def get_simulation_state():
    # Placeholder for a complete end-to-end integration demo endpoint
    # You would typically pass the current state of the simulation from the frontend
    # and receive the next optimal state.
    # We will simulate a default request here for demonstration.
    mock_request = {
        "north": {"count": 40, "queue": 15, "wait_time": 60},
        "south": {"count": 20, "queue": 5, "wait_time": 20},
        "east": {"count": 60, "queue": 25, "wait_time": 90},
        "west": {"count": 10, "queue": 2, "wait_time": 10},
        "avg_speed": 35.0,
        "time_of_day": 17.5
    }
    try:
        result = traffic_service.optimize_signals(mock_request)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
