import os
import sys
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

def ingest_mixed_data():
    print("Starting mixed data ingestion for ML training...")
    
    client = MongoClient(settings.MONGO_DATABASE_URI)
    db = client[settings.MONGO_DB]
    collection = db["traffic_logs"]
    
    print("Clearing existing data...")
    collection.delete_many({})
    
    dataset_path = r"D:\Infosys\MachineLearningCVE\Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
    
    print(f"Reading dataset from {dataset_path}...")
    try:
        # Read a larger chunk to ensure we capture both BENIGN and DDoS attacks
        # The attacks usually start later in the file.
        df = pd.read_csv(dataset_path, nrows=200000)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {dataset_path}")
        return
        
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    df = df.replace([float('inf'), float('-inf')], None)
    df = df.dropna()
    
    # Split by label
    df_benign = df[df['label'] == 'BENIGN'].head(10000)
    df_ddos = df[df['label'] == 'DDoS'].head(5000)
    
    if len(df_ddos) == 0:
        print("WARNING: No DDoS samples found in the first 200,000 rows. Reading more...")
        df = pd.read_csv(dataset_path)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        df = df.replace([float('inf'), float('-inf')], None).dropna()
        df_benign = df[df['label'] == 'BENIGN'].head(10000)
        df_ddos = df[df['label'] == 'DDoS'].head(5000)

    # Combine and shuffle
    df_mixed = pd.concat([df_benign, df_ddos]).sample(frac=1).reset_index(drop=True)
    
    if 'timestamp' in df_mixed.columns:
        df_mixed['timestamp'] = pd.to_datetime(df_mixed['timestamp'], format='mixed', dayfirst=True, errors='coerce')
        df_mixed = df_mixed.dropna(subset=['timestamp'])

    records = df_mixed.to_dict(orient='records')
    print(f"Inserting {len(records)} mixed records into MongoDB...")
    
    # Insert in chunks to avoid document size limit errors
    chunk_size = 5000
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        collection.insert_many(chunk)
        print(f"Inserted chunk of {len(chunk)} records")
        
    print(f"Successfully inserted a total of {collection.count_documents({})} mixed records.")
    print("Label distribution in DB:")
    for label in collection.distinct("label"):
        print(f" - {label}: {collection.count_documents({'label': label})}")
    
if __name__ == "__main__":
    ingest_mixed_data()
