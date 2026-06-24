import numpy as np
import pyswarms as ps

class TrafficPSOOptimizer:
    def __init__(self, target_times, queues, counts, bounds=(10, 90)):
        """
        Initialize the PSO Optimizer.
        target_times: Array of [north, south, east, west] times recommended by Fuzzy logic
        queues: Array of [north, south, east, west] queue lengths
        counts: Array of [north, south, east, west] vehicle counts
        """
        self.target_times = np.array(target_times)
        self.queues = np.array(queues)
        self.counts = np.array(counts)
        self.bounds = bounds
        
    def fitness_function(self, x):
        """
        x: matrix of shape (n_particles, 4) containing signal times [n, s, e, w]
        Returns an array of shape (n_particles,) containing fitness values
        """
        n_particles = x.shape[0]
        penalties = np.zeros(n_particles)
        
        for i in range(n_particles):
            particle = x[i]
            
            # 1. Penalty for deviating from fuzzy logic recommendations
            # We want PSO to fine-tune, not completely discard fuzzy logic
            fuzzy_deviation = np.sum(np.abs(particle - self.target_times)) * 0.5
            
            # 2. Penalty for cycle time being too long
            # Total cycle time shouldn't exceed ~240s
            cycle_time = np.sum(particle)
            cycle_penalty = max(0, cycle_time - 240) * 2.0
            
            # 3. Penalty for unfairness (high queue but short time)
            # Higher queue should mean higher percentage of cycle time
            total_queue = np.sum(self.queues)
            if total_queue > 0:
                ideal_ratios = self.queues / total_queue
                actual_ratios = particle / cycle_time
                unfairness = np.sum(np.abs(ideal_ratios - actual_ratios)) * 100
            else:
                unfairness = 0
                
            penalties[i] = fuzzy_deviation + cycle_penalty + unfairness
            
        return penalties
        
    def optimize(self, n_particles=20, iters=50):
        # Set-up hyperparameters
        options = {'c1': 0.5, 'c2': 0.3, 'w': 0.9}
        
        # Call instance of PSO
        # Bounds: (min_bound_array, max_bound_array)
        min_bound = np.ones(4) * self.bounds[0]
        max_bound = np.ones(4) * self.bounds[1]
        bounds = (min_bound, max_bound)
        
        optimizer = ps.single.GlobalBestPSO(n_particles=n_particles, dimensions=4, options=options, bounds=bounds)
        
        # Perform optimization
        # Use suppress_print=True to avoid printing to stdout in production, though pyswarms may not fully support it.
        # We catch the output
        best_cost, best_pos = optimizer.optimize(self.fitness_function, iters=iters, verbose=False)
        
        return {
            'best_cost': float(best_cost),
            'optimized_times': {
                'north': float(best_pos[0]),
                'south': float(best_pos[1]),
                'east': float(best_pos[2]),
                'west': float(best_pos[3])
            }
        }

if __name__ == "__main__":
    # Test
    target = [45, 30, 60, 30]
    q = [10, 5, 20, 2]
    c = [30, 15, 50, 10]
    
    pso = TrafficPSOOptimizer(target, q, c)
    result = pso.optimize(iters=20)
    print("Optimization Result:", result)
