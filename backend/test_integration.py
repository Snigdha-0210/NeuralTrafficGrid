from services.traffic_service import TrafficService
import pprint

print("Initializing TrafficService...")
ts = TrafficService()

mock_request = {
    "north": {"count": 40, "queue": 15, "wait_time": 60},
    "south": {"count": 20, "queue": 5, "wait_time": 20},
    "east": {"count": 60, "queue": 25, "wait_time": 90},
    "west": {"count": 10, "queue": 2, "wait_time": 10},
    "avg_speed": 35.0,
    "time_of_day": 17.5
}

print("\n--- Running Optimization ---")
result = ts.optimize_signals(mock_request)
pprint.pprint(result)
print("\nSuccess! End-to-end traffic optimization completed.")
