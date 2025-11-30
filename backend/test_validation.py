import pandas as pd
from datetime import datetime, timedelta
import logging

# Mock logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_data(start_date, end_date, data_start, data_end):
    print(f"Request: {start_date} - {end_date}")
    print(f"Data: {data_start} - {data_end}")
    
    req_start = pd.to_datetime(start_date)
    req_end = pd.to_datetime(end_date)
    
    d_start = pd.to_datetime(data_start)
    d_end = pd.to_datetime(data_end)
    
    if d_end < req_start or d_start > req_end:
        print("Validation FAILED (Expected)")
        return False
    else:
        print("Validation PASSED")
        return True

# Test Case 1: Data completely before request
print("--- Test Case 1 ---")
validate_data("2025-01-01", "2025-02-01", "2024-01-01", "2024-02-01")

# Test Case 2: Data completely after request (User's case)
print("\n--- Test Case 2 ---")
validate_data("2025-01-01", "2025-02-01", "2025-08-20", "2025-08-21")

# Test Case 3: Valid overlap
print("\n--- Test Case 3 ---")
validate_data("2025-01-01", "2025-02-01", "2025-01-15", "2025-01-20")
