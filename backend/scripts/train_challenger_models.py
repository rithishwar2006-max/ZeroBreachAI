import pandas as pd
import numpy as np
import glob
import os
import joblib
from sklearn.ensemble import ExtraTreesClassifier
from xgboost import XGBClassifier
import gc

MODEL_DIR = r'd:\Infosys\backend\ml\saved_models'
feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))
label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))

print(f"Loaded {len(feature_names)} features and {len(label_encoder.classes_)} classes.")
print(f"Classes: {label_encoder.classes_}")

dataset_dir = r'D:\Infosys\2017_improved'
all_files = glob.glob(os.path.join(dataset_dir, '*.csv'))

feature_drop = [
    'attempted_category', 'id', 'timestamp', 'flow_id',
    'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol'
]

label_mapping = {
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
}

df_list = []
for file in all_files:
    print(f"Reading {os.path.basename(file)}...")
    chunks = []
    for chunk in pd.read_csv(file, chunksize=100000):
        chunk.columns = chunk.columns.str.strip().str.lower().str.replace(' ', '_')
        chunk = chunk.drop(columns=[col for col in feature_drop if col in chunk.columns], errors='ignore')
        chunk = chunk.replace([np.inf, -np.inf], np.nan).dropna()
        
        chunk['label'] = chunk['label'].replace(label_mapping)
        
        benign = chunk[chunk['label'] == 'BENIGN']
        attack = chunk[chunk['label'] != 'BENIGN']
        
        if len(benign) > 4000:
            benign = benign.sample(n=4000, random_state=42)
            
        chunks.append(pd.concat([benign, attack]))
        del benign, attack, chunk
        gc.collect()
        
    temp_df = pd.concat(chunks).drop_duplicates()
    df_list.append(temp_df)
    del chunks, temp_df
    gc.collect()

df = pd.concat(df_list, ignore_index=True)
del df_list
gc.collect()

print(f"Total sampled dataset: {len(df)} rows across {df['label'].nunique()} classes.")

# Align columns with feature_names
X = df.drop(columns=['label'], errors='ignore')
X = X.select_dtypes(include=[np.number]).fillna(0)
X = X.reindex(columns=feature_names, fill_value=0.0)

# Filter rows that belong to known classes
mask = df['label'].isin(label_encoder.classes_)
X = X[mask]
y_str = df['label'][mask]
y = label_encoder.transform(y_str)

print(f"Final training set: {X.shape[0]} rows, {X.shape[1]} features.")
print(f"Class distribution:\n{y_str.value_counts()}")

# Train ExtraTreesClassifier as Model 2 (Challenger)
print("\n--- Training ExtraTrees Classifier ---")
et_model = ExtraTreesClassifier(
    n_estimators=100,
    max_depth=25,
    class_weight='balanced',
    n_jobs=-1,
    random_state=42
)
et_model.fit(X, y)
joblib.dump(et_model, os.path.join(MODEL_DIR, 'extra_trees_multiclass.pkl'))
print("Saved extra_trees_multiclass.pkl successfully!")

# Also Train XGBoost as Model 2 alternative
print("\n--- Training XGBoost Classifier ---")
xgb_model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    n_jobs=-1,
    eval_metric='mlogloss',
    random_state=42
)
xgb_model.fit(X, y)
joblib.dump(xgb_model, os.path.join(MODEL_DIR, 'xgb_multiclass_81.pkl'))
print("Saved xgb_multiclass_81.pkl successfully!")
print("ALL DONE!")
