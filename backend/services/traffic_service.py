import os
import torch
import joblib
import pandas as pd
from typing import Dict, Any, List

# Add parent dir to path so we can import from other modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.ann_model import CongestionPredictorANN
from fuzzy.controller import FuzzyTrafficController
from optimization.pso import TrafficPSOOptimizer

class TrafficService:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "models", "ann_weights.pth")
        self.scaler_path = os.path.join(os.path.dirname(__file__), "..", "models", "scaler.pkl")
        
        self.model = None
        self.scaler = None
        self.fuzzy_controller = FuzzyTrafficController()
        
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.scaler = joblib.load(self.scaler_path)
            self.model = CongestionPredictorANN()
            self.model.load_state_dict(torch.load(self.model_path, map_location=torch.device('cpu'), weights_only=True))
            self.model.eval()
            print("ANN Model and Scaler loaded successfully.")
        else:
            print(f"Warning: Model or scaler not found at {self.model_path}. Please train the model first.")
            
    def predict_congestion(self, features: Dict[str, float]) -> float:
        """
        features: dict with keys: north_count, south_count, east_count, west_count, avg_speed, queue_length, time_of_day
        """
        if self.model is None or self.scaler is None:
            # Fallback mock prediction if model not trained
            return 0.5
            
        # Extract features in correct order
        feature_names = ['north_count', 'south_count', 'east_count', 'west_count', 'avg_speed', 'queue_length', 'time_of_day']
        try:
            x_raw = [[features[k] for k in feature_names]]
        except KeyError as e:
            raise ValueError(f"Missing feature: {e}")
            
        x_scaled = self.scaler.transform(x_raw)
        x_tensor = torch.FloatTensor(x_scaled)
        
        with torch.no_grad():
            output = self.model(x_tensor)
            
        return float(output.item())
        
    def get_fuzzy_decision(self, congestion_score: float, waiting_time: float) -> float:
        return self.fuzzy_controller.decide_green_time(congestion_score, waiting_time)
        
    def optimize_signals(self, junction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        junction_data: dict containing counts, queues, and waiting times for all 4 directions.
        Example: {
            'north': {'count': 30, 'queue': 10, 'wait_time': 45},
            'south': {'count': 15, 'queue': 5, 'wait_time': 20},
            ...
            'avg_speed': 40,
            'time_of_day': 14.5
        }
        """
        directions = ['north', 'south', 'east', 'west']
        
        counts = [junction_data[d]['count'] for d in directions]
        queues = [junction_data[d]['queue'] for d in directions]
        wait_times = [junction_data[d]['wait_time'] for d in directions]
        
        # 1. Predict congestion for each direction using the overall junction state
        # In a real scenario, you might calculate a combined score. Here we use the ANN.
        features = {
            'north_count': counts[0],
            'south_count': counts[1],
            'east_count': counts[2],
            'west_count': counts[3],
            'avg_speed': junction_data.get('avg_speed', 30.0),
            'queue_length': sum(queues) / 4.0, # average queue
            'time_of_day': junction_data.get('time_of_day', 12.0)
        }
        
        overall_congestion = self.predict_congestion(features)
        
        # 2. Get fuzzy recommendations for each direction
        target_times = []
        for d_wait in wait_times:
            recommended_time = self.get_fuzzy_decision(overall_congestion, d_wait)
            target_times.append(recommended_time)
            
        # 3. Optimize using PSO
        pso = TrafficPSOOptimizer(target_times=target_times, queues=queues, counts=counts)
        optimization_result = pso.optimize(iters=30)
        
        return {
            'overall_congestion': overall_congestion,
            'fuzzy_targets': dict(zip(directions, target_times)),
            'pso_result': optimization_result
        }
