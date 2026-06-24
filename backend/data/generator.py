import pandas as pd
import numpy as np
import os

def generate_dataset(num_records=15000, output_path="dataset.csv"):
    np.random.seed(42)
    
    # Time of day: 0.0 to 23.99
    time_of_day = np.random.uniform(0.0, 24.0, num_records)
    
    # Define rush hour multiplier
    rush_hour_multiplier = np.ones(num_records)
    for i in range(num_records):
        t = time_of_day[i]
        if (7.5 <= t <= 10.5) or (16.5 <= t <= 19.5):
            # Rush hours get 1.5x to 2.5x more traffic
            rush_hour_multiplier[i] = np.random.uniform(1.5, 2.5)
        elif (0.0 <= t <= 5.0):
            # Night hours get very little traffic
            rush_hour_multiplier[i] = np.random.uniform(0.1, 0.4)
            
    # Generate features based on multiplier
    north_count = np.clip(np.random.normal(30 * rush_hour_multiplier, 10).astype(int), 0, 100)
    south_count = np.clip(np.random.normal(30 * rush_hour_multiplier, 10).astype(int), 0, 100)
    east_count = np.clip(np.random.normal(25 * rush_hour_multiplier, 8).astype(int), 0, 100)
    west_count = np.clip(np.random.normal(25 * rush_hour_multiplier, 8).astype(int), 0, 100)
    
    # Speed is inversely related to traffic counts
    total_counts = north_count + south_count + east_count + west_count
    # max possible total count roughly 400
    speed_factor = 1.0 - (total_counts / 400.0) 
    avg_speed = np.clip(np.random.normal(50 * speed_factor + 10, 5), 10, 60)
    
    # Queue length is directly related to traffic counts and inversely to speed
    queue_base = (total_counts / 8.0) * (60.0 / avg_speed)
    queue_length = np.clip(np.random.normal(queue_base, 5).astype(int), 0, 50)
    
    # Calculate congestion score based on all features
    # High counts -> high congestion
    # Low speed -> high congestion
    # High queue -> high congestion
    normalized_counts = total_counts / 400.0
    normalized_speed = 1.0 - (avg_speed / 60.0)
    normalized_queue = queue_length / 50.0
    
    # Weight the components
    congestion_score = (0.4 * normalized_counts) + (0.3 * normalized_speed) + (0.3 * normalized_queue)
    
    # Add some random noise
    congestion_score += np.random.normal(0, 0.05, num_records)
    congestion_score = np.clip(congestion_score, 0.0, 1.0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'north_count': north_count,
        'south_count': south_count,
        'east_count': east_count,
        'west_count': west_count,
        'avg_speed': avg_speed,
        'queue_length': queue_length,
        'time_of_day': time_of_day,
        'congestion_score': congestion_score
    })
    
    df.to_csv(output_path, index=False)
    print(f"Generated {num_records} records and saved to {output_path}")

if __name__ == "__main__":
    generate_dataset()
