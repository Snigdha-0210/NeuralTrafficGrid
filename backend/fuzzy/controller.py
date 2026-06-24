import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

class FuzzyTrafficController:
    def __init__(self):
        # Antecedents (Inputs)
        self.congestion = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'congestion')
        self.waiting_time = ctrl.Antecedent(np.arange(0, 121, 1), 'waiting_time')
        
        # Consequent (Output)
        self.green_duration = ctrl.Consequent(np.arange(10, 91, 1), 'green_duration')
        
        # Membership functions for Congestion (0 to 1)
        self.congestion['low'] = fuzz.trapmf(self.congestion.universe, [0, 0, 0.3, 0.4])
        self.congestion['medium'] = fuzz.trimf(self.congestion.universe, [0.3, 0.5, 0.7])
        self.congestion['high'] = fuzz.trapmf(self.congestion.universe, [0.6, 0.7, 1.0, 1.0])
        
        # Membership functions for Waiting Time (0 to 120 seconds)
        self.waiting_time['short'] = fuzz.trapmf(self.waiting_time.universe, [0, 0, 30, 45])
        self.waiting_time['moderate'] = fuzz.trimf(self.waiting_time.universe, [30, 60, 90])
        self.waiting_time['long'] = fuzz.trapmf(self.waiting_time.universe, [75, 90, 120, 120])
        
        # Membership functions for Green Signal Duration (10 to 90 seconds)
        self.green_duration['short'] = fuzz.trapmf(self.green_duration.universe, [10, 10, 25, 35])
        self.green_duration['medium'] = fuzz.trimf(self.green_duration.universe, [30, 45, 60])
        self.green_duration['long'] = fuzz.trapmf(self.green_duration.universe, [50, 60, 90, 90])
        
        # Rules
        rule1 = ctrl.Rule(self.congestion['low'] & self.waiting_time['short'], self.green_duration['short'])
        rule2 = ctrl.Rule(self.congestion['low'] & self.waiting_time['moderate'], self.green_duration['short'])
        rule3 = ctrl.Rule(self.congestion['low'] & self.waiting_time['long'], self.green_duration['medium'])
        
        rule4 = ctrl.Rule(self.congestion['medium'] & self.waiting_time['short'], self.green_duration['short'])
        rule5 = ctrl.Rule(self.congestion['medium'] & self.waiting_time['moderate'], self.green_duration['medium'])
        rule6 = ctrl.Rule(self.congestion['medium'] & self.waiting_time['long'], self.green_duration['long'])
        
        rule7 = ctrl.Rule(self.congestion['high'] & self.waiting_time['short'], self.green_duration['medium'])
        rule8 = ctrl.Rule(self.congestion['high'] & self.waiting_time['moderate'], self.green_duration['long'])
        rule9 = ctrl.Rule(self.congestion['high'] & self.waiting_time['long'], self.green_duration['long'])
        
        # Control System
        self.traffic_ctrl = ctrl.ControlSystem([
            rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9
        ])
        
        self.traffic_sim = ctrl.ControlSystemSimulation(self.traffic_ctrl)
        
    def decide_green_time(self, congestion_val, wait_time_val):
        # Clip inputs
        congestion_val = max(0.0, min(1.0, congestion_val))
        wait_time_val = max(0, min(120, wait_time_val))
        
        self.traffic_sim.input['congestion'] = congestion_val
        self.traffic_sim.input['waiting_time'] = wait_time_val
        
        try:
            self.traffic_sim.compute()
            return float(self.traffic_sim.output['green_duration'])
        except Exception as e:
            # Fallback if computation fails
            return 30.0

if __name__ == "__main__":
    # Test the controller
    controller = FuzzyTrafficController()
    print("Test 1 - High Congestion, Long Wait:", controller.decide_green_time(0.9, 100))
    print("Test 2 - Low Congestion, Short Wait:", controller.decide_green_time(0.2, 15))
    print("Test 3 - Medium Congestion, Moderate Wait:", controller.decide_green_time(0.5, 60))
