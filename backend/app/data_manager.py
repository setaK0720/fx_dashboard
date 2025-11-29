import pandas as pd
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Define data directory relative to this file
# backend/app/data_manager.py -> backend/data/historical
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "historical")

class DataManager:
    def __init__(self, mt5_client):
        self.mt5_client = mt5_client
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)

    def _get_file_path(self, symbol, timeframe):
        # Sanitize symbol
        safe_symbol = symbol.replace("/", "").replace(":", "")
        return os.path.join(DATA_DIR, f"{safe_symbol}_{timeframe}.csv")

    def download_data(self, symbol, timeframe, start_date, end_date):
        """
        Download data from MT5 and save/append to CSV.
        start_date, end_date: datetime objects
        """
        logger.info(f"Downloading data for {symbol} {timeframe} from {start_date} to {end_date}")
        rates = self.mt5_client.get_candles_range(symbol, timeframe, start_date, end_date)
        
        if rates is None or len(rates) == 0:
            logger.warning("No data received from MT5")
            return False
            
        # Convert to DataFrame
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        
        file_path = self._get_file_path(symbol, timeframe)
        
        if os.path.exists(file_path):
            try:
                existing_df = pd.read_csv(file_path)
                existing_df['time'] = pd.to_datetime(existing_df['time'])
                
                combined_df = pd.concat([existing_df, df])
                combined_df.drop_duplicates(subset=['time'], keep='last', inplace=True)
                combined_df.sort_values('time', inplace=True)
                combined_df.to_csv(file_path, index=False)
            except Exception as e:
                logger.error(f"Error updating CSV file: {e}")
                return False
        else:
            df.to_csv(file_path, index=False)
            
        logger.info(f"Saved {len(df)} records to {file_path}")
        return True

    def load_data(self, symbol, timeframe, start_date=None, end_date=None):
        """
        Load data from local CSV.
        start_date, end_date: datetime objects or strings (YYYY-MM-DD)
        """
        file_path = self._get_file_path(symbol, timeframe)
        if not os.path.exists(file_path):
            return None
            
        try:
            df = pd.read_csv(file_path)
            df['time'] = pd.to_datetime(df['time'])
            
            if start_date:
                df = df[df['time'] >= pd.to_datetime(start_date)]
            if end_date:
                df = df[df['time'] <= pd.to_datetime(end_date)]
                
            # Convert to list of dicts, handling timestamp serialization if needed
            # For JSON response, we might want to convert timestamp to string or int
            # But let's return dicts with datetime objects for now, FastAPI handles serialization usually?
            # Actually FastAPI/Pydantic might prefer strings or specific types.
            # Let's convert time to ISO string for safety in API response
            df['time'] = df['time'].apply(lambda x: x.isoformat())
            
            return df.to_dict('records')
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return None

    def get_available_data(self):
        """
        List available data files.
        """
        files = []
        if not os.path.exists(DATA_DIR):
            return []
            
        for f in os.listdir(DATA_DIR):
            if f.endswith(".csv"):
                # Parse filename: symbol_timeframe.csv
                try:
                    name = f.replace(".csv", "")
                    parts = name.split("_")
                    timeframe = parts[-1]
                    symbol = "_".join(parts[:-1])
                    
                    # Get date range from file
                    df = pd.read_csv(os.path.join(DATA_DIR, f), usecols=['time'])
                    if not df.empty:
                        start = df['time'].min()
                        end = df['time'].max()
                        count = len(df)
                        files.append({
                            "symbol": symbol,
                            "timeframe": timeframe,
                            "start": start,
                            "end": end,
                            "count": count,
                            "filename": f
                        })
                except Exception as e:
                    logger.warning(f"Error parsing file {f}: {e}")
                    continue
        return files
