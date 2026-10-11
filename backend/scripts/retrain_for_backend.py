import pandas as pd
import numpy as np
import glob
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import gc

print("Loading data using chunking (Maximum Memory Optimization)...")
dataset_dir = r'D:\Infosys\2017_improved'
all_files = glob.glob(os.path.join(dataset_dir, '*.csv'))

feature_drop = [
    'attempted_category',
    'id',
    'timestamp',
    'flow_id',
    'src_ip',
    'dst_ip',
    'src_port',
    'dst_port',
    'protocol'
]

df_list = []
for file in all_files:
    print(f"Reading {os.path.basename(file)} in chunks...")
    chunks = []
    
    # Read CSV in 100k chunks to avoid allocating huge memory blocks
    for chunk in pd.read_csv(file, chunksize=100000):
        chunk.columns = chunk.columns.str.strip().str.lower().str.replace(' ', '_')
        chunk = chunk.drop(columns=[col for col in feature_drop if col in chunk.columns], errors='ignore')
        chunk = chunk.replace([np.inf, -np.inf], np.nan).dropna()
        
        # We only keep all attacks, and a fraction of BENIGN to save RAM
        benign = chunk[chunk['label'] == 'BENIGN']
        attack = chunk[chunk['label'] != 'BENIGN']
        
        # If a chunk has 80k benign, we only need ~5k of them to build our 200k base over the entire dataset
        if len(benign) > 5000:
            benign = benign.sample(n=5000, random_state=42)
            
        chunks.append(pd.concat([benign, attack]))
        
        del benign
        del attack
        del chunk
        gc.collect()
        
    temp_df = pd.concat(chunks)
    del chunks
    
    # Drop duplicates per file
    temp_df = temp_df.drop_duplicates()
    df_list.append(temp_df)
    del temp_df
    gc.collect()

df = pd.concat(df_list, ignore_index=True)
del df_list
gc.collect()

print("Merging labels...")
df['label'] = df['label'].replace({
    'Infiltration - Attempted': 'Infiltration',
    'Infiltration - Portscan': 'Infiltration',
    'FTP-Patator - Attempted': 'FTP-Patator',
    'SSH-Patator - Attempted': 'SSH-Patator',
    'DoS GoldenEye - Attempted': 'DoS GoldenEye',
    'DoS Hulk - Attempted': 'DoS Hulk',
    'DoS Slowhttptest - Attempted': 'DoS Slowhttptest',
    'DoS Slowloris - Attempted': 'DoS Slowloris',
    'Botnet - Attempted': 'Botnet',
    'Web Attack - Brute Force': 'Web Attack',
    'Web Attack - Brute Force - Attempted': 'Web Attack',
    'Web Attack - SQL Injection': 'Web Attack',
    'Web Attack - SQL Injection - Attempted': 'Web Attack',
    'Web Attack - XSS': 'Web Attack',
    'Web Attack - XSS - Attempted': 'Web Attack'
})

print("Splitting data...")
X_raw = df.drop(columns=['label'], errors='ignore')
X_raw = X_raw.select_dtypes(include=[np.number]).fillna(0)
y_raw = df['label']

le = LabelEncoder()
y_enc = le.fit_transform(y_raw)

print("Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,           
    class_weight='balanced',  
    n_jobs=-1,                
    random_state=42
)
model.fit(X_raw, y_enc)

print("Saving models...")
os.makedirs(r'd:\Infosys\backend\ml\saved_models', exist_ok=True)
feature_names = X_raw.columns.tolist()
joblib.dump(feature_names, r'd:\Infosys\backend\ml\saved_models\feature_names.pkl')
joblib.dump(model, r'd:\Infosys\backend\ml\saved_models\rf_multiclass.pkl')
joblib.dump(le, r'd:\Infosys\backend\ml\saved_models\label_encoder.pkl')

print("Success! Models are now compatible with Python 3.8 backend.")
