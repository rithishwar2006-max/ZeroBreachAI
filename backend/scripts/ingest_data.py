import os
import sys
import pandas as pd
from pymongo import MongoClient
import urllib.parse
from dotenv import load_dotenv

# Ensure we can import from core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

def ingest_sample_data():
    print("Starting data ingestion...")
    
    # 1. Connect to MongoDB
    client = MongoClient(settings.MONGO_DATABASE_URI)
    db = client[settings.MONGO_DB]
    collection = db["traffic_logs"]
    
    # Check if we already have data to prevent duplicates
    if collection.count_documents({}) > 0:
        print("Data already exists in MongoDB. Skipping ingestion to avoid duplicates.")
        print(f"Current document count: {collection.count_documents({})}")
        return

    # 2. Load dataset
    # The user has CICIDS2017 in D:\Infosys\MachineLearningCVE
    dataset_path = r"D:\Infosys\MachineLearningCVE\Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
    
    print(f"Reading dataset from {dataset_path}...")
    try:
        # Read only a sample (10,000 rows) for pipeline testing
        df = pd.read_csv(dataset_path, nrows=10000)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {dataset_path}")
        return
        
    print(f"Successfully loaded {len(df)} rows.")
    
    # 3. Clean columns (strip whitespace, normalize names)
    df.columns = df.columns.str.strip()
    
    # Rename some key columns to match our standard if needed
    # (e.g., 'Label' -> 'label', 'Source IP' -> 'source_ip')
    # For now, we will just use the raw columns but lowercase them and replace spaces with underscores
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    
    # Drop rows with NaN or Infinity (common in CICIDS2017)
    df = df.replace([float('inf'), float('-inf')], None)
    df = df.dropna()
    
    # Add a timestamp field for time-series visualization in the dashboard
    # The dataset has 'timestamp' but it might be a string. Let's create an ISODate
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='mixed', dayfirst=True, errors='coerce')
        # Drop rows where timestamp couldn't be parsed
        df = df.dropna(subset=['timestamp'])

    # 4. Convert to list of dicts and insert
    records = df.to_dict(orient='records')
    
    if not records:
        print("No valid records to insert after cleaning.")
        return
        
    print(f"Inserting {len(records)} cleaned records into MongoDB...")
    result = collection.insert_many(records)
    
    print(f"Successfully inserted {len(result.inserted_ids)} records.")
    
if __name__ == "__main__":
    ingest_sample_data()
