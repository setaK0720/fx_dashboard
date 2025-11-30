import pandas as pd
import os
from datetime import datetime, timedelta

# Mock data
DATA_DIR = "test_data"
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def get_file_path(symbol, timeframe):
    return os.path.join(DATA_DIR, f"{symbol}_{timeframe}.csv")

def save_data(symbol, timeframe, data):
    file_path = get_file_path(symbol, timeframe)
    df = pd.DataFrame(data)
    df['time'] = pd.to_datetime(df['time'])
    
    if os.path.exists(file_path):
        existing_df = pd.read_csv(file_path)
        existing_df['time'] = pd.to_datetime(existing_df['time'])
        
        combined_df = pd.concat([existing_df, df])
        combined_df.drop_duplicates(subset=['time'], keep='last', inplace=True)
        combined_df.sort_values('time', inplace=True)
        combined_df.to_csv(file_path, index=False)
        print(f"Updated {file_path}. Count: {len(combined_df)}")
        print(f"Range: {combined_df['time'].min()} - {combined_df['time'].max()}")
    else:
        df.to_csv(file_path, index=False)
        print(f"Created {file_path}. Count: {len(df)}")

# 1. Create initial data (Jan 2023)
data1 = [{'time': datetime(2023, 1, 1) + timedelta(days=i), 'close': 100+i} for i in range(10)]
save_data("TEST", "D1", data1)

# 2. Add disjoint data (Jan 2024)
data2 = [{'time': datetime(2024, 1, 1) + timedelta(days=i), 'close': 200+i} for i in range(10)]
save_data("TEST", "D1", data2)

# 3. Check file content
file_path = get_file_path("TEST", "D1")
df = pd.read_csv(file_path)
print("\nFinal Data:")
print(df)
